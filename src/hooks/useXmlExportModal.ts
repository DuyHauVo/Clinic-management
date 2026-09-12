import { useState, useMemo, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export interface UseXmlExportModalOptions<T, R = any> {
  isOpen: boolean;
  items: T[];
  defaultTab?: 'xml' | 'base64' | 'api';
  generateXml: (items: T[]) => string;
  generateBase64?: (items: T[], xml?: string) => string;
  downloadFile: (items: T[], xml?: string) => void;
  sendGateway?: (items: T[]) => Promise<R>;
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
  onSendSuccess
}: UseXmlExportModalOptions<T, R>) {
  const toast = useToast();
  const [tab, setTab] = useState<'xml' | 'base64' | 'api'>(defaultTab);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<R | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const xmlContent = useMemo(
    () => (isOpen && items.length > 0 ? generateXml(items) : ''),
    [isOpen, items, generateXml]
  );

  const base64Content = useMemo(() => {
    if (!isOpen || !xmlContent) return '';
    if (generateBase64) return generateBase64(items, xmlContent);
    return '';
  }, [isOpen, items, xmlContent, generateBase64]);

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
