import React from 'react';
import {
  Download,
  Sparkles,
  Trash2,
  FileCode,
  Send,
  Plus
} from 'lucide-react';
import type { ThemeColor } from './ExcelUploadStatsBar';

export interface DanhMucActionToolbarProps {
  itemsCount: number;
  templateLabel?: string;
  templateTooltip?: string;
  sampleTooltip?: string;
  xmlLabel?: string;
  xmlTooltip?: string;
  apiLabel?: string;
  apiTooltip?: string;
  addNewLabel?: string;
  themeColor?: ThemeColor;
  onDownloadTemplate: () => void;
  onLoadSample: () => void;
  onClearData: () => void;
  onOpenXmlModal: () => void;
  onOpenApiTab?: () => void;
  onAddNew: () => void;
}

const themePrimaryStyles: Record<
  ThemeColor,
  {
    xmlBtn: string;
    addBtn: string;
  }
> = {
  cyan: {
    xmlBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
    addBtn: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20',
  },
  indigo: {
    xmlBtn: 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700',
    addBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20',
  },
  emerald: {
    xmlBtn: 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700',
    addBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20',
  },
  blue: {
    xmlBtn: 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1677ff]',
    addBtn: 'bg-[#1677ff] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20',
  },
  purple: {
    xmlBtn: 'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700',
    addBtn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20',
  },
  amber: {
    xmlBtn: 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900',
    addBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20',
  },
};

export const DanhMucActionToolbar: React.FC<DanhMucActionToolbarProps> = ({
  itemsCount,
  templateLabel = 'Tải File Mẫu Excel',
  templateTooltip,
  sampleTooltip,
  xmlLabel = 'Xem Cấu Trúc XML',
  xmlTooltip,
  apiLabel = 'Gửi Cổng BHXH (API)',
  apiTooltip,
  addNewLabel = 'Thêm Mới Bản Ghi',
  themeColor = 'blue',
  onDownloadTemplate,
  onLoadSample,
  onClearData,
  onOpenXmlModal,
  onOpenApiTab,
  onAddNew,
}) => {
  const currentTheme = themePrimaryStyles[themeColor] || themePrimaryStyles.blue;

  return (
    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
      {/* Left Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          title={templateTooltip}
        >
          <Download size={14} className="text-slate-500" />
          <span>{templateLabel}</span>
        </button>

        <button
          type="button"
          onClick={onLoadSample}
          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
          title={sampleTooltip}
        >
          <Sparkles size={14} className="text-amber-600" />
          <span>Nạp Dữ Liệu Mẫu</span>
        </button>

        {itemsCount > 0 && (
          <button
            type="button"
            onClick={onClearData}
            className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Xóa toàn bộ danh sách hiện tại"
          >
            <Trash2 size={14} className="text-rose-500" />
            <span>Xóa Hết ({itemsCount})</span>
          </button>
        )}
      </div>

      {/* Right Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenXmlModal}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${currentTheme.xmlBtn}`}
          title={xmlTooltip}
        >
          <FileCode size={14} className={themeColor === 'cyan' ? 'text-cyan-400' : undefined} />
          <span>{xmlLabel}</span>
        </button>

        {onOpenApiTab && (
          <button
            type="button"
            onClick={onOpenApiTab}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
            title={apiTooltip}
          >
            <Send size={14} />
            <span>{apiLabel}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onAddNew}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${currentTheme.addBtn}`}
        >
          <Plus size={15} />
          <span>{addNewLabel}</span>
        </button>
      </div>
    </div>
  );
};
