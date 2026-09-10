import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  X,
  Layers
} from 'lucide-react';

export interface SchemaFieldDef {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  desc?: string;
  description?: string;
  aliases?: string[];
}

interface SchemaMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  loaiHsBadge: string;
  schemaFields: SchemaFieldDef[];
  matchedKeys: string[]; // List of schema field keys that were matched
  matchedColumnsMap?: { [schemaKey: string]: string }; // schemaKey -> Excel column name
  sheetName?: string;
  fileName?: string;
  totalRows?: number;
}

export const SchemaMappingModal: React.FC<SchemaMappingModalProps> = ({
  isOpen,
  onClose,
  title,
  loaiHsBadge,
  schemaFields,
  matchedKeys = [],
  matchedColumnsMap = {},
  sheetName,
  fileName,
  totalRows
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!isOpen) return null;

  const matchedSet = new Set(matchedKeys);
  const matchedCount = schemaFields.filter((f) => matchedSet.has(f.key)).length;
  const requiredFields = schemaFields.filter((f) => f.required);
  const matchedRequiredCount = requiredFields.filter((f) => matchedSet.has(f.key)).length;
  const isFullyMatched = matchedRequiredCount === requiredFields.length;

  const filteredFields = schemaFields.filter(
    (f) =>
      f.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.desc && f.desc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (matchedColumnsMap[f.key] && matchedColumnsMap[f.key].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-[#1677ff]">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Bảng Đối Soát Khớp Cột Chuẩn BHXH ({schemaFields.length} Trường)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1677ff] border border-blue-200">
                  {loaiHsBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {title} • {fileName ? `File: "${fileName}"` : 'Tệp Excel đang phân tích'} {sheetName ? `(Sheet: "${sheetName}")` : ''}{' '}
                {totalRows !== undefined ? `• ${totalRows} dòng` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold text-lg"
          >
            &times;
          </button>
        </div>

        {/* Modal Sub-Header Stats */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Tổng cột khớp nhận diện:</span>
            <strong className="text-slate-900 font-bold text-sm">
              {matchedCount}/{schemaFields.length} trường
            </strong>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Trường bắt buộc:</span>
            <strong className={`font-bold text-sm ${isFullyMatched ? 'text-emerald-700' : 'text-amber-600'}`}>
              {matchedRequiredCount}/{requiredFields.length} trường
            </strong>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Trạng thái cấu trúc:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                isFullyMatched
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isFullyMatched ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              <span>{isFullyMatched ? 'Hợp lệ 100%' : 'Thiếu trường bắt buộc'}</span>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trường theo mã (vd: MA_KHOA, TU_NGAY) hoặc tên tiếng Việt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10 font-medium"
            />
          </div>
        </div>

        {/* Table comparison */}
        <div className="p-6 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3 min-w-[140px]">MÃ TRƯỜNG XML</th>
                <th className="py-2.5 px-3 min-w-[180px]">TÊN TRƯỜNG CHUẨN BHXH</th>
                <th className="py-2.5 px-3 text-center min-w-[90px]">BẮT BUỘC</th>
                <th className="py-2.5 px-3 text-center min-w-[110px]">KIỂU DỮ LIỆU</th>
                <th className="py-2.5 px-3 min-w-[180px]">CỘT TÌM THẤY TRONG EXCEL</th>
                <th className="py-2.5 px-3 text-center min-w-[120px]">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFields.map((field, idx) => {
                const isMatched = matchedSet.has(field.key);
                const excelColName = matchedColumnsMap[field.key] || (isMatched ? field.key : '');

                return (
                  <tr key={field.key} className={`hover:bg-blue-50/30 transition-colors ${!isMatched && field.required ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-3 px-3 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-[#1677ff]">
                      {field.key}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{field.label}</div>
                      {field.desc && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{field.desc}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {field.required ? (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                          Bắt buộc
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100">
                          Tùy chọn
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {field.type}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {isMatched ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            {excelColName || field.key}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-mono text-[11px]">
                          (Không tìm thấy cột tương ứng)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check size={12} />
                          <span>Đã khớp chuẩn</span>
                        </span>
                      ) : field.required ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <X size={12} />
                          <span>Thiếu trường</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          <span>Tự động gán rỗng</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Hệ thống hỗ trợ tự động đối soát nhận diện tên cột tiếng Việt có dấu, không dấu và alias chuẩn.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
