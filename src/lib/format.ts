export function formatPrice(value: number): string {
  const grouped = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${grouped} RSD`;
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
