import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  Menu,
  Monitor,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  User,
  X,
} from 'lucide-react';
import { GNB_CATEGORIES, PICKER_TABS } from '../data/seedData';
import { useStore } from '../context/storeContextValue';
import type { PickerTabId, Product } from '../types/store';
import {
  BrandLogo,
  GoogleGIcon,
  KakaoBubbleIcon,
  SafeImage,
} from '../components/common/BrandAssets';
import { formatKRW } from '../utils/format';

type MobileScreen = 'home' | 'search' | 'category' | 'detail' | 'cart' | 'mypage';

export const MobileViewPage: React.FC = () => {
  const {
    products,
    cart,
    cartCount,
    currentMember,
    orders,
    addToCart,
    updateCartQty,
    removeCartItem,
    signInWithOAuthProvider,
    logout,
    showToast,
  } = useStore();

  const [screen, setScreen] = useState<MobileScreen>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [peeled, setPeeled] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTabId>('대게');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailProduct, setDetailProduct] = useState<Product>(products[0]);
  const [prepOption, setPrepOption] = useState<
    '활 상품✨ 오후3시마감' | '찜 추가🎁 오후1시마감'
  >('활 상품✨ 오후3시마감');
  const [fullWidthMode, setFullWidthMode] = useState(false);

  const bestTiles = products.filter((p) => p.isBestTile).slice(0, 6);
  const leftBest = bestTiles.filter((_, i) => i % 2 === 0);
  const rightBest = bestTiles.filter((_, i) => i % 2 === 1);
  const pickerProducts = products.filter((p) => p.pickerTab === pickerTab);

  const filteredList = products.filter((p) => {
    const matchCat = selectedCat === 'all' || p.category === selectedCat;
    const matchQ =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pickerTab.includes(searchTerm);
    return matchCat && matchQ;
  });

  const openProductDetail = (p: Product) => {
    setDetailProduct(p);
    setDrawerOpen(false);
    setScreen('detail');
  };

  const cartSubtotal = cart.reduce(
    (s, c) =>
      s +
      (c.unitPrice + c.prepExtraCost) * c.quantity +
      c.icePackQty * 500 +
      c.sauceQty * 3500,
    0
  );

  return (
    <div className="min-h-screen bg-[#e8e8ed] py-0 sm:py-6 px-0 sm:px-4 flex flex-col items-center">
      {/* Top Mode Switcher Bar (Desktop helper) */}
      <div className="hidden sm:flex w-full max-w-[920px] mb-4 px-5 py-3 rounded-full bg-white shadow-sm items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#0d5c63] text-white font-bold text-[11px]">
            MOBILE 390×844
          </span>
          <span className="font-bold text-[#1d1d1f]">
            크랩마스터 모바일 페이지 미리보기
          </span>
          <span className="text-[#6e6e73]">
            (장바구니·로그인·주문 상태가 PC 및 관리자 페이지와 실시간 연동됩니다)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFullWidthMode((v) => !v)}
            className="px-3 py-1.5 rounded-full bg-[#f5f5f7] font-bold text-[#1d1d1f] cursor-pointer"
          >
            {fullWidthMode ? '390px 프레임 보기' : '전체 너비 보기'}
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f5f5f7] font-bold text-[#1d1d1f]"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC 회원몰</span>
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1d1d1f] font-bold text-white"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff7b69]" />
            <span>관리자</span>
          </Link>
        </div>
      </div>

      {/* Smartphone Shell (390px width or full-width) */}
      <div
        className={`relative bg-white text-[#1d1d1f] flex flex-col overflow-hidden ${
          fullWidthMode
            ? 'w-full max-w-[640px] min-h-[844px] sm:rounded-[28px] shadow-2xl'
            : 'w-full sm:w-[390px] h-screen sm:h-[844px] sm:rounded-[40px] sm:border-[10px] sm:border-[#1d1d1f] shadow-2xl'
        }`}
      >
        {/* Mobile Ribbon */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="h-[38px] bg-[#f5f5f7] px-3 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#1d1d1f] shrink-0 cursor-pointer"
        >
          <KakaoBubbleIcon size={18} />
          <span>특가 뜨면 카톡이 울려요</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#0d5c63]" />
        </button>

        {/* Mobile Header (72px) */}
        <header className="h-[64px] px-4 bg-[#fbfbfd] border-b border-[#d2d2d7]/60 flex items-center justify-between shrink-0 z-20">
          <button
            type="button"
            onClick={() => {
              setScreen('home');
              setDrawerOpen(false);
            }}
            className="cursor-pointer"
          >
            <BrandLogo compact />
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                setScreen('search');
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer"
              aria-label="검색"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                setScreen('cart');
              }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer"
              aria-label="장바구니"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#0d5c63] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer"
              aria-label="메뉴"
            >
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Slide-down Sheet Drawer (#r2-sheet) pinned to frame */}
        {drawerOpen && (
          <div className="absolute inset-x-0 top-[102px] bottom-[60px] z-30 bg-white overflow-y-auto p-5">
            {currentMember ? (
              <div className="p-4 rounded-[16px] bg-[#f5f5f7] flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-bold text-[#0d5c63]">
                    {currentMember.grade} · {formatKRW(currentMember.points)}
                  </p>
                  <p className="text-[16px] font-extrabold">{currentMember.name}님</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 rounded-full bg-white text-[12px] font-bold text-[#6e6e73]"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="h-[42px] rounded-full border-[1.5px] border-[#0d5c63] text-[#0d5c63] text-[14px] font-bold flex items-center justify-center"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="h-[42px] rounded-full bg-[#0d5c63] text-white text-[14px] font-bold flex items-center justify-center"
                >
                  회원가입
                </Link>
              </div>
            )}

            <div className="divide-y divide-[#d2d2d7]/60 mb-5">
              {GNB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCat(cat.id);
                    setDrawerOpen(false);
                    setScreen('category');
                  }}
                  className="w-full min-h-[48px] flex items-center justify-between text-[18px] font-extrabold text-[#1d1d1f] cursor-pointer"
                >
                  <span>{cat.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#6e6e73]" />
                </button>
              ))}
            </div>

            <div className="p-4 rounded-[16px] bg-[#f5f5f7] mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#0d5c63]">
                  매주 1~2회 특별창고 오픈
                </p>
                <p className="text-[14px] font-extrabold">비밀창고 입장하기 →</p>
              </div>
              <KakaoBubbleIcon size={28} />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[13px] font-bold text-[#0d5c63]">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  setScreen('mypage');
                }}
                className="text-left cursor-pointer"
              >
                주문·배송 조회
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCat('all');
                  setDrawerOpen(false);
                  setScreen('category');
                }}
                className="text-left cursor-pointer"
              >
                전체 상품 보기
              </button>
              <Link to="/contact">1:1 문의하기</Link>
              <Link to="/">PC 화면으로 전환</Link>
              <Link to="/admin">관리자 페이지</Link>
            </div>
          </div>
        )}

        {/* Scrollable Mobile Viewport Content */}
        <div className="flex-1 overflow-y-auto relative pb-6">

          {/* Screen: HOME */}
          {screen === 'home' && (
            <div>
              {/* Mobile Hero */}
              <div className="px-4 pt-6 pb-8 text-center bg-white">
                <p className="text-[13px] font-bold text-[#0d5c63]">갑각류 전문 수산몰</p>
                <h1 className="mt-1 text-[34px] font-extrabold leading-[1.12] tracking-[-0.04em]">
                  대게 킹크랩은 <span className="text-[#0d5c63]">크랩마스터.</span>
                </h1>
                <p className="mt-2 text-[13px] text-[#6e6e73]">
                  러시아 선주 직송 활대게와 킹크랩. 직영 매장 4곳이 매일 아침 직접 골라 보내요.
                </p>

                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openProductDetail(products[0])}
                    className="h-[40px] px-5 rounded-full bg-[#0d5c63] text-white text-[13.5px] font-bold cursor-pointer"
                  >
                    대게 구매하기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCat('all');
                      setScreen('category');
                    }}
                    className="h-[40px] px-4 rounded-full bg-[#f5f5f7] text-[#0d5c63] text-[13.5px] font-bold cursor-pointer"
                  >
                    전체 품목 ›
                  </button>
                </div>

                {/* Toggle + Crab image */}
                <div className="mt-5 inline-flex p-1 rounded-full bg-[#f5f5f7]">
                  <button
                    type="button"
                    onClick={() => setPeeled(false)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold cursor-pointer ${
                      !peeled ? 'bg-[#1d1d1f] text-white' : 'text-[#6e6e73]'
                    }`}
                  >
                    통째로
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeeled(true)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold cursor-pointer ${
                      peeled ? 'bg-[#0d5c63] text-white' : 'text-[#6e6e73]'
                    }`}
                  >
                    까서 보기
                  </button>
                </div>

                <div
                  onClick={() => setPeeled((v) => !v)}
                  className="mt-3 relative aspect-[4/3] rounded-[18px] overflow-hidden cursor-pointer"
                >
                  <img
                    src={peeled ? '/images/hero-crab-open.jpg' : '/images/hero-crab-whole.jpg'}
                    alt="대게"
                    className="w-full h-full object-contain"
                  />
                  {peeled && (
                    <div className="absolute bottom-2 inset-x-2 grid grid-cols-2 gap-1.5 text-left">
                      <div className="p-2 rounded-[10px] bg-white/95 shadow text-[10.5px]">
                        <span className="font-extrabold text-[#0d5c63]">01 게딱지 속 장</span>
                        <p className="font-semibold text-[#1d1d1f]">밥 비벼 드세요</p>
                      </div>
                      <div className="p-2 rounded-[10px] bg-white/95 shadow text-[10.5px]">
                        <span className="font-extrabold text-[#0d5c63]">04 다리살</span>
                        <p className="font-semibold text-[#1d1d1f]">쭉 빼면 한 줄로</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile 2-col Staggered BEST Cards (.kkz-mc, right offset 56px) */}
              <div className="px-3 py-8 bg-white">
                <h2 className="text-[24px] font-extrabold text-center mb-5">
                  크랩마스터 BEST 상품
                </h2>
                <div className="grid grid-cols-2 gap-2.5 items-start">
                  <div className="space-y-2.5">
                    {leftBest.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[16px] bg-[#0b0b0b] text-white overflow-hidden"
                      >
                        <div className="aspect-square bg-[#161617]">
                          <SafeImage
                            src={item.image}
                            alt={item.shortName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-[15px] font-extrabold">{item.shortName}</h3>
                          <p className="text-[11px] text-[#a1a1a6] line-clamp-2 mt-0.5">
                            {item.subtitle}
                          </p>
                          <p className="mt-1.5 text-[13px] font-extrabold text-[#ff7b69]">
                            {formatKRW(item.price)}
                          </p>
                          <button
                            type="button"
                            onClick={() => openProductDetail(item)}
                            className="mt-2.5 w-full h-[32px] rounded-full bg-[#0d5c63] text-white text-[11.5px] font-bold cursor-pointer"
                          >
                            구매하기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 mt-[56px]">
                    {rightBest.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[16px] bg-[#0b0b0b] text-white overflow-hidden"
                      >
                        <div className="aspect-square bg-[#161617]">
                          <SafeImage
                            src={item.image}
                            alt={item.shortName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-[15px] font-extrabold">{item.shortName}</h3>
                          <p className="text-[11px] text-[#a1a1a6] line-clamp-2 mt-0.5">
                            {item.subtitle}
                          </p>
                          <p className="mt-1.5 text-[13px] font-extrabold text-[#ff7b69]">
                            {formatKRW(item.price)}
                          </p>
                          <button
                            type="button"
                            onClick={() => openProductDetail(item)}
                            className="mt-2.5 w-full h-[32px] rounded-full bg-[#0d5c63] text-white text-[11.5px] font-bold cursor-pointer"
                          >
                            구매하기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Segment Picker */}
              <div className="bg-[#f5f5f7] px-4 py-8">
                <h2 className="text-[22px] font-extrabold text-center">골라만 주세요.</h2>
                <div className="mt-4 flex gap-1.5 overflow-x-auto kk-no-scrollbar pb-2">
                  {PICKER_TABS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPickerTab(t)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] font-bold cursor-pointer ${
                        pickerTab === t
                          ? 'bg-[#1d1d1f] text-white'
                          : 'bg-white text-[#1d1d1f]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {pickerProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => openProductDetail(p)}
                      className="rounded-[14px] bg-white p-2.5 text-left cursor-pointer"
                    >
                      <div className="aspect-square rounded-[10px] bg-[#f5f5f7] overflow-hidden mb-2">
                        <SafeImage
                          src={p.image}
                          alt={p.shortName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[12.5px] font-bold line-clamp-2 min-h-[34px]">
                        {p.name}
                      </p>
                      <p className="mt-1 text-[13px] font-black text-[#e05a47]">
                        {p.discountRate > 0 ? `${p.discountRate}% ` : ''}
                        <span className="text-[#1d1d1f]">{formatKRW(p.price)}</span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Screen: SEARCH / CATEGORY */}
          {(screen === 'search' || screen === 'category') && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-full h-[42px] px-4">
                <Search className="w-4 h-4 text-[#6e6e73]" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="대게, 킹크랩, 전복…"
                  className="flex-1 bg-transparent text-[13.5px] outline-none"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto kk-no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCat('all')}
                  className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-bold ${
                    selectedCat === 'all' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7]'
                  }`}
                >
                  전체
                </button>
                {GNB_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCat(c.id)}
                    className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-bold ${
                      selectedCat === c.id ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {filteredList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openProductDetail(p)}
                    className="rounded-[14px] bg-[#f5f5f7] p-2.5 text-left cursor-pointer"
                  >
                    <div className="aspect-square rounded-[10px] bg-white overflow-hidden mb-2">
                      <SafeImage
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[12.5px] font-bold line-clamp-2">{p.name}</p>
                    <p className="mt-1 text-[13px] font-black text-[#1d1d1f]">
                      <span className="text-[#e05a47] mr-1">{p.discountRate}%</span>
                      {formatKRW(p.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Screen: PRODUCT DETAIL */}
          {screen === 'detail' && (
            <div className="p-4 space-y-4">
              <div className="aspect-square rounded-[18px] bg-[#f5f5f7] overflow-hidden">
                <SafeImage
                  src={detailProduct.image}
                  alt={detailProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0d5c63] text-white text-[11px] font-bold mb-1.5">
                  {detailProduct.badge || '추천'}
                </span>
                <h2 className="text-[18px] font-extrabold leading-snug">
                  {detailProduct.name}
                </h2>
                <div className="mt-1 flex items-center gap-1 text-[12px] text-[#6e6e73]">
                  <Star className="w-3.5 h-3.5 fill-[#e05a47] text-[#e05a47]" />
                  <strong className="text-[#1d1d1f]">{detailProduct.rating}</strong>
                  <span>리뷰 {detailProduct.reviewCount.toLocaleString()}</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[20px] font-black text-[#e05a47]">
                    {detailProduct.discountRate}%
                  </span>
                  <span className="text-[22px] font-black">
                    {formatKRW(detailProduct.price)}
                  </span>
                  <span className="text-[13px] text-[#6e6e73] line-through">
                    {formatKRW(detailProduct.originalPrice)}
                  </span>
                </div>
              </div>

              {detailProduct.supportsPrepOption && (
                <div className="grid grid-cols-2 gap-2">
                  {(
                    ['활 상품✨ 오후3시마감', '찜 추가🎁 오후1시마감'] as const
                  ).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPrepOption(opt)}
                      className={`p-2.5 rounded-[12px] border text-[12px] font-bold text-left cursor-pointer ${
                        prepOption === opt
                          ? 'border-[#0d5c63] bg-[#0d5c63]/5 text-[#0d5c63]'
                          : 'border-[#d2d2d7]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    addToCart({
                      productId: detailProduct.id,
                      productName: detailProduct.name,
                      image: detailProduct.image,
                      unitPrice: detailProduct.price,
                      originalPrice: detailProduct.originalPrice,
                      quantity: 1,
                      prepOption: detailProduct.supportsPrepOption
                        ? prepOption
                        : '기본 포장',
                      prepExtraCost:
                        detailProduct.supportsPrepOption &&
                        prepOption === '찜 추가🎁 오후1시마감'
                          ? detailProduct.steamingFee || 3000
                          : 0,
                      deliveryDate: '목(11/26)발송▶금(11/27)도착',
                      icePackQty: 0,
                      sauceQty: 0,
                    });
                    setScreen('cart');
                  }}
                  className="flex-1 h-[44px] rounded-full bg-[#0d5c63] text-white text-[14px] font-bold cursor-pointer"
                >
                  장바구니 담기
                </button>
                <Link
                  to={`/product/${detailProduct.id}`}
                  className="h-[44px] px-4 rounded-full border border-[#1d1d1f] text-[13px] font-bold flex items-center"
                >
                  상세 전체
                </Link>
              </div>
            </div>
          )}

          {/* Screen: CART */}
          {screen === 'cart' && (
            <div className="p-4 space-y-4">
              <h2 className="text-[20px] font-extrabold">장바구니 ({cartCount})</h2>
              {cart.length === 0 ? (
                <div className="py-16 text-center bg-[#f5f5f7] rounded-[18px]">
                  <p className="font-bold text-[15px]">장바구니가 비어 있습니다.</p>
                  <button
                    type="button"
                    onClick={() => setScreen('home')}
                    className="mt-4 px-5 py-2 rounded-full bg-[#0d5c63] text-white text-[13px] font-bold cursor-pointer"
                  >
                    상품 보러가기
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="p-3 rounded-[14px] bg-[#f5f5f7] flex gap-3"
                      >
                        <SafeImage
                          src={item.image}
                          alt={item.productName}
                          className="w-16 h-16 rounded-[10px] object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold truncate">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-[#6e6e73]">
                            {item.prepOption}
                            {item.icePackQty > 0 ? ` · 아이스팩 ${item.icePackQty}` : ''}
                            {item.sauceQty > 0 ? ` · 소스 ${item.sauceQty}` : ''}
                          </p>
                          <p className="text-[12.5px] font-extrabold text-[#1d1d1f] mt-0.5">
                            {formatKRW(
                              (item.unitPrice + item.prepExtraCost) * item.quantity +
                                item.icePackQty * 500 +
                                item.sauceQty * 3500
                            )}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-white rounded-full px-2 py-0.5 text-[12px] font-bold">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.cartItemId, -1)}
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.cartItemId, 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCartItem(item.cartItemId)}
                              className="text-[11px] text-[#0d5c63] font-bold"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-[16px] bg-[#f5f5f7] flex items-center justify-between">
                    <span className="text-[13px] font-bold">총 금액</span>
                    <span className="text-[18px] font-black text-[#e05a47]">
                      {formatKRW(cartSubtotal)}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    className="w-full h-[46px] rounded-full bg-[#0d5c63] text-white text-[14.5px] font-extrabold flex items-center justify-center"
                  >
                    주문서 작성하기
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Screen: MYPAGE */}
          {screen === 'mypage' && (
            <div className="p-4 space-y-4">
              {!currentMember ? (
                <div className="p-6 rounded-[18px] bg-[#f5f5f7] text-center space-y-2.5">
                  <p className="text-[17px] font-extrabold mb-1">크랩마스터 로그인</p>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await signInWithOAuthProvider('google');
                      if (!res.ok) {
                        showToast(res.error || 'Google OAuth 연결에 실패했습니다.');
                      }
                    }}
                    className="w-full h-[44px] rounded-[12px] bg-white border border-[#d2d2d7] text-[#1d1d1f] font-extrabold text-[13.5px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GoogleGIcon size={17} />
                    <span>구글 1초 로그인</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await signInWithOAuthProvider('kakao');
                      if (!res.ok) {
                        showToast(res.error || 'Kakao OAuth 연결에 실패했습니다.');
                      }
                    }}
                    className="w-full h-[44px] rounded-[12px] bg-[#fee500] text-[#3c1e1e] font-extrabold text-[13.5px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KakaoBubbleIcon size={18} />
                    <span>카카오 1초 로그인</span>
                  </button>
                  <Link
                    to="/login"
                    className="block pt-1 text-[12.5px] text-[#6e6e73] underline"
                  >
                    이메일 / 비회원 로그인 이동
                  </Link>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-[18px] bg-[#f5f5f7]">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0d5c63] text-white text-[11px] font-bold">
                      {currentMember.grade}
                    </span>
                    <p className="mt-1.5 text-[19px] font-extrabold">
                      {currentMember.name}님
                    </p>
                    <p className="text-[13px] text-[#6e6e73]">
                      적립금 <strong className="text-[#0d5c63]">{formatKRW(currentMember.points)}</strong>
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="text-[15px] font-extrabold">최근 주문 내역</h3>
                    {orders
                      .filter((o) => o.memberId === currentMember.id)
                      .map((o) => (
                        <div
                          key={o.id}
                          className="p-3.5 rounded-[14px] bg-[#f5f5f7] text-[13px]"
                        >
                          <div className="flex justify-between font-bold">
                            <span>{o.orderNo}</span>
                            <span className="text-[#0d5c63]">{o.status}</span>
                          </div>
                          <p className="text-[#6e6e73] truncate mt-1">
                            {o.items[0]?.productName}
                          </p>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Bottom 5-Tab Sticky Bar (.r2-tabbar, 60px) */}
        <nav className="h-[60px] bg-[#fbfbfd] border-t border-[#d2d2d7] grid grid-cols-5 shrink-0 z-40">
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            className="flex flex-col items-center justify-center gap-0.5 text-[#1d1d1f] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-semibold">전체메뉴</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              setScreen('search');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              screen === 'search' ? 'text-[#0d5c63]' : 'text-[#1d1d1f]'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-semibold">검색</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              setScreen('home');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              screen === 'home' ? 'text-[#0d5c63]' : 'text-[#1d1d1f]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">홈</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              setScreen('cart');
            }}
            className={`relative flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              screen === 'cart' ? 'text-[#0d5c63]' : 'text-[#1d1d1f]'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#0d5c63] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">장바구니</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              setScreen('mypage');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              screen === 'mypage' ? 'text-[#0d5c63]' : 'text-[#1d1d1f]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-semibold">마이쇼핑</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
