import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUp,
  Home,
  Menu,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import { useStore } from '../../context/storeContextValue';
import { KakaoBubbleIcon } from '../common/BrandAssets';

interface StoreFooterProps {
  onOpenVault: () => void;
  onOpenKakao: () => void;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({
  onOpenVault,
  onOpenKakao,
  onOpenMobileMenu,
  onOpenSearch,
}) => {
  const { cartCount } = useStore();
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Footer (.r2-foot) */}
      <footer className="bg-[#f5f5f7] text-[#6e6e73] text-[14px] border-t border-[#d2d2d7]/60 pb-20 lg:pb-12">
        <div className="max-w-[1180px] mx-auto px-[22px] pt-10 pb-8">
          {/* Top Disclaimer */}
          <p className="text-[12.5px] leading-relaxed pb-6 border-b border-[#d2d2d7]">
            표시 가격은 시세에 따라 달라질 수 있어요. 활 상품은 산지 사정에 따라 출고일이 바뀔 수 있어요.
          </p>

          {/* 4 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-b border-[#d2d2d7]">
            <div>
              <h4 className="text-[13px] font-bold text-[#1d1d1f] mb-3">갑각류</h4>
              <ul className="space-y-2 text-[13px]">
                <li><Link to="/products/crab?tab=대게" className="hover:text-[#1d1d1f]">대게</Link></li>
                <li><Link to="/products/crab?tab=킹크랩" className="hover:text-[#1d1d1f]">킹크랩</Link></li>
                <li><Link to="/products/crab?tab=홍게" className="hover:text-[#1d1d1f]">홍게</Link></li>
                <li><Link to="/products/lobster-shrimp?tab=랍스터" className="hover:text-[#1d1d1f]">랍스터</Link></li>
                <li><Link to="/products/crab?tab=꽃게" className="hover:text-[#1d1d1f]">꽃게</Link></li>
                <li><Link to="/products/lobster-shrimp?tab=새우" className="hover:text-[#1d1d1f]">새우</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[13px] font-bold text-[#1d1d1f] mb-3">수산물·선물</h4>
              <ul className="space-y-2 text-[13px]">
                <li><Link to="/products/seafood" className="hover:text-[#1d1d1f]">전복·오징어</Link></li>
                <li><Link to="/products/seafood" className="hover:text-[#1d1d1f]">제철 생선·굴비</Link></li>
                <li><Link to="/products/produce" className="hover:text-[#1d1d1f]">농산물</Link></li>
                <li><Link to="/products/gift" className="hover:text-[#1d1d1f]">선물세트</Link></li>
                <li><a href="/#r2-gift" className="hover:text-[#1d1d1f]">법인 주문</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[13px] font-bold text-[#1d1d1f] mb-3">고객지원</h4>
              <ul className="space-y-2 text-[13px]">
                <li><Link to="/mypage" className="hover:text-[#1d1d1f]">주문·배송 조회</Link></li>
                <li><Link to="/reviews" className="hover:text-[#1d1d1f]">공지사항</Link></li>
                <li><Link to="/products" className="hover:text-[#1d1d1f]">자주 묻는 질문</Link></li>
                <li><Link to="/contact" className="hover:text-[#1d1d1f] font-bold text-[#0d5c63]">1:1 이메일 문의하기</Link></li>
                <li><Link to="/product/prod-41#qna" className="hover:text-[#1d1d1f]">상품 Q&amp;A</Link></li>
                <li>
                  <button type="button" onClick={onOpenKakao} className="hover:text-[#1d1d1f] cursor-pointer">
                    카카오톡 상담
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[13px] font-bold text-[#1d1d1f] mb-2">고객센터</h4>
              <p className="text-[22px] font-extrabold text-[#1d1d1f] tracking-tight mb-1">
                031-8043-2244
              </p>
              <p className="text-[13px] mb-3">평일 10:30 ~ 17:30</p>
              <Link
                to="/reviews"
                className="inline-block text-[13px] font-semibold text-[#0d5c63] hover:underline"
              >
                구매 후기 ›
              </Link>
            </div>
          </div>

          {/* Company Legal Info */}
          <div className="pt-6 space-y-2 text-[12.5px] leading-relaxed">
            <p>
              주식회사 크랩마스터에프앤비 · 대표 권종철 · 사업자등록번호 437-86-02558 · 통신판매업 2025-화성동탄-0386{' '}
              <span className="underline cursor-pointer">[사업자정보확인]</span>
            </p>
            <p>
              주소 18469 경기 화성시 동탄기흥로 594-7, 1214˙1215호 · 개인정보보호책임자 김연수 · 이메일 help@crabmaster.kr · 호스팅 Cafe24
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 font-medium text-[#1d1d1f]">
                <a href="/#r2-why" className="hover:underline">회사소개</a>
                <span>·</span>
                <span className="hover:underline cursor-pointer">이용약관</span>
                <span>·</span>
                <span className="font-bold hover:underline cursor-pointer">개인정보처리방침</span>
                <span>·</span>
                <span className="hover:underline cursor-pointer">이용안내</span>
              </div>
              <div className="flex items-center gap-3 text-[#6e6e73]">
                <span className="hover:text-[#1d1d1f] cursor-pointer">인스타그램</span>
                <span>·</span>
                <span className="hover:text-[#1d1d1f] cursor-pointer">블로그</span>
                <span>·</span>
                <button type="button" onClick={onOpenKakao} className="hover:text-[#1d1d1f] cursor-pointer">
                  카카오톡
                </button>
              </div>
            </div>
            <p className="pt-2 text-[12px] text-[#86868b]">
              Copyright © 크랩마스터. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Desktop Right Floating Widgets */}
      <div className="hidden lg:flex fixed right-4 bottom-6 z-40 flex-col items-end gap-3">
        {/* Secret Vault Card */}
        <button
          type="button"
          onClick={onOpenVault}
          className="w-[114px] p-2.5 rounded-[14px] bg-white border border-[#d2d2d7] shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition text-center cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
            <img
              src="https://kingkongcrab2.mycafe24.com/mall/vault-sidebar-20261116-21b06276c3c3.webp"
              alt="비밀창고"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <p className="text-[10px] font-semibold text-[#6e6e73] leading-tight">
            매주 1~2회<br />특별창고 오픈
          </p>
          <p className="mt-1 text-[11px] font-extrabold text-[#0d5c63]">
            비밀창고 입장하기 →
          </p>
        </button>

        {/* KakaoTalk Floating Button */}
        <button
          type="button"
          onClick={onOpenKakao}
          aria-label="카카오톡 상담하기"
          className="w-[72px] h-[72px] rounded-[20px] bg-[#fee500] shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:scale-105 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <KakaoBubbleIcon size={28} />
          <span className="text-[11px] font-extrabold text-[#3c1e1e] leading-none">
            카톡상담
          </span>
        </button>

        {/* Scroll to Top */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="최상단으로 이동"
          className="w-11 h-11 rounded-full bg-white border border-[#d2d2d7] shadow-md hover:bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Bottom Sticky Navigation Bar (.r2-tabbar, 60px, 5-col) */}
      <nav
        aria-label="모바일 하단 내비게이션"
        className="lg:hidden fixed inset-x-0 bottom-0 z-50 h-[60px] bg-[#fbfbfd]/95 backdrop-blur-md border-t border-[#d2d2d7] grid grid-cols-5"
      >
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center gap-0.5 text-[#1d1d1f] cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-semibold">전체메뉴</span>
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center gap-0.5 text-[#1d1d1f] cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-semibold">검색</span>
        </button>

        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 ${
            location.pathname === '/' ? 'text-[#0d5c63]' : 'text-[#1d1d1f]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">홈</span>
        </Link>

        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center gap-0.5 ${
            location.pathname === '/cart' ? 'text-[#0d5c63]' : 'text-[#1d1d1f]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#e05a47] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">장바구니</span>
        </Link>

        <Link
          to="/mypage"
          className={`flex flex-col items-center justify-center gap-0.5 ${
            location.pathname === '/mypage' ? 'text-[#0d5c63]' : 'text-[#1d1d1f]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">마이쇼핑</span>
        </Link>
      </nav>
    </>
  );
};
