import { useMemo } from 'react';
import type { DataCategory } from './useDataCategoryStore';

export type StructuredDataCategory = DataCategory & { level: number };

export const useDataCategoryTree = (categories: DataCategory[]) => {
  return useMemo(() => {
    if (!categories) return [];

    const visitedIds = new Set<number>();
    const map = new Map<number | string, DataCategory[]>(); 

    // Group by parent
    categories.forEach(cat => {
        const pId = cat.parent || 'root';
        if (!map.has(pId)) map.set(pId, []);
        map.get(pId)!.push(cat);
    });

    // Recursive builder
    const buildList = (parentId: number | string, level: number): StructuredDataCategory[] => {
        const items = map.get(parentId) || [];
        items.sort((a, b) => a.id - b.id); 
        
        let result: StructuredDataCategory[] = [];
        for (const item of items) {
            result.push({ ...item, level });
            visitedIds.add(item.id);
            result = result.concat(buildList(item.id, level + 1));
        }
        return result;
    };

    let flatList = buildList('root', 0);

    // Handle orphans (items whose parents are not in the current list)
    categories.forEach(cat => {
        if (!visitedIds.has(cat.id)) {
             const parentIsPresent = categories.some(c => c.id === cat.parent);
             
             if (!parentIsPresent) {
                 flatList.push({ ...cat, level: 0 });
                 visitedIds.add(cat.id);
                 flatList = flatList.concat(buildList(cat.id, 1));
             }
        }
    });
    
    // Final safe-guard
    categories.forEach(cat => {
         if (!visitedIds.has(cat.id)) {
             flatList.push({ ...cat, level: 0 });
             visitedIds.add(cat.id);
         }
    });

    return flatList;
  }, [categories]);
};
