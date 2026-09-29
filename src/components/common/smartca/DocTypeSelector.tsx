import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Eye,
  ChevronDown,
  Check,
  FileSpreadsheet,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { parseUniversalChungTuExcelFile } from "../../../utils/tt25ExcelParser";
import {
  getDocOptionsList,
  detectXmlDocType,
} from "../../../utils/constants/tt25Constants";
import type { DocSignOptionType } from "../../../types/tt25ChungTuTypes";
import { validateAndResolveDocType } from "../../../utils/validators";
import { useToast } from "../../../context/ToastContext";

export interface DocTypeSelectorProps {
  fileName: string;
  itemsCount?: number;
  itemLabel?: string;
  selectedDocType: DocSignOptionType;
  isSigned?: boolean;
  hasFile?: boolean;
  onSelectDocType: (type: DocSignOptionType) => void;
  onUploadedFileParsed: (params: {
    xmlContent: string;
    fileName: string;
    totalRows: number;
    successMessage: string;
  }) => void;
  onClearUploaded: () => void;
  onOpenPreviewXml: () => void;
  onError?: (msg: string) => void;
}

export const DocTypeSelector: React.FC<DocTypeSelectorProps> = ({
  fileName,
  itemsCount,
  itemLabel = "bản ghi",
  selectedDocType,
  isSigned = false,
  hasFile = true,
  onSelectDocType,
  onUploadedFileParsed,
  onClearUploaded,
  onOpenPreviewXml,
  onError,
}) => {
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState<number>(0);

  const toast = useToast();
  const docDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        docDropdownRef.current &&
        !docDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDocDropdownOpen(false);
      }
    };
    if (isDocDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDocDropdownOpen]);

  // Danh mục phân nhóm loại hồ sơ (lấy từ constants dùng chung)
  const docOptionsList = useMemo(
    () => getDocOptionsList(fileName, itemsCount, itemLabel),
    [fileName, itemsCount, itemLabel],
  );

  const currentSelectedOption = useMemo(() => {
    for (const grp of docOptionsList) {
      const match = grp.items.find((it) => it.id === selectedDocType);
      if (match) return match;
    }
    return docOptionsList[0].items[0];
  }, [selectedDocType, docOptionsList]);

  // Đóng/mở dropdown chọn loại hồ sơ
  const handleToggleDocDropdown = () => {
    setIsDocDropdownOpen((prev) => !prev);
  };

  // Chọn loại hồ sơ từ danh mục dropdown
  const handleSelectOptionItem = (itemId: DocSignOptionType) => {
    if (selectedDocType !== itemId) {
      onSelectDocType(itemId);
      onClearUploaded();
      setUploadSuccessMsg(null);
      setUploadedCount(0);
    }
    setIsDocDropdownOpen(false);
  };

  // Kích hoạt mở hộp thoại chọn tệp từ máy tính
  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Xử lý upload file Excel hoặc XML
  const handleUploadedFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setUploadSuccessMsg(null);

    try {
      const lowerName = file.name.toLowerCase();

      // Trường hợp 1: Tệp XML (.xml)
      if (lowerName.endsWith(".xml")) {
        const text = await file.text();
        if (!text || !text.includes("<")) {
          throw new Error("Tệp XML không hợp lệ hoặc rỗng.");
        }

        const detectedXmlType = detectXmlDocType(text);
        const { nextDocTypeToSelect } = validateAndResolveDocType({
          selectedDocType,
          detectedType: detectedXmlType,
          fileTypeLabel: "XML",
        });

        if (nextDocTypeToSelect) {
          onSelectDocType(nextDocTypeToSelect);
        }

        const msg = detectedXmlType
          ? `Đã nạp thành công tệp XML [${detectedXmlType}]: ${file.name}`
          : `Đã nạp thành công tệp XML: ${file.name}`;
        setUploadedCount(1);
        setUploadSuccessMsg(msg);
        toast.success(msg, "Nạp Tệp Thành Công");
        onUploadedFileParsed({
          xmlContent: text,
          fileName: file.name,
          totalRows: 1,
          successMessage: msg,
        });
        return;
      }

      // Trường hợp 2: Tệp Excel (.xlsx, .xls)
      if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        const parsed = await parseUniversalChungTuExcelFile(
          file,
          selectedDocType,
        );
        if (!parsed.success) {
          throw new Error(parsed.error || "File Excel không hợp lệ");
        }

        const hasMatch =
          parsed.detectedType === selectedDocType ||
          !!(parsed.breakdown && (parsed.breakdown[selectedDocType] ?? 0) > 0);

        const { nextDocTypeToSelect } = validateAndResolveDocType({
          selectedDocType,
          detectedType:
            parsed.detectedType === "MULTI" ? null : parsed.detectedType,
          fileTypeLabel: "Excel",
          isMatched: hasMatch,
        });

        if (nextDocTypeToSelect) {
          onSelectDocType(nextDocTypeToSelect);
        }

        const typeCount = Object.keys(parsed.breakdown || {}).length;
        const msg =
          parsed.detectedType === "MULTI"
            ? `Đã nạp thành công ${parsed.totalRows} hồ sơ (${typeCount} loại mẫu) từ tệp: ${file.name}`
            : `Đã nạp thành công ${parsed.totalRows} hồ sơ [${parsed.detectedType}] từ tệp: ${file.name}`;

        setUploadedCount(parsed.totalRows);
        setUploadSuccessMsg(msg);
        toast.success(msg, "Nạp Tệp Thành Công");
        onUploadedFileParsed({
          xmlContent: parsed.xmlPackage,
          fileName: file.name,
          totalRows: parsed.totalRows,
          successMessage: msg,
        });
        return;
      }

      throw new Error(
        "Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .xlsx, .xls hoặc .xml",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể đọc tệp dữ liệu.";
      toast.error(msg, "Lỗi Nạp Tệp");
      onError?.(msg);
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-base font-bold text-slate-900 block">
            Chọn Loại Hồ Sơ / Chứng Từ Cần Ký Số
          </label>
          <span className="text-xs text-slate-500">
            Tự động áp dụng cấu trúc XML và chuẩn chữ ký điện tử tương ứng
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenPreviewXml}
          disabled={!hasFile && !isSigned}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto border ${
            !hasFile && !isSigned
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
              : isSigned
              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs ring-1 ring-emerald-400/30 cursor-pointer"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer"
          }`}
          title={
            !hasFile && !isSigned
              ? "Vui lòng nạp tệp Excel hoặc XML để xem"
              : isSigned
              ? "Xem toàn bộ nội dung tệp XML kèm chữ ký số <Signature> đã ký"
              : "Xem trước nội dung tệp XML"
          }
        >
          <Eye
            size={14}
            className={
              !hasFile && !isSigned
                ? "text-slate-400"
                : isSigned
                ? "text-emerald-600"
                : "text-[#1677ff]"
            }
          />
          <span>
            {isSigned ? "Xem XML Đã Ký Số" : "Xem Trước Cấu Trúc XML"}
          </span>
        </button>
      </div>

      {/* Custom Dropdown: Nền trắng, bo tròn 2xl, phân nhóm */}
      <div ref={docDropdownRef} className="relative">
        <button
          type="button"
          onClick={handleToggleDocDropdown}
          className="w-full px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-50/80 text-left border border-slate-300 hover:border-blue-400 flex items-center justify-between gap-3 transition-all shadow-2xs cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1677ff] border border-blue-200 text-xs font-bold font-mono flex-shrink-0">
              {currentSelectedOption.badge}
            </span>
            <div className="min-w-0">
              <span className="text-sm font-bold text-slate-900 block truncate">
                {currentSelectedOption.title}
              </span>
              <span className="text-xs text-slate-500 block truncate">
                {currentSelectedOption.desc}
              </span>
            </div>
          </div>

          <ChevronDown
            size={18}
            className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
              isDocDropdownOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </button>

        {isDocDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-2 space-y-3 max-h-96 overflow-y-auto animate-fadeIn">
            {docOptionsList.map((grp, grpIdx) => (
              <div key={grpIdx} className="space-y-1">
                <div className="px-3 pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  {grp.group}
                </div>
                <div className="space-y-1">
                  {grp.items.map((it) => {
                    const isSelected = selectedDocType === it.id;
                    return (
                      <div
                        key={it.id}
                        onClick={() => handleSelectOptionItem(it.id)}
                        className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border border-blue-200 text-[#1677ff]"
                            : "hover:bg-slate-50 text-slate-800 border border-transparent"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold block truncate">
                              {it.title}
                            </span>
                          </div>
                          <span
                            className={`text-xs block truncate ${
                              isSelected
                                ? "text-blue-600 font-medium"
                                : "text-slate-500"
                            }`}
                          >
                            {it.desc}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {it.badge}
                          </span>
                          {isSelected && (
                            <Check size={16} className="text-blue-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Khối nạp File Excel / XML */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-[#1677ff]" />
              Nạp Dữ Liệu Hồ Sơ Từ Tệp Máy Tính (.xlsx, .xls, .xml)
            </span>
            <span className="text-xs text-slate-500">
              Hỗ trợ đọc trực tiếp tệp XML có sẵn hoặc chuyển đổi danh sách
              Excel thành gói XML &lt;HSCHUNGTU&gt;
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.xml"
              onChange={handleUploadedFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleTriggerFileInput}
              disabled={isParsingFile}
              className="px-4 py-2 rounded-xl bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {isParsingFile ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang Đọc File...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Nạp Tệp Excel / XML</span>
                </>
              )}
            </button>
          </div>
        </div>

        {uploadSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300/80 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <CheckCircle2
                size={17}
                className="text-emerald-600 flex-shrink-0"
              />
              <span className="leading-relaxed">{uploadSuccessMsg}</span>
            </div>
            {uploadedCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold font-mono text-xs whitespace-nowrap flex-shrink-0 shadow-xs">
                {uploadedCount} hồ sơ
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
