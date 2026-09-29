import { useState, useMemo, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';

export interface UseXmlExportModalOptions<T, R = any> {
  isOpen: boolean;
  items: T[];
  defaultTab?: 'xml' | 'base64' | 'api' | 'smartca';
  generateXml: (items: T[]) => string;
  generateBase64?: (items: T[], xml?: string) => string;
  downloadFile: (items: T[], xml?: string) => void;
  sendGateway?: (items: T[], signature?: any) => Promise<R>;
  downloadSuccessMessage?: string;
  emptyItemsMessage?: string;
  getSendSuccessMessage?: (result: R) => string;
  onSendSuccess?: (result: R) => void;
}

export function useXmlExportModal<T, R = any>({
  isOpen,
  items,
  defaultTab = 'xml',
  generateXml,
  generateBase64,
  downloadFile,
  sendGateway,
  downloadSuccessMessage = 'Đã tải xuống tệp XML thành công!',
  emptyItemsMessage = 'Không có dữ liệu để gửi!',
  getSendSuccessMessage,
  onSendSuccess,
}: UseXmlExportModalOptions<T, R>) {
  const toast = useToast();
  const [tab, setTab] = useState<'xml' | 'base64' | 'api' | 'smartca'>(defaultTab);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<R | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const generateXmlRef = useRef(generateXml);
  generateXmlRef.current = generateXml;

  const generateBase64Ref = useRef(generateBase64);
  generateBase64Ref.current = generateBase64;

  const xmlContent = useMemo(
    () => (isOpen && items.length > 0 ? generateXmlRef.current(items) : ''),
    [isOpen, items]
  );

  const base64Content = useMemo(() => {
    if (!isOpen || !xmlContent) return '';
    if (generateBase64Ref.current) return generateBase64Ref.current(items, xmlContent);
    return '';
  }, [isOpen, items, xmlContent]);

  const handleDownloadXml = () => {
    if (items.length === 0) {
      toast.warning('Chưa có dữ liệu để tải XML!');
      return;
    }
    downloadFile(items, xmlContent);
    toast.success(downloadSuccessMessage, 'Tải Tệp XML');
  };

  const handleSendGateway = async () => {
    if (items.length === 0) {
      toast.error(emptyItemsMessage, 'Lỗi Gửi Dữ Liệu');
      return;
    }
    if (!sendGateway) return;

    setIsSending(true);
    try {
      const res = await sendGateway(items);
      setSendResult(res);
      const msg = getSendSuccessMessage
        ? getSendSuccessMessage(res)
        : 'Gửi Cổng BHXH thành công!';
      toast.success(msg, 'Gửi Cổng BHXH Thành Công');
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

  return {
    tab,
    setTab,
    isSending,
    sendResult,
    xmlContent,
    base64Content,
    handleDownloadXml,
    handleSendGateway
  };
}
