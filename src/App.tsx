import React, { useState } from 'react';
import { Sidebar, type MainTabType, type HoSoTabType } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DanhMucPage } from './pages/DanhMucPage';
import { HoSoPage } from './pages/HoSoPage';
import { ToastProvider } from './context/ToastContext';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTabType>('ho-so');
  const [hoSoTab, setHoSoTab] = useState<HoSoTabType>('01_tonghop');

  const handleNavigate = (tab: MainTabType, subTab?: HoSoTabType) => {
    setActiveTab(tab);
    if (tab === 'ho-so' && subTab) {
      setHoSoTab(subTab);
    }
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen w-full bg-[#f1f5f9] text-slate-800 antialiased font-sans">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          hoSoTab={hoSoTab}
          onNavigate={handleNavigate}
          pendingXuattoanCount={3}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f1f5f9]">
          <Navbar activeTab={activeTab} hoSoTab={hoSoTab} />

          <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
            {/* 1. DANH MỤC KCB BHYT (6 BIỂU MẪU) */}
            {activeTab === 'danh-muc' && (
              <DanhMucPage />
            )}

            {/* 2. HỒ SƠ KCB BHYT (01/BH TỔNG HỢP & 09/BH XUẤT TOÁN) */}
            {activeTab === 'ho-so' && (
              <HoSoPage
                activeTab={hoSoTab}
                onTabChange={setHoSoTab}
              />
            )}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default App;


