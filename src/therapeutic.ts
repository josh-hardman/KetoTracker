/** CSS class for therapeutic tier (tier-3, tier-4, tier-5) or empty string */
export function tierClass(tier: number | null | undefined): string {
  if (!tier || tier < 3) return ''
  return `tier-${tier}`
}

/** Badge character for high-tier foods, or null */
export function tierBadge(tier: number | null | undefined): string | null {
  if (tier === 5) return '✦'
  if (tier === 4) return '·'
  return null
}
