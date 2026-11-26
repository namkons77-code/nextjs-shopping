import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Copy, Check, Phone, X } from 'lucide-react';
import { useStore } from '../../context/storeContextValue';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';
import { KakaoBubbleIcon } from '../common/BrandAssets';

export const StoreLayout: React.FC = () => {
  const { vaultConfig, toastMessage, showToast } = useStore();
  const [vaultOpen, setVaultOpen] = useState(false);
  const [kakaoOpen, setKakaoOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(vaultConfig.discountCode).catch(() => {});
    setCopiedCode(true);
    showToast(`비밀창고 코드 '${vaultConfig.discountCode}'가 복사되었습니다!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1d1d1f]">
      <StoreHeader
        onOpenVault={() => setVaultOpen(true)}
        onOpenKakao={() => setKakaoOpen(true)}
        mobileSheetOpen={mobileSheetOpen}
        setMobileSheetOpen={setMobileSheetOpen}
        searchBarOpen={searchBarOpen}
        setSearchBarOpen={setSearchBarOpen}
      />

      <main className="flex-1">
        <Outlet context={{ onOpenVault: () => setVaultOpen(true), onOpenKakao: () => setKakaoOpen(true) }} />
      </main>

      <StoreFooter
        onOpenVault={() => setVaultOpen(true)}
        onOpenKakao={() => setKakaoOpen(true)}
        onOpenMobileMenu={() => setMobileSheetOpen((v) => !v)}
        onOpenSearch={() => {
          setMobileSheetOpen(false);
          setSearchBarOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Secret Vault Modal */}
      {vaultOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[440px] rounded-[24px] bg-white p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setVaultOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fee500] text-[#3c1e1e] text-[12px] font-extrabold mb-3">
              <KakaoBubbleIcon size={18} />
              <span>{vaultConfig.isOpen ? 'OPEN · 선착순 진행중' : '다음 오픈 대기중'}</span>
            </div>

            <h3 className="text-[24px] font-extrabold text-[#1d1d1f] leading-tight">
              {vaultConfig.title}
            </h3>
            <p className="mt-2 text-[14px] text-[#6e6e73] leading-relaxed">
              {vaultConfig.subtitle}
            </p>

            <div className="mt-5 p-4 rounded-[18px] bg-[#f5f5f7] border border-[#d2d2d7]/70 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#6e6e73]">비밀창고 전용 시크릿 코드</p>
                <p className="text-[20px] font-black tracking-wider text-[#0d5c63]">
                  {vaultConfig.discountCode}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-full bg-[#1d1d1f] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? '복사됨' : '코드 복사'}</span>
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <a
                href="https://open.kakao.com/o/gEnRJQWi"
                target="_blank"
                rel="noreferrer"
                className="h-[48px] rounded-full bg-[#fee500] hover:brightness-95 text-[#3c1e1e] font-extrabold text-[15px] flex items-center justify-center gap-2"
              >
                <KakaoBubbleIcon size={20} />
                <span>카카오톡 비밀창고 오픈채팅 입장</span>
              </a>
              <button
                type="button"
                onClick={() => setVaultOpen(false)}
                className="h-[44px] rounded-full bg-[#f5f5f7] text-[#1d1d1f] font-bold text-[14px] cursor-pointer"
              >
                계속 쇼핑하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KakaoTalk CS Modal */}
      {kakaoOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setKakaoOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <KakaoBubbleIcon size={40} />
              <div>
                <h3 className="text-[20px] font-extrabold text-[#1d1d1f]">
                  크랩마스터 고객상담실
                </h3>
                <p className="text-[13px] text-[#6e6e73]">평일 10:30 ~ 17:30 실시간 응대</p>
              </div>
            </div>

            <div className="space-y-3 text-[14px] bg-[#f5f5f7] p-4 rounded-[16px]">
              <p className="font-semibold text-[#1d1d1f]">
                • 활/자숙 수율 및 당일 시세 문의
              </p>
              <p className="font-semibold text-[#1d1d1f]">
                • 법인·단체 엑셀 다중 배송지 접수
              </p>
              <p className="font-semibold text-[#1d1d1f]">
                • 인천·화성·하남·동탄 직영 매장 픽업 예약
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5">
              <a
                href="https://open.kakao.com/o/gEnRJQWi"
                target="_blank"
                rel="noreferrer"
                className="h-[48px] rounded-full bg-[#fee500] text-[#3c1e1e] font-extrabold text-[15px] flex items-center justify-center gap-2"
              >
                <KakaoBubbleIcon size={20} />
                <span>카카오톡 1:1 상담 시작하기</span>
              </a>
              <a
                href="tel:031-8043-2244"
                className="h-[46px] rounded-full bg-[#0d5c63] text-white font-bold text-[15px] flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>전화 연결 031-8043-2244</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 rounded-full bg-[#1d1d1f] text-white text-[13.5px] font-semibold shadow-xl whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
