import React from 'react';
import { FileSpreadsheet, Check } from 'lucide-react';

export type ThemeColor = 'cyan' | 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber';

export interface ExcelUploadStatsBarProps {
  selectedSheet: string;
  totalRows: number;
  rowUnitLabel?: string;
  matchedColumnsCount: number;
  totalColumnsCount: number;
  fileName?: string;
  availableSheets?: string[];
  themeColor?: ThemeColor;
  onOpenSchemaModal?: () => void;
  onSwitchSheet?: (sheetName: string) => void;
  extraBadge?: React.ReactNode;
}

const themeStyles: Record<
  ThemeColor,
  {
    btnHoverText: string;
    btnBg: string;
    btnBorder: string;
    textStrong: string;
    badgeBg: string;
    iconColor: string;
    sheetActiveBg: string;
  }
> = {
  cyan: {
    btnHoverText: 'hover:text-cyan-700',
    btnBg: 'bg-cyan-50 hover:bg-cyan-100',
    btnBorder: 'border-cyan-200',
    textStrong: 'text-cyan-700',
    badgeBg: 'bg-cyan-600',
    iconColor: 'text-cyan-600',
    sheetActiveBg: 'bg-cyan-600',
  },
  indigo: {
    btnHoverText: 'hover:text-indigo-700',
    btnBg: 'bg-indigo-50 hover:bg-indigo-100',
    btnBorder: 'border-indigo-200',
    textStrong: 'text-indigo-700',
    badgeBg: 'bg-indigo-600',
    iconColor: 'text-indigo-600',
    sheetActiveBg: 'bg-indigo-600',
  },
  emerald: {
    btnHoverText: 'hover:text-emerald-700',
    btnBg: 'bg-emerald-50 hover:bg-emerald-100',
    btnBorder: 'border-emerald-200',
    textStrong: 'text-emerald-700',
    badgeBg: 'bg-emerald-600',
    iconColor: 'text-emerald-600',
    sheetActiveBg: 'bg-emerald-600',
  },
  blue: {
    btnHoverText: 'hover:text-blue-700',
    btnBg: 'bg-blue-50 hover:bg-blue-100',
    btnBorder: 'border-blue-200',
    textStrong: 'text-blue-700',
    badgeBg: 'bg-blue-600',
    iconColor: 'text-blue-600',
    sheetActiveBg: 'bg-blue-600',
  },
  purple: {
    btnHoverText: 'hover:text-purple-700',
    btnBg: 'bg-purple-50 hover:bg-purple-100',
    btnBorder: 'border-purple-200',
    textStrong: 'text-purple-700',
    badgeBg: 'bg-purple-600',
    iconColor: 'text-purple-600',
    sheetActiveBg: 'bg-purple-600',
  },
  amber: {
    btnHoverText: 'hover:text-amber-700',
    btnBg: 'bg-amber-50 hover:bg-amber-100',
    btnBorder: 'border-amber-200',
    textStrong: 'text-amber-700',
    badgeBg: 'bg-amber-600',
    iconColor: 'text-amber-600',
    sheetActiveBg: 'bg-amber-600',
  },
};

export const ExcelUploadStatsBar: React.FC<ExcelUploadStatsBarProps> = ({
  selectedSheet,
  totalRows,
  rowUnitLabel = 'dòng',
  matchedColumnsCount,
  totalColumnsCount,
  fileName,
  availableSheets = [],
  themeColor = 'cyan',
  onOpenSchemaModal,
  onSwitchSheet,
  extraBadge,
}) => {
  const currentTheme = themeStyles[themeColor] || themeStyles.cyan;

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-500">
            Sheet đã nạp:{' '}
            <strong className="text-slate-900 font-bold">{selectedSheet}</strong>
          </span>

          <span className="text-slate-500">
            Dòng trích xuất:{' '}
            <strong className="text-emerald-700 font-bold">
              {totalRows} {rowUnitLabel}
            </strong>
          </span>

          {onOpenSchemaModal && (
            <button
              type="button"
              onClick={onOpenSchemaModal}
              className={`text-slate-600 ${currentTheme.btnHoverText} transition-all flex items-center gap-1.5 ${currentTheme.btnBg} px-2.5 py-1 rounded-lg border ${currentTheme.btnBorder} font-medium cursor-pointer shadow-2xs group`}
              title="Bấm để xem chi tiết đối soát từng cột"
            >
              <span>Cột khớp chuẩn:</span>
              <strong className={`${currentTheme.textStrong} font-bold group-hover:underline`}>
                {matchedColumnsCount}/{totalColumnsCount} trường
              </strong>
              <span
                className={`text-[10px] ${currentTheme.badgeBg} text-white px-1.5 py-0.2 rounded-full font-bold ml-0.5`}
              >
                Chi tiết
              </span>
            </button>
          )}

          {extraBadge}
        </div>

        {fileName && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">File nguồn:</span>
            <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
              {fileName}
            </span>
          </div>
        )}
      </div>

      {/* Switch sheet buttons if workbook contains multiple sheets */}
      {availableSheets && availableSheets.length > 1 && onSwitchSheet && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <FileSpreadsheet size={13} className={currentTheme.iconColor} />
            Các Sheet trong file:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableSheets.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSwitchSheet(s)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  s === selectedSheet
                    ? `${currentTheme.sheetActiveBg} text-white shadow-xs font-bold`
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {s}
                {s === selectedSheet && <Check size={11} className="inline ml-1" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
