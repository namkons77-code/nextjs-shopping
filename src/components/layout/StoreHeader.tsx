import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { GNB_CATEGORIES } from '../../data/seedData';
import { useStore } from '../../context/storeContextValue';
import { BrandLogo, KakaoBubbleIcon } from '../common/BrandAssets';

interface StoreHeaderProps {
  onOpenVault: () => void;
  onOpenKakao: () => void;
  mobileSheetOpen: boolean;
  setMobileSheetOpen: (open: boolean) => void;
  searchBarOpen: boolean;
  setSearchBarOpen: (open: boolean) => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  onOpenVault,
  mobileSheetOpen,
  setMobileSheetOpen,
  searchBarOpen,
  setSearchBarOpen,
}) => {
  const { currentMember, cartCount, logout, vaultConfig } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileSheetOpen(false);
    setSearchBarOpen(false);
  }, [location.pathname, location.search, setMobileSheetOpen, setSearchBarOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchBarOpen(false);
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  return (
    <>
      {/* Top Kakao Utility Ribbon (.r2-ribbon) */}
      <div className="bg-[#f5f5f7] border-b border-black/[0.04]">
        <button
          type="button"
          onClick={onOpenVault}
          className="w-full min-h-[44px] px-4 flex items-center justify-center gap-2 text-[13px] md:text-[14px] font-medium text-[#1d1d1f] hover:opacity-80 transition cursor-pointer"
        >
          <KakaoBubbleIcon size={22} />
          <span className="hidden sm:inline">
            {vaultConfig.noticeBanner || '특가 뜨면 카톡이 울려요 · 갑각류 비밀창고로 모십니다'}
          </span>
          <span className="sm:hidden">특가 뜨면 카톡이 울려요</span>
          <ChevronRight className="w-4 h-4 text-[#0d5c63] stroke-[2.5]" />
        </button>
      </div>

      {/* Main Sticky Header (#r2-nav) */}
      <header
        id="r2-nav"
        className={`sticky top-0 z-50 bg-[#fbfbfd]/95 backdrop-blur-md transition-shadow duration-200 ${
          scrolled
            ? 'shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-b border-[#d2d2d7]/60'
            : 'border-b border-[#d2d2d7]/40'
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-[72px] md:h-[80px] px-4 md:px-6 flex items-center justify-between gap-3">
          {/* Left: Brand Logo */}
          <Link
            to="/"
            aria-label="크랩마스터 홈"
            className="shrink-0 flex items-center py-1"
          >
            <BrandLogo />
          </Link>

          {/* Center: 6 GNB Categories (Desktop) */}
          <nav
            aria-label="주 메뉴"
            className="hidden lg:flex items-center justify-center gap-1 xl:gap-2"
          >
            {GNB_CATEGORIES.map((cat) => {
              const active = location.pathname === cat.path;
              return (
                <Link
                  key={cat.id}
                  to={cat.path}
                  className={`px-3.5 py-2 rounded-full text-[16px] xl:text-[17px] font-bold tracking-[-0.02em] transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#0d5c63]/10 text-[#0d5c63]'
                      : 'text-[#1d1d1f] hover:bg-black/[0.05]'
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
            <Link
              to="/reviews"
              className={`px-3.5 py-2 rounded-full text-[16px] xl:text-[17px] font-bold tracking-[-0.02em] transition-colors whitespace-nowrap ${
                location.pathname === '/reviews'
                  ? 'bg-[#0d5c63]/10 text-[#0d5c63]'
                  : 'text-[#1d1d1f] hover:bg-black/[0.05]'
              }`}
            >
              후기
            </Link>
            <Link
              to="/contact"
              className={`px-3.5 py-2 rounded-full text-[16px] xl:text-[17px] font-bold tracking-[-0.02em] transition-colors whitespace-nowrap ${
                location.pathname === '/contact'
                  ? 'bg-[#0d5c63]/10 text-[#0d5c63]'
                  : 'text-[#1d1d1f] hover:bg-black/[0.05]'
              }`}
            >
              문의하기
            </Link>
          </nav>

          {/* Right: Utility Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchBarOpen(!searchBarOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[14px] font-semibold text-[#1d1d1f] hover:bg-black/[0.05] transition cursor-pointer"
              aria-label="상품 검색"
            >
              <Search className="w-[19px] h-[19px]" />
              <span className="hidden xl:inline">검색</span>
            </button>

            {currentMember ? (
              <>
                <Link
                  to="/mypage"
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[14px] font-semibold text-[#1d1d1f] hover:bg-black/[0.05] transition"
                >
                  <User className="w-[18px] h-[18px] text-[#0d5c63]" />
                  <span>{currentMember.name}님</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-2 rounded-full text-[13px] font-medium text-[#6e6e73] hover:bg-black/[0.05] transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[14px] font-semibold text-[#1d1d1f] hover:bg-black/[0.05] transition"
                >
                  <User className="w-[18px] h-[18px]" />
                  <span>로그인</span>
                </Link>
                <Link
                  to="/signup"
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[14px] font-semibold text-[#1d1d1f] hover:bg-black/[0.05] transition"
                >
                  <UserPlus className="w-[18px] h-[18px]" />
                  <span>회원가입</span>
                </Link>
              </>
            )}

            <Link
              to="/cart"
              className="relative inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[14px] font-semibold text-[#1d1d1f] hover:bg-black/[0.05] transition"
              aria-label="장바구니"
            >
              <ShoppingBag className="w-[19px] h-[19px]" />
              <span className="hidden xl:inline">장바구니</span>
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#e05a47] text-white text-[11px] font-bold flex items-center justify-center leading-none">
                {cartCount}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/[0.05] text-[#1d1d1f] transition cursor-pointer"
              aria-label="전체 메뉴 열기"
            >
              {mobileSheetOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchBarOpen && (
          <div className="border-t border-[#d2d2d7]/70 bg-white py-4 px-4 shadow-lg">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-[640px] mx-auto flex items-center gap-2 bg-[#f5f5f7] rounded-full h-[48px] pl-5 pr-1.5 border border-[#d2d2d7]/70 focus-within:border-[#0d5c63]"
            >
              <Search className="w-4 h-4 text-[#6e6e73] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="대게, 킹크랩, 전복…"
                autoFocus
                className="flex-1 bg-transparent text-[15px] text-[#1d1d1f] placeholder:text-[#6e6e73] outline-none"
              />
              <button
                type="submit"
                className="h-[38px] px-5 rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white text-[14px] font-bold transition cursor-pointer"
              >
                검색
              </button>
            </form>
            <div className="max-w-[640px] mx-auto mt-2.5 flex flex-wrap items-center gap-2 text-[12px] text-[#6e6e73]">
              <span className="font-semibold text-[#1d1d1f]">인기 검색어:</span>
              {['활대게', '레드 킹크랩', '박달홍게', '활 랍스터', '흰다리새우', '선물세트'].map(
                (kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      setSearchBarOpen(false);
                      navigate(`/products?q=${encodeURIComponent(kw)}`);
                    }}
                    className="px-2.5 py-1 rounded-full bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] font-medium cursor-pointer"
                  >
                    #{kw}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Slide-down Sheet Drawer */}
      {mobileSheetOpen && (
        <div className="fixed inset-x-0 top-[116px] bottom-[60px] z-50 bg-white overflow-y-auto px-5 py-6 lg:hidden">
          {currentMember ? (
            <div className="p-4 rounded-[18px] bg-[#f5f5f7] mb-5 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold text-[#0d5c63]">
                  {currentMember.grade} 등급 · 적립금{' '}
                  {currentMember.points.toLocaleString()}원
                </p>
                <p className="text-[18px] font-extrabold text-[#1d1d1f]">
                  {currentMember.name}님
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/mypage"
                  className="px-4 py-2 rounded-full bg-[#0d5c63] text-white text-[13px] font-bold"
                >
                  마이쇼핑
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="px-3 py-2 rounded-full border border-[#d2d2d7] text-[13px] font-semibold text-[#6e6e73]"
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link
                to="/login"
                className="h-[46px] rounded-full border-[1.5px] border-[#0d5c63] text-[#0d5c63] font-bold text-[15px] flex items-center justify-center"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="h-[46px] rounded-full bg-[#0d5c63] text-white font-bold text-[15px] flex items-center justify-center"
              >
                회원가입
              </Link>
            </div>
          )}

          <div className="divide-y divide-[#d2d2d7]/60 mb-6">
            {GNB_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.path}
                className="min-h-[52px] flex items-center justify-between text-[20px] font-extrabold text-[#1d1d1f]"
              >
                <span>{cat.label}</span>
                <ChevronRight className="w-5 h-5 text-[#6e6e73]" />
              </Link>
            ))}
            <Link
              to="/reviews"
              className="min-h-[52px] flex items-center justify-between text-[20px] font-extrabold text-[#1d1d1f]"
            >
              <span>후기</span>
              <ChevronRight className="w-5 h-5 text-[#6e6e73]" />
            </Link>
            <Link
              to="/contact"
              className="min-h-[52px] flex items-center justify-between text-[20px] font-extrabold text-[#1d1d1f]"
            >
              <span>문의하기</span>
              <ChevronRight className="w-5 h-5 text-[#6e6e73]" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileSheetOpen(false);
              onOpenVault();
            }}
            className="w-full p-4 rounded-[18px] bg-[#f5f5f7] border border-[#d2d2d7]/70 flex items-center justify-between text-left mb-6"
          >
            <div>
              <p className="text-[12px] font-bold text-[#0d5c63]">
                매주 1~2회 특별창고 오픈
              </p>
              <p className="text-[16px] font-extrabold text-[#1d1d1f]">
                비밀창고 입장하기 →
              </p>
            </div>
            <KakaoBubbleIcon size={34} />
          </button>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[14px] font-bold text-[#0d5c63] mb-6">
            <Link to="/mypage">주문·배송 조회</Link>
            <Link to="/mypage?tab=wishlist">관심상품</Link>
            <Link to="/mypage?tab=recent">최근 본 상품</Link>
            <Link to="/products">전체 상품 보기</Link>
          </div>
        </div>
      )}
    </>
  );
};
