import React from 'react';
import { FileCode, FileSpreadsheet, Send, Copy, Check, Download, AlertTriangle } from 'lucide-react';
import type { DmTbytThdvItem, SendTbytThdvGatewayResult } from '../../../../types';

interface TbytThdvXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmTbytThdvItem[];
  xmlContent: string;
  base64Content: string;
  tab: 'xml' | 'base64' | 'api';
  onTabChange: (tab: 'xml' | 'base64' | 'api') => void;
  isCopied: boolean;
  onCopy: (text: string) => void;
  onExportXml: () => void;
  onSendApi: () => void;
  isSendingApi: boolean;
  apiResponse: SendTbytThdvGatewayResult | null;
}

export const TbytThdvXmlModal: React.FC<TbytThdvXmlModalProps> = ({
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
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <FileCode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 06/DM
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Loại HS 72 - GuiDanhMuc06_DMTBYT
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu hiện hành • {items.length} thiết bị y tế thực hiện DVKT (QĐ 3176/QĐ-BYT & NĐ 07/2025/NĐ-CP)
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
              <p className="text-sm font-bold text-slate-800">Chưa có dữ liệu Thiết Bị Y Tế Thực Hiện DVKT</p>
              <p className="text-xs text-slate-500">Vui lòng nạp file Excel trước khi xem mã XML và Base64.</p>
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
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileCode size={14} />
                  <span>XML Gốc (&lt;DSACH_TBYTTHDV&gt;)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('base64')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tab === 'base64'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet size={14} />
                  <span>Chuỗi Mã Hóa Base64</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('api')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tab === 'api'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Send size={14} />
                  <span>Đặc Tả API Cổng EGW (GuiDanhMuc06_DMTBYT)</span>
                </button>
              </div>

              {/* Tab 1: XML Preview */}
              {tab === 'xml' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Định dạng XML chuẩn Bộ Y tế &amp; BHXH (Loại HS 72)</span>
                    <button
                      type="button"
                      onClick={() => onCopy(xmlContent)}
                      className="text-purple-600 font-bold hover:underline flex items-center gap-1"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{isCopied ? 'Đã sao chép!' : 'Sao chép XML'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[360px] border border-slate-800 leading-relaxed select-all">
                    {xmlContent}
                  </pre>
                </div>
              )}

              {/* Tab 2: Base64 Preview */}
              {tab === 'base64' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Chuỗi Base64 ký số truyền vào tham số <code className="text-purple-600 font-mono">fileHsBase64</code></span>
                    <button
                      type="button"
                      onClick={() => onCopy(base64Content)}
                      className="text-purple-600 font-bold hover:underline flex items-center gap-1"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{isCopied ? 'Đã sao chép!' : 'Sao chép Base64'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    className="w-full p-4 bg-slate-900 text-purple-300 rounded-xl text-[11px] font-mono h-[300px] border border-slate-800 leading-relaxed outline-none select-all resize-none"
                    value={base64Content}
                  />
                </div>
              )}

              {/* Tab 3: API Specification & Test */}
              {tab === 'api' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-3 font-mono text-[11px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-purple-400 font-bold">
                        POST https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc06_DMTBYT
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        MÔ PHỎNG / SANDBOX
                      </span>
                    </div>
                    <div className="text-slate-400">
                      <strong>Headers (Cấu hình khi nối API thật):</strong><br />
                      Content-Type: application/x-www-form-urlencoded; charset=utf-8<br />
                      accessToken: &lt;YOUR_API_ACCESS_TOKEN&gt;<br />
                      tokenId: &lt;SESSION_TOKEN_ID&gt;<br />
                      passwordHash: &lt;MD5_PASSWORD_HASH&gt;
                    </div>
                    <div className="text-amber-300">
                      <strong>Request Body (application/x-www-form-urlencoded):</strong><br />
                      username: 01929_BV<br />
                      loaiHs: 72<br />
                      maTinh: 01<br />
                      maCskcb: 01929<br />
                      fileHsBase64: {base64Content.substring(0, 45)}... ({base64Content.length} chars)
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-purple-900">Gửi Thử Nghiệm Mô Phỏng Cổng BHXH (Mẫu 06/DM)</h5>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">Loại 72</span>
                      </div>
                      <p className="text-purple-700 text-[11px] mt-0.5">
                        Gói tin chứa {items.length} thiết bị y tế thực hiện DVKT sẽ được đóng gói mã hóa Base64 gửi mô phỏng.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onSendApi}
                      disabled={isSendingApi}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
                    >
                      <Send size={14} />
                      <span>{isSendingApi ? 'Đang gửi...' : 'Bấm Gửi Thử'}</span>
                    </button>
                  </div>

                  {apiResponse && (
                    <div className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] space-y-1">
                      <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">KẾT QUẢ PHẢN HỒI TỪ CỔNG (HTTP 200 OK):</div>
                      <pre className="text-emerald-300 mt-2">{JSON.stringify(apiResponse, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Mẫu 06/DM • Danh mục thiết bị y tế để thực hiện dịch vụ kỹ thuật áp dụng trong thanh toán BHYT (Loại HS 72)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={onExportXml}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Download size={14} />
              <span>Tải File .XML</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
