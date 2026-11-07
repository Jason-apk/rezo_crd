export function humanizePingError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("timeout")
  ) {
    return "Pas de connexion internet. Le partage reprendra automatiquement.";
  }
  if (lower.includes("location") || lower.includes("permission")) {
    return "La localisation semble désactivée. Vérifie-la dans les réglages.";
  }
  if (lower.includes("hors zone")) {
    return "Position hors de la zone couverte par REZO.";
  }
  return "Le partage a rencontré un souci. Il reprendra automatiquement.";
}
