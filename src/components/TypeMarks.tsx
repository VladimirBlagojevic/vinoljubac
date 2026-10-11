import { Badge } from "./ui/badge";

import { wineTags, type Wine } from "@/data/wines";
import { TYPE_CLASS, TYPE_LABEL } from "@/lib/wine-labels";

export function TypeMarks({ wine }: { wine: Wine }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {wineTags(wine).map((tag) => (
        <li key={tag}>
          <Badge
            className={`h-7 border px-2.5 text-xs font-semibold ${TYPE_CLASS[tag]}`}
          >
            {TYPE_LABEL[tag]}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
