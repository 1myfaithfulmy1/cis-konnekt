/** Маленькая пульсирующая розовая точка — рядом с событиями «сегодня/сейчас». */
export function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0">
      <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-accent2 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent2" />
    </span>
  );
}
