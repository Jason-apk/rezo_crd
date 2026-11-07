import { useEffect, useRef, useState } from "react";
import { getDeviceId } from "../../lib/deviceId";
import { supabase } from "../../lib/supabase";

const ARRIVED_TO_FEEDBACK_DELAY_MS = 5000;
const FEEDBACK_TIMEOUT_MS = 20000;

export function usePostTripFeedback(isArrived: boolean) {
  const [showFeedback, setShowFeedback] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isArrived) {
      setShowFeedback(false);
      return;
    }
    const t = setTimeout(
      () => setShowFeedback(true),
      ARRIVED_TO_FEEDBACK_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [isArrived]);

  useEffect(() => {
    if (!showFeedback) return;
    timeoutRef.current = setTimeout(async () => {
      await logFeedback("no_response");
      setShowFeedback(false);
    }, FEEDBACK_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showFeedback]);

  async function respond(positive: boolean) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await logFeedback(positive ? "feedback_positive" : "feedback_negative");
    setShowFeedback(false);
  }

  return { showFeedback, respond };
}

async function logFeedback(action: string) {
  const deviceHash = await getDeviceId();
  await supabase.from("events").insert({ device_hash: deviceHash, action });
}
