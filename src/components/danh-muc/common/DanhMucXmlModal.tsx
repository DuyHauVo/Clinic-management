import React from 'react';
import { FileCode, Send, Copy, Check, Download, AlertTriangle } from 'lucide-react';
import { DEFAULT_MA_CSKCB, DEFAULT_MA_TINH } from '../../../utils/shared/excelXmlShared';
import { useClipboard } from '../../../hooks/useClipboard';
import { useModalBehavior } from '../../../hooks/useModalBehavior';

interface DanhMucXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  loaiHsBadge: string;
  itemsCount: number;
  itemLabel?: string;
  xmlContent: string;
  base64Content: string;
  apiEndpoint?: string;
  loaiHsCode?: string;
  tab: 'xml' | 'base64' | 'api';
  onTabChange: (tab: 'xml' | 'base64' | 'api') => void;
  isKeyCopied?: (key: string) => boolean;
  onCopy?: (text: string, message?: string, key?: string) => void;
  onExportXml: () => void;
  onSendApi: () => void;
  isSendingApi: boolean;
  apiResponse: any;
}

export const DanhMucXmlModal: React.FC<DanhMucXmlModalProps> = ({
  isOpen,
  onClose,
  title,
  loaiHsBadge,
  itemsCount,
  itemLabel = 'bản ghi',
  xmlContent,
  base64Content,
  apiEndpoint = 'https://egw.baohiemxahoi.gov.vn/api/DanhMucGW',
  loaiHsCode = '70',
  tab,
  onTabChange,
  isKeyCopied: externalIsKeyCopied,
  onCopy: externalOnCopy,
  onExportXml,
  onSendApi,
  isSendingApi,
  apiResponse
}) => {
  const { isKeyCopied: internalIsKeyCopied, copy: internalCopy } = useClipboard();
  useModalBehavior(isOpen, onClose);

  const isKeyCopied = externalIsKeyCopied || internalIsKeyCopied;
  const handleCopy = externalOnCopy || internalCopy;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-[#1677ff]">
              <FileCode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {loaiHsBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu hiện hành • {itemsCount} {itemLabel}
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
          {itemsCount === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có dữ liệu danh mục</p>
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
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileCode size={14} />
                  <span>XML Gốc (&lt;HSDANHMUC&gt;)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('base64')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tab === 'base64'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileCode size={14} />
                  <span>Chuỗi Base64 Đã Ký Số</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('api')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tab === 'api'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Send size={14} />
                  <span>Cổng Tiếp Nhận BHXH API (Sandbox)</span>
                </button>
              </div>

              {/* Tab Content: XML */}
              {tab === 'xml' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">
                      Kích thước XML: <b>{(xmlContent.length / 1024).toFixed(2)} KB</b> • {itemsCount} {itemLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(xmlContent, 'Đã sao chép nội dung XML vào bộ nhớ đệm!', 'xml')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                      >
                        {isKeyCopied('xml') ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        {isKeyCopied('xml') ? 'Đã chép' : 'Sao chép XML'}
                      </button>
                      <button
                        type="button"
                        onClick={onExportXml}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Download size={14} />
                        Tải File .XML
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl max-h-96 overflow-y-auto overflow-x-auto leading-relaxed border border-slate-800">
                    {xmlContent}
                  </pre>
                </div>
              )}

              {/* Tab Content: Base64 */}
              {tab === 'base64' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">
                      Chuỗi Base64 UTF-8 (dùng cho trường <code>fileHsBase64</code> trong API Cổng BHXH):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(base64Content, 'Đã sao chép chuỗi Base64 vào bộ nhớ đệm!', 'base64')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      {isKeyCopied('base64') ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {isKeyCopied('base64') ? 'Đã chép' : 'Sao chép Base64'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={base64Content}
                    className="w-full h-80 p-4 bg-slate-900 text-sky-400 font-mono text-[11px] rounded-2xl resize-none outline-none leading-relaxed border border-slate-800"
                  />
                </div>
              )}

              {/* Tab Content: API Cổng Tiếp Nhận */}
              {tab === 'api' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5">
                      <Send size={15} />
                      Đặc tả kỹ thuật Cổng BHXH Việt Nam:
                    </div>
                    <div>• <b>URL:</b> <code className="bg-white px-2 py-0.5 rounded-md border border-blue-200 font-mono">{apiEndpoint}</code></div>
                    <div>• <b>Method:</b> POST • <b>Content-Type:</b> application/x-www-form-urlencoded; charset=utf-8</div>
                    <div>• <b>Body Params:</b> username, loaiHs={loaiHsCode}, maTinh={DEFAULT_MA_TINH}, maCskcb={DEFAULT_MA_CSKCB}, fileHsBase64</div>
                  </div>

                  {/* cURL Example Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Mẫu lệnh cURL kiểm thử Postman / Terminal:</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `curl --location '${apiEndpoint}' \\\n--header 'accessToken: {access_token}' \\\n--header 'tokenId: {token_id}' \\\n--header 'passwordHash: {md5_hash}' \\\n--header 'Content-Type: application/x-www-form-urlencoded' \\\n--data-urlencode 'username=${DEFAULT_MA_CSKCB}_BV' \\\n--data-urlencode 'loaiHs=${loaiHsCode}' \\\n--data-urlencode 'maTinh=${DEFAULT_MA_TINH}' \\\n--data-urlencode 'maCskcb=${DEFAULT_MA_CSKCB}' \\\n--data-urlencode 'fileHsBase64=${base64Content.substring(0, 50)}...'`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Copy size={12} /> Sao chép cURL
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 text-amber-300 font-mono text-[10px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
{`curl --location '${apiEndpoint}' \\
--header 'accessToken: {access_token}' \\
--header 'tokenId: {token_id}' \\
--header 'passwordHash: {md5_hash}' \\
--header 'Content-Type: application/x-www-form-urlencoded' \\
--data-urlencode 'username=${DEFAULT_MA_CSKCB}_BV' \\
--data-urlencode 'loaiHs=${loaiHsCode}' \\
--data-urlencode 'maTinh=${DEFAULT_MA_TINH}' \\
--data-urlencode 'maCskcb=${DEFAULT_MA_CSKCB}' \\
--data-urlencode 'fileHsBase64=${base64Content.substring(0, 40)}...'`}
                    </pre>
                  </div>

                  {/* Response Display */}
                  {apiResponse && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="font-black text-xs text-emerald-900 flex items-center gap-1.5">
                        <Check size={16} className="text-emerald-600" />
                        Kết quả phản hồi từ Cổng tiếp nhận (Response 200 OK):
                      </div>
                      <pre className="p-3 bg-white border border-emerald-200 rounded-xl font-mono text-[11px] text-emerald-800 overflow-x-auto">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={isSendingApi}
                      onClick={onSendApi}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all ${
                        isSendingApi ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      <Send size={15} />
                      <span>{isSendingApi ? 'Đang gửi Cổng Giám Định...' : 'Gửi Lên Cổng BHXH (Sandbox)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Tổng số: <b>{itemsCount}</b> {itemLabel}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
