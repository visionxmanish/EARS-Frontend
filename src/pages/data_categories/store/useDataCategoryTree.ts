import { useMemo } from 'react';
import type { DataCategory } from './useDataCategoryStore';

export type StructuredDataCategory = DataCategory & { level: number };

/**
 * Build a hierarchical flattened list of categories
 * where top-level items have level 0 and children are nested.
 */
export const useDataCategoryTree = (categories: DataCategory[]) => {
  return useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const visitedIds = new Set<number>();
    const map = new Map<number | null, DataCategory[]>(); // use null for top-level

    // ✅ Group by parent
    categories.forEach(cat => {
      const pId = cat.parent ?? null; // keep as number or null, never string
      if (!map.has(pId)) map.set(pId, []);
      map.get(pId)!.push(cat);
    });

    // ✅ Recursive tree flatten
    const buildList = (parentId: number | null, level: number): StructuredDataCategory[] => {
      const items = map.get(parentId) || [];
      // optional: sort children by name or id
      items.sort((a, b) => a.name.localeCompare(b.name, "ne", { sensitivity: "base" }));

      let result: StructuredDataCategory[] = [];
      for (const item of items) {
        result.push({ ...item, level });
        visitedIds.add(item.id);
        result = result.concat(buildList(item.id, level + 1));
      }
      return result;
    };

    let flatList = buildList(null, 0);

    // ✅ Handle orphaned categories (whose parent is missing)
    categories.forEach(cat => {
      if (!visitedIds.has(cat.id)) {
        flatList.push({ ...cat, level: 0 });
        visitedIds.add(cat.id);
        flatList = flatList.concat(buildList(cat.id, 1));
      }
    });

    return flatList;
  }, [categories]);
};
