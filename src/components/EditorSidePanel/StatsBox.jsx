import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { databases } from "../../data/databases";
import { useAreas, useDiagram, useEnums, useNotes, useTypes } from "../../hooks";

function computeMaxDepth(tables, relationships) {
  if (!tables.length) return 0;

  const tableIds = new Set(tables.map((t) => t.id));
  const adjacency = new Map();

  tables.forEach((table) => {
    adjacency.set(table.id, []);
  });

  relationships.forEach((rel) => {
    if (!tableIds.has(rel.startTableId) || !tableIds.has(rel.endTableId)) {
      return;
    }
    adjacency.get(rel.startTableId).push(rel.endTableId);
    adjacency.get(rel.endTableId).push(rel.startTableId);
  });

  let maxDepth = 0;

  for (const startId of adjacency.keys()) {
    const visited = new Set([startId]);
    const queue = [[startId, 0]];
    let index = 0;

    while (index < queue.length) {
      const [currentId, depth] = queue[index++];
      if (depth > maxDepth) maxDepth = depth;

      const neighbors = adjacency.get(currentId) || [];
      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([neighborId, depth + 1]);
        }
      });
    }
  }

  return maxDepth;
}

export default function StatsBox() {
  const { t } = useTranslation();
  const { tables, relationships, database } = useDiagram();
  const { areasCount } = useAreas();
  const { notesCount } = useNotes();
  const { typesCount } = useTypes();
  const { enumsCount } = useEnums();

  const maxDepth = useMemo(
    () => computeMaxDepth(tables, relationships),
    [tables, relationships],
  );

  const stats = [
    { label: t("tables"), value: tables.length },
    { label: t("relationships"), value: relationships.length },
    { label: t("subject_areas"), value: areasCount },
    { label: t("notes"), value: notesCount },
  ];

  if (databases[database].hasTypes) {
    stats.push({ label: t("types"), value: typesCount });
  }

  if (databases[database].hasEnums) {
    stats.push({ label: t("enums"), value: enumsCount });
  }

  stats.push({ label: "Max depth", value: maxDepth });

  return (
    <div className="border-t border-color">
      <div className="px-3 py-3">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          Stats
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md bg-zinc-50 px-2 py-2">
              <div className="text-[11px] text-zinc-500">{stat.label}</div>
              <div className="text-sm font-semibold text-zinc-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
