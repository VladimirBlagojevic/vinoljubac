import type { TypeTag } from "@/data/wines";

export const TYPE_LABEL: Record<TypeTag, string> = {
  belo: "Belo",
  crveno: "Crveno",
  roze: "Roze",
  narandzasto: "Narandžasto",
  penusavo: "Penušavo",
};

export const TYPE_CLASS: Record<TypeTag, string> = {
  belo: "border-[#7a5b10] bg-[#f6e7b8] text-[#3f2e04]",
  crveno: "border-[#8f1d2c] bg-[#f6d0d4] text-[#6b1020]",
  roze: "border-[#9d174d] bg-[#f8d5e4] text-[#7a1240]",
  narandzasto: "border-[#9a3412] bg-[#fde0c2] text-[#7c2d12]",
  penusavo: "border-[#1e3a5f] bg-[#d7e3f2] text-[#12243d]",
};

export const TYPE_STYLE: Record<
  TypeTag,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  belo: { backgroundColor: "#f3d98a", color: "#3f2e04", borderColor: "#7a5b10" },
  crveno: { backgroundColor: "#9f1239", color: "#fffaf8", borderColor: "#9f1239" },
  roze: { backgroundColor: "#be185d", color: "#fffaf8", borderColor: "#be185d" },
  narandzasto: { backgroundColor: "#c2410c", color: "#fffaf8", borderColor: "#c2410c" },
  penusavo: { backgroundColor: "#1e3a5f", color: "#f8fafc", borderColor: "#1e3a5f" },
};

export const TYPE_ORDER: TypeTag[] = [
  "belo",
  "crveno",
  "roze",
  "narandzasto",
  "penusavo",
];
