import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import type { SchemaFieldDef } from './SchemaMappingModal';

interface SchemaMappingCardProps {
  title?: string;
  loaiHsBadge?: string;
  schemaFields: SchemaFieldDef[];
  matchedKeys: string[];
  matchedColumnsMap?: { [schemaKey: string]: string };
  sheetName?: string;
  fileName?: string;
  totalRows?: number;
  defaultExpanded?: boolean;
}

export const SchemaMappingCard: React.FC<SchemaMappingCardProps> = ({
  title = 'Bảng Đối Soát & Ánh Xạ Cột Chuẩn BHXH',
  loaiHsBadge,
  schemaFields,
  matchedKeys = [],
  matchedColumnsMap = {},
  sheetName,
  fileName,
  totalRows,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'matched' | 'missing'>('all');

  const matchedSet = new Set(matchedKeys);
  const matchedCount = schemaFields.filter((f) => matchedSet.has(f.key)).length;
  const requiredFields = schemaFields.filter((f) => f.required);
  const matchedRequiredCount = requiredFields.filter((f) => matchedSet.has(f.key)).length;
  const isFullyMatched = matchedRequiredCount === requiredFields.length;

  const filteredFields = schemaFields.filter((f) => {
    const isMatched = matchedSet.has(f.key);
    if (filterType === 'matched' && !isMatched) return false;
    if (filterType === 'missing' && isMatched) return false;

    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      f.key.toLowerCase().includes(q) ||
      f.label.toLowerCase().includes(q) ||
      (f.desc && f.desc.toLowerCase().includes(q)) ||
      (matchedColumnsMap[f.key] && matchedColumnsMap[f.key].toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 bg-slate-50/90 hover:bg-slate-100/80 cursor-pointer flex flex-wrap items-center justify-between gap-3 select-none border-b border-slate-200/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1677ff] flex items-center justify-center flex-shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {title}
              </h3>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-[#1677ff] border border-blue-200">
                {matchedCount}/{schemaFields.length} Cột Khớp
              </span>
              {loaiHsBadge && (
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {loaiHsBadge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {fileName ? `File: "${fileName}"` : 'Tệp dữ liệu'} {sheetName ? `• Sheet: "${sheetName}"` : ''}{' '}
              {totalRows !== undefined ? `• ${totalRows} dòng trích xuất` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg text-[11px] ${
              isFullyMatched
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isFullyMatched ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            <span>{isFullyMatched ? 'Cấu trúc 100% hợp lệ' : `Thiếu ${requiredFields.length - matchedRequiredCount} trường bắt buộc`}</span>
          </span>

          <button
            type="button"
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:text-slate-800 shadow-2xs"
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded Content: Connected Flow Boxes / Badge Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 bg-slate-50/40">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Lọc trường (vd: MA_KHOA, Tên khoa...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10 font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({schemaFields.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('matched')}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs flex items-center gap-1 ${
                  filterType === 'matched'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Check size={12} />
                <span>Đã khớp ({matchedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('missing')}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs flex items-center gap-1 ${
                  filterType === 'missing'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <X size={12} />
                <span>Chưa khớp ({schemaFields.length - matchedCount})</span>
              </button>
            </div>
          </div>

          {/* Connected Flow Boxes / Chip Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredFields.map((field, index) => {
              const isMatched = matchedSet.has(field.key);
              const excelCol = matchedColumnsMap[field.key];
              const isRequired = field.required;

              // Color styles based on state
              let cardBg = '';
              let borderClass = '';
              let badgeBg = '';
              let statusText = '';
              let statusIcon = null;

              if (isMatched) {
                cardBg = 'bg-white hover:bg-emerald-50/40';
                borderClass = 'border-emerald-300 shadow-xs shadow-emerald-500/5 ring-1 ring-emerald-400/20';
                badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                statusText = excelCol && excelCol !== field.key ? `Khớp cột: "${excelCol}"` : 'Đã khớp cột chuẩn';
                statusIcon = <Check size={12} className="text-emerald-600 flex-shrink-0" />;
              } else if (isRequired) {
                cardBg = 'bg-rose-50/40 hover:bg-rose-50/80';
                borderClass = 'border-rose-300 shadow-xs shadow-rose-500/5 ring-1 ring-rose-400/20';
                badgeBg = 'bg-rose-100/70 text-rose-800 border-rose-200';
                statusText = 'Thiếu trường bắt buộc';
                statusIcon = <X size={12} className="text-rose-600 flex-shrink-0" />;
              } else {
                cardBg = 'bg-white/70 hover:bg-slate-100/60 opacity-80';
                borderClass = 'border-slate-200 border-dashed';
                badgeBg = 'bg-slate-100 text-slate-600 border-slate-200';
                statusText = 'Tự động gán rỗng';
                statusIcon = <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block flex-shrink-0" />;
              }

              return (
                <div
                  key={field.key}
                  className={`p-3 rounded-xl border ${borderClass} ${cardBg} transition-all duration-150 flex flex-col justify-between gap-2 relative group`}
                >
                  {/* Top Bar: Key & Required Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        #{index + 1}
                      </span>
                      <span className="font-mono font-black text-xs text-slate-900 group-hover:text-[#1677ff] transition-colors">
                        {field.key}
                      </span>
                    </div>

                    {isRequired ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                        Tùy chọn
                      </span>
                    )}
                  </div>

                  {/* Label & Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      {field.label}
                    </h4>
                    {field.desc && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5" title={field.desc}>
                        {field.desc}
                      </p>
                    )}
                  </div>

                  {/* Bottom Status Pill / Connected Arrow */}
                  <div className={`pt-2 mt-1 border-t ${isMatched ? 'border-emerald-100' : isRequired ? 'border-rose-200' : 'border-slate-100'}`}>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium ${badgeBg}`}>
                      {statusIcon}
                      <span className="truncate font-semibold" title={statusText}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Legend / Guide */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <strong className="text-emerald-700 font-semibold">Xanh lá</strong>: Cột đã nhận diện khớp chuẩn
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <strong className="text-rose-700 font-semibold">Đỏ/Hồng</strong>: Thiếu trường bắt buộc trong file
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                <strong className="text-slate-600 font-semibold">Xám</strong>: Trường tùy chọn (được phép để trống)
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Tự động chuẩn hóa dấu tiếng Việt & alias cột
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
