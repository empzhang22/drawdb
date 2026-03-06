import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useAreas,
  useDiagram,
  useEnums,
  useNotes,
  useTypes,
} from "../../hooks";
import { databases } from "../../data/databases";

function computeGraphStats(tables, relationships) {
  if (!tables.length) {
    return { maxDepth: 0, isolatedTables: 0 };
  }

  const adjacency = new Map();
  const tableIds = new Set(tables.map((table) => table.id));

  tables.forEach((table) => {
    adjacency.set(table.id, new Set());
  });

  relationships.forEach((rel) => {
    if (!tableIds.has(rel.startTableId) || !tableIds.has(rel.endTableId)) {
      return;
    }
    adjacency.get(rel.startTableId).add(rel.endTableId);
    adjacency.get(rel.endTableId).add(rel.startTableId);
  });

  let isolatedTables = 0;
  adjacency.forEach((neighbors) => {
    if (neighbors.size === 0) isolatedTables += 1;
  });

  let maxDepth = 0;
  const ids = Array.from(adjacency.keys());

  for (const startId of ids) {
    const visited = new Set([startId]);
    const queue = [[startId, 0]];

    while (queue.length) {
      const [currentId, depth] = queue.shift();
      if (depth > maxDepth) maxDepth = depth;
      const neighbors = adjacency.get(currentId);
      if (!neighbors) continue;
      neighbors.forEach((nextId) => {
        if (visited.has(nextId)) return;
        visited.add(nextId);
        queue.push([nextId, depth + 1]);
      });
    }
  }

  return { maxDepth, isolatedTables };
}

export default function StatsBox() {
  const { t } = useTranslation();
  const { tables, relationships, database } = useDiagram();
  const { areasCount } = useAreas();
  const { notesCount } = useNotes();
  const { typesCount } = useTypes();
  const { enumsCount } = useEnums();

  const totalFields = useMemo(
    () =>
      tables.reduce((total, table) => total + (table.fields?.length || 0), 0),
    [tables],
  );

  const { maxDepth, isolatedTables } = useMemo(
    () => computeGraphStats(tables, relationships),
    [tables, relationships],
  );

  const stats = [
    { label: t("tables"), value: tables.length },
    { label: t("relationships"), value: relationships.length },
    { label: t("fields", { defaultValue: "Fields" }), value: totalFields },
    {
      label: t("max_depth", { defaultValue: "Max depth" }),
      value: maxDepth,
    },
    {
      label: t("isolated_tables", { defaultValue: "Isolated tables" }),
      value: isolatedTables,
    },
    { label: t("subject_areas"), value: areasCount },
    { label: t("notes"), value: notesCount },
  ];

  if (databases[database].hasTypes) {
    stats.push({ label: t("types"), value: typesCount });
  }

  if (databases[database].hasEnums) {
    stats.push({ label: t("enums"), value: enumsCount });
  }

  return (
    <div className="border-t-2 border-color px-3 py-2">
      <div className="text-xs uppercase tracking-wide opacity-60">
        {t("stats", { defaultValue: "Stats" })}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="truncate opacity-80">{stat.label}</span>
            <span className="font-semibold tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
