import React from 'react';
import { FileCode, FileSpreadsheet, Send, Copy, Check, Download, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { DmDichVuItem, SendDichVuGatewayResult } from '../../../../types';

interface DichVuXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmDichVuItem[];
  xmlContent: string;
  base64Content: string;
  tab: 'xml' | 'base64' | 'api';
  onTabChange: (tab: 'xml' | 'base64' | 'api') => void;
  isCopied: boolean;
  onCopy: (text: string) => void;
  onExportXml: () => void;
  onSendApi: () => void;
  isSendingApi: boolean;
  apiResponse: SendDichVuGatewayResult | null;
}

export const DichVuXmlModal: React.FC<DichVuXmlModalProps> = ({
  isOpen,
  onClose,
  items,
  xmlContent,
  base64Content,
  tab,
  onTabChange,
  isCopied,
  onCopy,
  onExportXml,
  onSendApi,
  isSendingApi,
  apiResponse
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <FileCode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Cấu Trúc XML & Chuỗi Base64 Ký Số Trực Tuyến
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Mẫu 05/DM - Loại HS 12
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dịch vụ KBCB • {items.length} bản ghi DVKT chuẩn QĐ 3176/QĐ-BYT
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có dữ liệu Danh Mục Dịch Vụ KBCB</p>
              <p className="text-xs text-slate-500">Vui lòng nạp file Excel trước khi xuất XML.</p>
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => onTabChange('xml')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tab === 'xml'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileCode size={14} />
                  <span>XML Gốc (&lt;DANHSACH_DMDICHVUKBCB&gt;)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('base64')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tab === 'base64'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet size={14} />
                  <span>Chuỗi Base64 (Kèm Ký Số)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('api')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tab === 'api'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Send size={14} />
                  <span>Cổng Tiếp Nhận BHXH API (GuiDanhMuc05_DVKT)</span>
                </button>
              </div>

              {/* Tab Content: XML */}
              {tab === 'xml' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Nội dung XML chuẩn Mẫu 05/DM (UTF-8)
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopy(xmlContent)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{isCopied ? 'Đã sao chép' : 'Sao chép XML'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[360px] leading-relaxed border border-slate-800 selection:bg-emerald-700 selection:text-white">
                    {xmlContent}
                  </pre>
                </div>
              )}

              {/* Tab Content: Base64 */}
              {tab === 'base64' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Chuỗi Base64 Encode (fileHsBase64)
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopy(base64Content)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{isCopied ? 'Đã sao chép' : 'Sao chép Base64'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={base64Content}
                    rows={12}
                    className="w-full p-4 bg-slate-900 text-amber-400 font-mono text-[11px] rounded-xl border border-slate-800 outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Tab Content: API Simulator */}
              {tab === 'api' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[11px]">
                          POST
                        </span>
                        <code className="font-mono text-emerald-900 font-bold">
                          https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc05_DVKT
                        </code>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 font-semibold">loaiHs: 12</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900">Request Headers:</span>
                        <p className="font-mono text-[11px] text-slate-500">Content-Type: application/x-www-form-urlencoded</p>
                        <p className="font-mono text-[11px] text-slate-500">accessToken: [JWT_SESSION_TOKEN]</p>
                        <p className="font-mono text-[11px] text-slate-500">tokenId: [TOKEN_ID]</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900">Request Body:</span>
                        <p className="font-mono text-[11px] text-slate-500">username: 79001_BV</p>
                        <p className="font-mono text-[11px] text-slate-500">loaiHs: 12 (Danh mục DVKT)</p>
                        <p className="font-mono text-[11px] text-slate-500">maCskcb: 79001 | maTinh: 79</p>
                        <p className="font-mono text-[11px] text-slate-500">fileHsBase64: {base64Content.substring(0, 20)}...</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onSendApi}
                      disabled={isSendingApi}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
                    >
                      {isSendingApi ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang gửi đến Cổng BHXH...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Gửi Dữ Liệu Lên Cổng BHXH (Sandbox Test)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* API Response Display */}
                  {apiResponse && (
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <ShieldCheck size={16} /> Phản Hồi Từ Cổng BHXH Việt Nam:
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">HTTP Status: {apiResponse.maKetQua}</span>
                      </div>
                      <pre className="font-mono text-[11px] text-slate-300">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Đóng
          </button>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onExportXml}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-colors"
            >
              <Download size={15} />
              <span>Tải Tệp XML Mẫu 05/DM</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
