/** NBS srednji kurs, kursna lista formirana 9. 10. 2026. */
export const EUR_RSD_MIDDLE_RATE = 117.3657;

function groupDigits(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatPrice(value: number): string {
  const dinar = `${groupDigits(value)} RSD`;
  if (!Number.isFinite(value) || value <= 0) return dinar;
  const euros = Math.round(value / EUR_RSD_MIDDLE_RATE);
  return `${dinar} · ${groupDigits(euros)} €`;
}

export function fold(value: string): string {
  return value
    .toLocaleLowerCase("sr")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "dj")
    .replace(/ø/g, "o")
    .replace(/ł/g, "l")
    .replace(/['’‘]/g, "");
}
