import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Download,
  Send,
  CheckCircle2,
  Globe,
  X
} from 'lucide-react';
import type { Hs01TongHopItem, SendHs01GatewayResult } from '../services/hs01TongHopService';
import {
  generateHs01Xml,
  xmlToBase64,
  downloadHs01XmlFile,
  sendHs01ToBhxhGateway
} from '../services/hs01TongHopService';
import { useToast } from '../../../../context/ToastContext';

interface Hs01XmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Hs01TongHopItem[];
  activeTab?: 'xml' | 'base64' | 'api';
  onSendSuccess?: (result: SendHs01GatewayResult) => void;
}

export const Hs01XmlModal: React.FC<Hs01XmlModalProps> = ({
  isOpen,
  onClose,
  items,
  activeTab: initialTab = 'xml',
  onSendSuccess
}) => {
  const toast = useToast();
  const [tab, setTab] = useState<'xml' | 'base64' | 'api'>(initialTab);
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendHs01GatewayResult | null>(null);

  // Gateway Credentials form
  const [credentials, setCredentials] = useState({
    maCskcb: '01929',
    username: '01929_BV',
    passwordHash: '81dc9bdb52d04dc20036dbd8313ed055',
    accessToken: 'Y3lSVnFqS2JVN0RaUXNyb21WSzFxVE8xM0w4REpTeDhIR3c4Qkw3MCtXbz06MDE5MjlfQlY6MTM0MTY1MDU2NzAzMDkxOTA4',
    tokenId: '7b3bc7b0-014f-41b5-b910-953a673a5e47',
    maTinh: '01',
    kyQT: '202602'
  });

  if (!isOpen) return null;

  const xmlContent = generateHs01Xml(items, credentials.maCskcb);
  const base64Content = xmlToBase64(xmlContent);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(`Đã sao chép ${label} vào bộ nhớ tạm!`, 'Sao Chép Thành Công');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép!', 'Lỗi');
    }
  };

  const handleDownloadXml = () => {
    downloadHs01XmlFile(items, credentials.maCskcb);
    toast.success('Đã tải xuống tệp XML Mẫu 01/BH thành công!', 'Tải Tệp XML');
  };

  const handleSendGateway = async () => {
    if (items.length === 0) {
      toast.error('Không có hồ sơ nào để gửi!', 'Lỗi Gửi Dữ Liệu');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendHs01ToBhxhGateway(items, credentials);
      setSendResult(res);
      toast.success(
        `Tiếp nhận thành công ${res.totalRecords} hồ sơ tổng hợp 01/BH!\nMã giao dịch: ${res.maGiaoDich}`,
        'Gửi Cổng BHXH Thành Công'
      );
      if (onSendSuccess) {
        onSendSuccess(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối cổng BHXH';
      toast.error(msg, 'Lỗi Gửi Cổng');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
              <FileCode size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Xuất XML & Cổng Giám Định BHYT (Mẫu 01/BH)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy chuẩn XML &lt;HSTH01BH&gt; | Loại hồ sơ 5 | API: <span className="font-mono text-indigo-600 font-bold">GuiHoSoTongHop01BH</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setTab('xml')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              tab === 'xml'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cấu Trúc XML (&lt;HSTH01BH&gt;)
          </button>
          <button
            type="button"
            onClick={() => setTab('base64')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              tab === 'base64'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chuỗi Base64 (fileHsBase64)
          </button>
          <button
            type="button"
            onClick={() => setTab('api')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              tab === 'api'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe size={14} />
            <span>Gửi Cổng BHXH (Sandbox)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: XML Preview */}
          {tab === 'xml' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">
                  Tổng số bản ghi: <strong className="text-slate-900">{items.length}</strong> hồ sơ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(xmlContent, 'nội dung XML')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy size={14} />
                    <span>{isCopied ? 'Đã chép' : 'Sao chép XML'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadXml}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={14} />
                    <span>Tải Tệp XML (.xml)</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[360px] leading-relaxed border border-slate-800">
                <pre>{xmlContent}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: Base64 String */}
          {tab === 'base64' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">
                  Độ dài chuỗi: <strong className="text-slate-900">{base64Content.length.toLocaleString()}</strong> ký tự
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(base64Content, 'chuỗi Base64')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-colors"
                >
                  <Copy size={14} />
                  <span>{isCopied ? 'Đã chép' : 'Sao chép Base64'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-amber-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[360px] break-all leading-relaxed border border-slate-800">
                {base64Content}
              </div>
            </div>
          )}

          {/* TAB 3: API Gateway Simulator */}
          {tab === 'api' && (
            <div className="space-y-5">
              {/* Endpoint Specs Banner */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Globe size={16} />
                  <span>API Endpoint tiếp nhận Giám định BHYT (QĐ 3176 &amp; QĐ 130)</span>
                </div>
                <div className="font-mono text-[11px] text-indigo-700 bg-white/80 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <span>POST https://egw.baohiemxahoi.gov.vn/api/HoSoTongHop7980/GuiHoSoTongHop01BH</span>
                  <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase">loaiHs: 5</span>
                </div>
              </div>

              {/* Form credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã CSKCB (maCskcb)</label>
                  <input
                    type="text"
                    value={credentials.maCskcb}
                    onChange={(e) => setCredentials({ ...credentials, maCskcb: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tài khoản (username)</label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Tỉnh (maTinh)</label>
                  <input
                    type="text"
                    value={credentials.maTinh}
                    onChange={(e) => setCredentials({ ...credentials, maTinh: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kỳ Quyết Toán (kyQT)</label>
                  <input
                    type="text"
                    placeholder="YYYYMM"
                    value={credentials.kyQT}
                    onChange={(e) => setCredentials({ ...credentials, kyQT: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Access Token (Header)</label>
                  <input
                    type="password"
                    value={credentials.accessToken}
                    onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 font-medium">
                  Sẵn sàng gửi <strong className="text-slate-900">{items.length}</strong> hồ sơ tổng hợp lên cổng
                </span>
                <button
                  type="button"
                  onClick={handleSendGateway}
                  disabled={isSending || items.length === 0}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
                >
                  <Send size={15} />
                  <span>{isSending ? 'Đang gửi...' : 'Gửi Cổng Giám Định (Loại 5)'}</span>
                </button>
              </div>

              {/* Response Feed */}
              {sendResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 ant-modal-anim">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 size={16} />
                    <span>Phản hồi từ Cổng BHXH (Mã kết quả: {sendResult.maKetQua})</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 font-mono text-[11px] text-slate-800 space-y-1">
                    <div><strong>Mã giao dịch:</strong> <span className="text-indigo-600">{sendResult.maGiaoDich}</span></div>
                    <div><strong>Thông điệp:</strong> {sendResult.thongDiep}</div>
                    <div><strong>Thời gian tiếp nhận:</strong> {sendResult.thoiGianTiepNhan}</div>
                    <div><strong>Tổng số hồ sơ:</strong> {sendResult.totalRecords}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
