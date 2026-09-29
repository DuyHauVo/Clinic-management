import { useMemo } from 'react';
import type { SharedSchemaField } from '../utils/shared/excelXmlShared';

export interface FileUploadStatsLike {
  matchedFields?: string[];
  matchedColumnsMap?: Record<string, string>;
  detectedHeaders?: Record<number, string>;
  selectedSheet?: string;
  sheetName?: string;
  fileName?: string;
  totalRows?: number;
}

export function useSchemaMappingProps(
  schemaFields: readonly SharedSchemaField[] | SharedSchemaField[],
  fileUploadStats: FileUploadStatsLike | null | undefined
) {
  return useMemo(() => {
    // 1. Compute matchedKeys
    let matchedKeys: string[];
    if (fileUploadStats?.matchedFields) {
      matchedKeys = fileUploadStats.matchedFields;
    } else if (fileUploadStats?.detectedHeaders) {
      matchedKeys = Object.values(fileUploadStats.detectedHeaders);
    } else {
      matchedKeys = schemaFields.map((f) => f.key);
    }

    // 2. Compute matchedColumnsMap
    let matchedColumnsMap: Record<string, string>;
    if (fileUploadStats?.matchedColumnsMap) {
      matchedColumnsMap = fileUploadStats.matchedColumnsMap;
    } else if (fileUploadStats?.detectedHeaders) {
      matchedColumnsMap = Object.fromEntries(
        Object.entries(fileUploadStats.detectedHeaders).map(([colIdx, key]) => [
          key,
          `Cột ${Number(colIdx) + 1} (${key})`,
        ])
      );
    } else {
      matchedColumnsMap = {};
    }

    return {
      schemaFields,
      matchedKeys,
      matchedColumnsMap,
      sheetName: fileUploadStats?.selectedSheet || fileUploadStats?.sheetName,
      fileName: fileUploadStats?.fileName,
      totalRows: fileUploadStats?.totalRows,
    };
  }, [schemaFields, fileUploadStats]);
}
