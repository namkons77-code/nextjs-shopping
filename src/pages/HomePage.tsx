import React, { useMemo, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  MapPin,
  Pause,
  Play,
  Scale,
  Star,
} from 'lucide-react';
import { PICKER_TABS } from '../data/seedData';
import { useStore } from '../context/storeContextValue';
import type { PickerTabId } from '../types/store';
import { HeroCrabStage } from '../components/home/HeroCrabStage';
import { ProductCard } from '../components/common/ProductCard';
import { SafeImage } from '../components/common/BrandAssets';

interface LayoutOutletCtx {
  onOpenVault: () => void;
  onOpenKakao: () => void;
}

export const HomePage: React.FC = () => {
  const { products, reviews, branches } = useStore();
  const outletCtx = useOutletContext<LayoutOutletCtx | undefined>();
  const [activePickerTab, setActivePickerTab] = useState<PickerTabId>('대게');
  const [marqueePaused, setMarqueePaused] = useState(false);
  const reviewRailRef = useRef<HTMLDivElement>(null);

  const { leftBestTiles, rightBestTiles } = useMemo(() => {
    const best = products.filter((p) => p.isBestTile).slice(0, 6);
    return {
      leftBestTiles: best.filter((_, idx) => idx % 2 === 0),
      rightBestTiles: best.filter((_, idx) => idx % 2 === 1),
    };
  }, [products]);

  const pickerProducts = useMemo(
    () => products.filter((p) => p.pickerTab === activePickerTab),
    [products, activePickerTab]
  );

  const featuredReviews = useMemo(
    () => reviews.filter((r) => r.isFeatured),
    [reviews]
  );

  const scrollReviews = (dir: 'prev' | 'next') => {
    if (!reviewRailRef.current) return;
    reviewRailRef.current.scrollBy({
      left: dir === 'next' ? 360 : -360,
      behavior: 'smooth',
    });
  };

  return (
    <div>
      {/* 1. Hero Section + Interactive Crab Anatomy */}
      <HeroCrabStage />

      {/* 2. 크랩마스터 BEST 상품 (.r2-tiles / .kkz-split) */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-[1220px] mx-auto px-[18px] md:px-[22px]">
          <h2 className="text-[32px] md:text-[51px] font-extrabold tracking-[-0.035em] text-[#1d1d1f] text-center mb-10 md:mb-14">
            크랩마스터 BEST 상품
          </h2>

          {/* Desktop 2-column staggered dark tiles (right col offset 200px) */}
          <div className="hidden md:grid grid-cols-2 gap-6 items-start">
            {/* Left Column */}
            <div className="space-y-6">
              {leftBestTiles.map((item) => (
                <div
                  key={item.id}
                  className="relative min-h-[360px] rounded-[22px] bg-[#0b0b0b] text-white overflow-hidden flex items-center p-8 lg:p-10 group"
                >
                  <div className="relative z-10 max-w-[56%]">
                    {item.bestTileTag && (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#0d5c63] text-white text-[12px] font-bold mb-3">
                        {item.bestTileTag}
                      </span>
                    )}
                    <h3 className="text-[30px] lg:text-[36px] font-extrabold tracking-[-0.03em] leading-tight">
                      {item.shortName}
                    </h3>
                    <p className="mt-2.5 text-[15px] lg:text-[16px] text-[#d2d2d7] leading-relaxed">
                      {item.subtitle}
                    </p>
                    <p className="mt-3 text-[18px] font-extrabold text-[#ff7b69]">
                      {item.bestTileSubtext || `${item.price.toLocaleString()}원`}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      <Link
                        to={`/product/${item.id}`}
                        className="h-[44px] px-6 rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white text-[14.5px] font-bold inline-flex items-center justify-center transition"
                      >
                        구매하기
                      </Link>
                      <Link
                        to={`/product/${item.id}`}
                        className="h-[44px] px-5 rounded-full border-[1.5px] border-white/85 hover:bg-white/10 text-white text-[14.5px] font-bold inline-flex items-center justify-center transition"
                      >
                        더 알아보기
                      </Link>
                    </div>
                  </div>
                  <div className="absolute inset-y-0 right-0 w-[62%] pointer-events-none">
                    <SafeImage
                      src={item.image}
                      alt={item.shortName}
                      className="w-full h-full object-cover kk-tile-mask group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/60 to-transparent" />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column with 200px top stagger offset */}
            <div className="space-y-6 md:mt-[180px]">
              {rightBestTiles.map((item) => (
                <div
                  key={item.id}
                  className="relative min-h-[360px] rounded-[22px] bg-[#0b0b0b] text-white overflow-hidden flex items-center p-8 lg:p-10 group"
                >
                  <div className="relative z-10 max-w-[56%]">
                    <h3 className="text-[30px] lg:text-[36px] font-extrabold tracking-[-0.03em] leading-tight">
                      {item.shortName}
                    </h3>
                    <p className="mt-2.5 text-[15px] lg:text-[16px] text-[#d2d2d7] leading-relaxed">
                      {item.subtitle}
                    </p>
                    <p className="mt-3 text-[16px] font-extrabold text-[#ff7b69]">
                      {item.bestTileSubtext || `${item.price.toLocaleString()}원`}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      <Link
                        to={`/product/${item.id}`}
                        className="h-[44px] px-6 rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white text-[14.5px] font-bold inline-flex items-center justify-center transition"
                      >
                        구매하기
                      </Link>
                      <Link
                        to={`/product/${item.id}`}
                        className="h-[44px] px-5 rounded-full border-[1.5px] border-white/85 hover:bg-white/10 text-white text-[14.5px] font-bold inline-flex items-center justify-center transition"
                      >
                        더 알아보기
                      </Link>
                    </div>
                  </div>
                  <div className="absolute inset-y-0 right-0 w-[62%] pointer-events-none">
                    <SafeImage
                      src={item.image}
                      alt={item.shortName}
                      className="w-full h-full object-cover kk-tile-mask group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/60 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile 2-column staggered dark tiles (.kkz-mc, right col 56px offset) */}
          <div className="grid md:hidden grid-cols-2 gap-2.5 items-start">
            <div className="space-y-2.5">
              {leftBestTiles.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[16px] bg-[#0b0b0b] text-white overflow-hidden flex flex-col"
                >
                  <div className="aspect-square bg-[#161617] overflow-hidden">
                    <SafeImage
                      src={item.image}
                      alt={item.shortName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5">
                    {item.bestTileTag && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#0d5c63] text-white text-[10px] font-bold mb-1.5">
                        인기 1위
                      </span>
                    )}
                    <h3 className="text-[17px] font-extrabold leading-tight">
                      {item.shortName}
                    </h3>
                    <p className="mt-1 text-[12px] text-[#a1a1a6] line-clamp-2">
                      {item.subtitle}
                    </p>
                    <p className="mt-2 text-[14px] font-extrabold text-[#ff7b69]">
                      {item.price.toLocaleString()}원
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <Link
                        to={`/product/${item.id}`}
                        className="h-[34px] rounded-full bg-[#0d5c63] text-white text-[12px] font-bold flex items-center justify-center"
                      >
                        구매하기
                      </Link>
                      <Link
                        to={`/product/${item.id}`}
                        className="h-[32px] rounded-full border border-white/70 text-white text-[12px] font-bold flex items-center justify-center"
                      >
                        더 알아보기
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 mt-[56px]">
              {rightBestTiles.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[16px] bg-[#0b0b0b] text-white overflow-hidden flex flex-col"
                >
                  <div className="aspect-square bg-[#161617] overflow-hidden">
                    <SafeImage
                      src={item.image}
                      alt={item.shortName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-[17px] font-extrabold leading-tight">
                      {item.shortName}
                    </h3>
                    <p className="mt-1 text-[12px] text-[#a1a1a6] line-clamp-2">
                      {item.subtitle}
                    </p>
                    <p className="mt-2 text-[14px] font-extrabold text-[#ff7b69]">
                      {item.price.toLocaleString()}원
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <Link
                        to={`/product/${item.id}`}
                        className="h-[34px] rounded-full bg-[#0d5c63] text-white text-[12px] font-bold flex items-center justify-center"
                      >
                        구매하기
                      </Link>
                      <Link
                        to={`/product/${item.id}`}
                        className="h-[32px] rounded-full border border-white/70 text-white text-[12px] font-bold flex items-center justify-center"
                      >
                        더 알아보기
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. 골라만 주세요. (#r2-pick) */}
      <section id="r2-pick" className="py-16 md:py-24 bg-[#f5f5f7]">
        <div className="max-w-[1180px] mx-auto px-[22px]">
          <div className="text-center max-w-[600px] mx-auto">
            <h2 className="text-[34px] md:text-[51px] font-extrabold tracking-[-0.035em] text-[#1d1d1f]">
              골라만 주세요.
            </h2>
            <p className="mt-3 text-[16px] md:text-[18px] text-[#6e6e73]">
              러시아 활대게부터 포항 대게까지. 쪄서 바로 드세요!
            </p>
          </div>

          {/* 8 Pill Segment Tabs (.r2-seg) */}
          <div className="mt-8 flex items-center justify-start md:justify-center gap-2 overflow-x-auto kk-no-scrollbar pb-2">
            {PICKER_TABS.map((tab) => {
              const active = activePickerTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivePickerTab(tab)}
                  className={`shrink-0 h-[40px] px-5 rounded-full text-[14.5px] font-bold transition cursor-pointer ${
                    active
                      ? 'bg-[#1d1d1f] text-white shadow-sm'
                      : 'bg-white text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Horizontal Product Cards */}
          <div className="mt-8 flex gap-4 overflow-x-auto kk-no-scrollbar pb-4">
            {pickerProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-[15px] font-bold text-[#0d5c63] hover:underline"
            >
              <span>전체 상품 목록 보기</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. 브랜드 마키 띠 섹션 (.r2-formula) */}
      <section className="relative bg-[#0d5c63] text-white py-14 md:py-20 overflow-hidden select-none">
        <div className="space-y-2 md:space-y-4">
          <div className="flex whitespace-nowrap">
            <div
              className={`flex items-center gap-8 text-[44px] sm:text-[64px] md:text-[96px] font-black tracking-[-0.04em] leading-none kk-marquee-left ${
                marqueePaused ? 'kk-marquee-paused' : ''
              }`}
            >
              <span>대게 킹크랩은 크랩마스터 ·</span>
              <span>대게 킹크랩은 크랩마스터 ·</span>
              <span>대게 킹크랩은 크랩마스터 ·</span>
              <span>대게 킹크랩은 크랩마스터 ·</span>
            </div>
          </div>

          <div className="flex whitespace-nowrap">
            <div
              className={`flex items-center gap-8 text-[44px] sm:text-[64px] md:text-[96px] font-black tracking-[-0.04em] leading-none kk-stroke-text kk-marquee-right ${
                marqueePaused ? 'kk-marquee-paused' : ''
              }`}
            >
              <span>산지와 식탁 사이 크랩마스터 ·</span>
              <span>특A급 수율보장 크랩마스터 ·</span>
              <span>산지와 식탁 사이 크랩마스터 ·</span>
              <span>특A급 수율보장 크랩마스터 ·</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMarqueePaused((v) => !v)}
          aria-label={marqueePaused ? '재생' : '일시정지'}
          className="absolute right-5 bottom-5 w-10 h-10 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
        >
          {marqueePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </section>

      {/* 5. 활 vs 자숙 비교 섹션 (.r2-compare) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1180px] mx-auto px-[22px]">
          <div className="text-center max-w-[640px] mx-auto mb-12">
            <h2 className="text-[32px] md:text-[51px] font-extrabold tracking-[-0.035em] text-[#1d1d1f]">
              활로 받을까, 쪄서 받을까.
            </h2>
            <p className="mt-3 text-[16px] md:text-[18px] text-[#6e6e73]">
              대게·킹크랩·홍게는 두 가지로 받을 수 있어요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 활 */}
            <div className="rounded-[24px] bg-[#f5f5f7] p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1d1d1f] mb-5">
                  <Droplets className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-[28px] md:text-[34px] font-extrabold text-[#1d1d1f]">
                  활
                </h3>
                <p className="mt-2 text-[16px] text-[#6e6e73]">
                  살아있는 상태로 보내드려요. 배송 중 폐사할 수 있어요.
                </p>

                <dl className="mt-6 space-y-3 pt-6 border-t border-[#d2d2d7]">
                  <div className="flex justify-between gap-4 text-[15px]">
                    <dt className="font-bold text-[#6e6e73]">이런 분께</dt>
                    <dd className="font-semibold text-[#1d1d1f] text-right">
                      갓 쪄낸 맛을 집에서 내고 싶을 때
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 text-[15px]">
                    <dt className="font-bold text-[#6e6e73]">받은 뒤</dt>
                    <dd className="font-semibold text-[#1d1d1f] text-right">
                      바로 찌거나 냉장 보관
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-7">
                <Link
                  to="/products/crab?prep=활"
                  className="inline-flex items-center gap-1 text-[15px] font-bold text-[#0d5c63] hover:underline"
                >
                  <span>활 상품 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 자숙 */}
            <div className="rounded-[24px] bg-[#f5f5f7] p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1d1d1f] mb-5">
                  <Flame className="w-6 h-6 text-[#0d5c63]" />
                </div>
                <h3 className="text-[28px] md:text-[34px] font-extrabold text-[#1d1d1f]">
                  자숙
                </h3>
                <p className="mt-2 text-[16px] text-[#6e6e73]">
                  매장에서 쪄서 보내드려요.
                </p>

                <dl className="mt-6 space-y-3 pt-6 border-t border-[#d2d2d7]">
                  <div className="flex justify-between gap-4 text-[15px]">
                    <dt className="font-bold text-[#6e6e73]">이런 분께</dt>
                    <dd className="font-semibold text-[#1d1d1f] text-right">
                      손질·찜 없이 바로 드시고 싶을 때
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 text-[15px]">
                    <dt className="font-bold text-[#6e6e73]">받은 뒤</dt>
                    <dd className="font-semibold text-[#1d1d1f] text-right">
                      그대로 또는 살짝 데워서
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-7">
                <Link
                  to="/products/crab?prep=자숙"
                  className="inline-flex items-center gap-1 text-[15px] font-bold text-[#0d5c63] hover:underline"
                >
                  <span>자숙 상품 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 신뢰 포인트 벤토 그리드 (.r2-why) */}
      <section id="r2-why" className="py-16 md:py-24 bg-[#f5f5f7]">
        <div className="max-w-[1180px] mx-auto px-[22px]">
          <h2 className="text-[32px] md:text-[51px] font-extrabold tracking-[-0.035em] text-[#1d1d1f] text-center mb-12">
            고르는 사람이 다릅니다.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Top-Left Navy Gradient Card */}
            <div className="md:col-span-7 rounded-[28px] bg-gradient-to-br from-[#0f2544] via-[#133361] to-[#1a498a] text-white p-8 md:p-10 flex flex-col justify-between min-h-[290px]">
              <div>
                <p className="text-[14px] font-bold text-white/75">베링해에서 식탁까지</p>
                <p className="mt-1 text-[44px] md:text-[56px] font-black tracking-tight leading-none">
                  48시간
                </p>
                <p className="mt-3 text-[15.5px] text-white/85 max-w-[420px]">
                  러시아 선주에게서 바로 받아요. 중간 유통을 줄인 만큼 빨리 도착해요.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2 text-[13px] font-bold">
                <span className="px-3.5 py-1.5 rounded-full bg-white/15">베링해 선주</span>
                <ChevronRight className="w-4 h-4 text-white/60" />
                <span className="px-3.5 py-1.5 rounded-full bg-white/15">직영 매장 선별</span>
                <ChevronRight className="w-4 h-4 text-white/60" />
                <span className="px-3.5 py-1.5 rounded-full bg-white text-[#0f2544]">
                  우리 집 식탁
                </span>
              </div>
            </div>

            {/* Top-Right White Card */}
            <div className="md:col-span-5 rounded-[28px] bg-white p-8 md:p-10 flex flex-col justify-between min-h-[290px]">
              <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-[#0d5c63]">
                <Scale className="w-6 h-6" />
              </div>
              <div className="mt-6">
                <h3 className="text-[26px] md:text-[30px] font-extrabold text-[#1d1d1f] leading-tight">
                  특A급만, 수율보장.
                </h3>
                <p className="mt-3 text-[15.5px] text-[#6e6e73] leading-relaxed">
                  살이 덜 찬 게는 보내지 않아요. 무게 대비 살이 꽉 찬 것만 골라요.
                </p>
              </div>
            </div>

            {/* Bottom Full-Width Red Card */}
            <div className="md:col-span-12 rounded-[28px] bg-[#0d5c63] text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-[600px]">
                <h3 className="text-[26px] md:text-[32px] font-extrabold leading-tight">
                  산소포장, 아이스박스, 외박스까지.
                </h3>
                <p className="mt-2.5 text-[15px] text-white/90 leading-relaxed">
                  식탁보·비닐장갑·게포크·물티슈는 자사 소매점에서 출고하는 대게·킹크랩·랍스터 상품에 함께 보내드려요.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                {['식탁보', '비닐장갑', '게포크', '물티슈'].map((kit) => (
                  <span
                    key={kit}
                    className="px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[14px] font-bold border border-white/25"
                  >
                    {kit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 직영 매장 점장 섹션 (.r2-pickers) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1180px] mx-auto px-[22px]">
          <div className="text-center max-w-[640px] mx-auto mb-12">
            <p className="text-[15px] font-bold text-[#0d5c63] mb-2">고르는 사람들</p>
            <h2 className="text-[32px] md:text-[51px] font-extrabold tracking-[-0.035em] text-[#1d1d1f]">
              매장에서 직접 고르세요
            </h2>
            <p className="mt-3 text-[17px] text-[#6e6e73]">
              아침마다 게부터 고르는 점장님들.
            </p>
            <p className="mt-1.5 text-[13px] text-[#86868b]">
              매장 상품은 매장에서 바로 구매해 주세요. 온라인 주문은 택배 배송만 가능합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="group rounded-[22px] bg-[#f5f5f7] overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#e5e5ea]">
                  <SafeImage
                    src={branch.image}
                    alt={branch.role}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {branch.isNew && (
                      <span className="px-2.5 py-1 rounded-full bg-[#0d5c63] text-white text-[11px] font-bold">
                        신규
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-white/90 text-[#1d1d1f] text-[11px] font-bold">
                      {branch.status}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[17px] font-extrabold leading-snug">
                      "{branch.quote}"
                    </p>
                    <p className="mt-2 text-[13px] font-semibold text-white/85 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#ff7b69]" />
                      <span>{branch.role} · 매장 위치 보기 ›</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 text-[12.5px] text-[#6e6e73]">
                  <p className="font-bold text-[#1d1d1f]">{branch.name} · {branch.phone}</p>
                  <p className="mt-0.5 truncate">{branch.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 구매 후기 레일 섹션 (#r2-reviews) */}
      <section id="r2-reviews" className="py-16 md:py-24 bg-white border-t border-[#f5f5f7]">
        <div className="max-w-[1180px] mx-auto px-[22px]">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[32px] md:text-[44px] font-extrabold tracking-[-0.035em] text-[#1d1d1f]">
                먼저 받아본 분들.
              </h2>
              <p className="mt-1 text-[16px] text-[#6e6e73]">최근 별 5점 후기</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/reviews"
                className="text-[14.5px] font-bold text-[#0d5c63] hover:underline mr-2"
              >
                후기 전체 보기 ›
              </Link>
              <button
                type="button"
                onClick={() => scrollReviews('prev')}
                aria-label="이전 후기"
                className="w-10 h-10 rounded-full bg-[#f5f5f7] hover:bg-[#e5e5ea] flex items-center justify-center text-[#1d1d1f] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollReviews('next')}
                aria-label="다음 후기"
                className="w-10 h-10 rounded-full bg-[#f5f5f7] hover:bg-[#e5e5ea] flex items-center justify-center text-[#1d1d1f] cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={reviewRailRef}
            className="flex gap-4 overflow-x-auto kk-no-scrollbar pb-2"
          >
            {featuredReviews.map((rev) => (
              <div
                key={rev.id}
                className="w-[300px] sm:w-[340px] shrink-0 rounded-[18px] bg-[#f5f5f7] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-0.5 text-[#0d5c63] mb-3">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-[#e05a47]" />
                    ))}
                  </div>
                  <p className="text-[15px] text-[#1d1d1f] leading-relaxed line-clamp-5">
                    {rev.content}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#d2d2d7]/60 flex items-center justify-between text-[12.5px] text-[#6e6e73]">
                  <span>{rev.authorMasked}</span>
                  <Link
                    to={`/product/${rev.productId}`}
                    className="font-bold text-[#0d5c63] hover:underline"
                  >
                    후기 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. 법인/단체 선물 다크 섹션 (#r2-gift) */}
      <section id="r2-gift" className="bg-black text-white py-16 md:py-24">
        <div className="max-w-[1180px] mx-auto px-[22px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-[24px] overflow-hidden bg-[#161617]">
              <SafeImage
                src="/images/gift-box.jpg"
                alt="크랩마스터 법인·단체 프리미엄 선물세트"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-extrabold tracking-[-0.03em] leading-tight">
              명단만 주시면,
              <br />
              여러 곳에 나눠 보내요.
            </h2>
            <p className="mt-3 text-[16px] text-[#a1a1a6]">
              명절·창립·감사 선물. 한 번 주문으로 받는 분마다 따로 배송해드려요.
            </p>

            {/* 2x2 Dark Grid (#161617 with 1px gap) */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/15 rounded-[18px] overflow-hidden border border-white/15">
              <div className="bg-[#161617] p-5">
                <p className="text-[15px] font-bold text-white">엑셀 명단으로 여러 배송지 한 번에</p>
                <p className="mt-1 text-[13px] text-[#a1a1a6]">주소·희망일 일괄 등록</p>
              </div>
              <div className="bg-[#161617] p-5">
                <p className="text-[15px] font-bold text-white">온도대별 합포장</p>
                <p className="mt-1 text-[13px] text-[#a1a1a6]">활·자숙·냉동 맞춤 보냉</p>
              </div>
              <div className="bg-[#161617] p-5">
                <p className="text-[15px] font-bold text-white">세금계산서 거래명세서 발행</p>
                <p className="mt-1 text-[13px] text-[#a1a1a6]">법인카드·후불 계산서 지원</p>
              </div>
              <div className="bg-[#161617] p-5">
                <p className="text-[15px] font-bold text-white">메시지 카드 보냉 패키지</p>
                <p className="mt-1 text-[13px] text-[#a1a1a6]">기업 로고·감사 문구 동봉</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="tel:031-8043-2244"
                className="h-[48px] px-7 rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white text-[15px] font-bold inline-flex items-center justify-center transition"
              >
                전화로 물어보기
              </a>
              <button
                type="button"
                onClick={() => outletCtx?.onOpenKakao()}
                className="h-[48px] px-7 rounded-full bg-white/15 hover:bg-white/25 text-white text-[15px] font-bold inline-flex items-center justify-center transition cursor-pointer"
              >
                카톡으로 물어보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Outro (.r2-outro) */}
      <section className="py-20 md:py-28 bg-white text-center">
        <div className="max-w-[820px] mx-auto px-[22px]">
          <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-extrabold tracking-[-0.04em] text-[#1d1d1f]">
            대게 킹크랩은 <span className="text-[#0d5c63]">크랩마스터.</span>
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/products/crab?tab=대게"
              className="h-[48px] px-8 rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white text-[16px] font-bold inline-flex items-center justify-center transition"
            >
              대게 고르기
            </Link>
            <Link
              to="/products/crab?tab=킹크랩"
              className="h-[48px] px-8 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-[16px] font-bold inline-flex items-center justify-center transition"
            >
              킹크랩 고르기
            </Link>
          </div>
          <p className="mt-5 text-[14px] text-[#6e6e73]">
            살 때마다 적립금이 쌓여요. 등급이 오르면 적립률도 올라가요.
          </p>
        </div>
      </section>
    </div>
  );
};
