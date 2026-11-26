import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import type { Product } from '../types/store';
import { useStore } from '../context/storeContextValue';
import { SafeImage } from '../components/common/BrandAssets';
import { formatKRW } from '../utils/format';

const DELIVERY_DATES = [
  '목(11/26)발송▶금(11/27)도착',
  '금(11/27)발송▶토(11/28)도착',
  '월(11/30)발송▶화(12/01)도착',
  '화(12/01)발송▶수(12/02)도착',
];

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useStore();
  const product = products.find((p) => p.id === id) || products[0];

  return <ProductDetailContent key={product.id} product={product} />;
};

const ProductDetailContent: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const {
    reviews,
    inquiries,
    currentMember,
    addToCart,
    toggleWishlist,
    recordRecentView,
    addReview,
    addInquiry,
    showToast,
  } = useStore();

  const gallery = product.gallery?.length ? product.gallery : [product.image];

  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [prepOption, setPrepOption] = useState<
    '활 상품✨ 오후3시마감' | '찜 추가🎁 오후1시마감' | '기본 포장'
  >(product.supportsPrepOption ? '활 상품✨ 오후3시마감' : '기본 포장');
  const [deliveryDate, setDeliveryDate] = useState(DELIVERY_DATES[0]);
  const [quantity, setQuantity] = useState(1);
  const [icePackQty, setIcePackQty] = useState(0);
  const [sauceQty, setSauceQty] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'info' | 'reviews' | 'qna'>('desc');

  // Review & Inquiry form states
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newInquiryText, setNewInquiryText] = useState('');

  useEffect(() => {
    recordRecentView(product.id);
    window.scrollTo({ top: 0 });
  }, [product.id, recordRecentView]);

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const productInquiries = inquiries.filter((i) => i.productId === product.id);
  const isWished = currentMember?.wishlist.includes(product.id) ?? false;

  const prepExtraCost =
    prepOption === '찜 추가🎁 오후1시마감' ? product.steamingFee || 3000 : 0;
  const totalAmount =
    (product.price + prepExtraCost) * quantity +
    icePackQty * 500 +
    sauceQty * 3500;

  const buildCartPayload = () => ({
    productId: product.id,
    productName: product.name,
    image: product.image,
    unitPrice: product.price,
    originalPrice: product.originalPrice,
    quantity,
    prepOption,
    prepExtraCost,
    deliveryDate,
    icePackQty,
    sauceQty,
  });

  const handleAddToCart = () => {
    if (product.soldOut) {
      showToast('품절된 상품입니다.');
      return;
    }
    addToCart(buildCartPayload());
  };

  const handleBuyNow = () => {
    if (product.soldOut) {
      showToast('품절된 상품입니다.');
      return;
    }
    addToCart(buildCartPayload());
    navigate('/checkout');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    const name = currentMember?.name || '방문자';
    addReview({
      productId: product.id,
      productName: product.name,
      authorMasked: `${name[0]}*****`,
      authorName: name,
      rating: newReviewRating,
      content: newReviewText.trim(),
      isFeatured: newReviewRating === 5,
      verifiedPurchase: Boolean(currentMember),
    });
    setNewReviewText('');
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiryText.trim()) return;
    addInquiry({
      productId: product.id,
      productName: product.name,
      authorName: currentMember?.name || '비회원 고객',
      question: newInquiryText.trim(),
    });
    setNewInquiryText('');
  };

  return (
    <div className="bg-white pb-20">
      <div className="max-w-[1180px] mx-auto px-[22px] pt-6 md:pt-10">
        {/* Breadcrumb */}
        <div className="text-[13px] text-[#6e6e73] flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-[#1d1d1f]">홈</Link>
          <span>›</span>
          <Link to={`/products/${product.category}`} className="hover:text-[#1d1d1f]">
            {product.pickerTab}
          </Link>
          <span>›</span>
          <span className="text-[#1d1d1f] font-semibold truncate">{product.shortName}</span>
        </div>

        {/* 2-Column Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Gallery (~622px) */}
          <div className="lg:col-span-7">
            <div className="aspect-square rounded-[22px] bg-[#f5f5f7] overflow-hidden relative">
              <SafeImage
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.soldOut && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white text-[26px] font-black tracking-widest">
                    품절
                  </span>
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 rounded-[14px] overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      activeImage === imgUrl
                        ? 'border-[#0d5c63]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={imgUrl}
                      alt={`${product.shortName} 이미지 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Purchase Panel (~509px) */}
          <div className="lg:col-span-5">
            {product.badge && (
              <span className="inline-block px-3 py-1 rounded-full bg-[#0d5c63] text-white text-[12px] font-bold mb-2.5">
                {product.badge}
              </span>
            )}

            <h1 className="text-[21px] sm:text-[24px] font-extrabold text-[#1d1d1f] leading-snug">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-2 text-[13.5px]">
              <span className="inline-flex items-center gap-1 font-bold text-[#1d1d1f]">
                <Star className="w-4 h-4 fill-[#e05a47] text-[#e05a47]" />
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[#6e6e73]">
                리뷰 {product.reviewCount.toLocaleString()}개
              </span>
            </div>

            {/* Price */}
            <div className="mt-5 pb-5 border-b border-[#d2d2d7]/70">
              {product.originalPrice > product.price && (
                <p className="text-[14px] text-[#6e6e73] line-through">
                  {formatKRW(product.originalPrice)}
                </p>
              )}
              <div className="flex items-baseline gap-2 mt-0.5">
                {product.discountRate > 0 && (
                  <span className="text-[26px] font-black text-[#e05a47]">
                    {product.discountRate}%
                  </span>
                )}
                <span className="text-[28px] font-black text-[#1d1d1f]">
                  {formatKRW(product.price)}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="py-4 border-b border-[#d2d2d7]/70 space-y-2 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e73] flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> 배송
                </span>
                <span className="font-semibold text-[#1d1d1f]">
                  {product.shippingFee === 0
                    ? '무료배송 (신선특송)'
                    : `택배 · ${formatKRW(product.shippingFee)} (10만원 이상 무료)`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e73]">원산지 · 중량</span>
                <span className="font-semibold text-[#1d1d1f]">
                  {product.origin} · {product.weight}
                </span>
              </div>
            </div>

            {/* Custom Prep Option Selector */}
            {product.supportsPrepOption && (
              <div className="pt-5">
                <p className="text-[13px] font-bold text-[#1d1d1f] mb-2">
                  활/찜 선택
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPrepOption('활 상품✨ 오후3시마감')}
                    className={`p-3 rounded-[14px] border-2 text-left transition cursor-pointer ${
                      prepOption === '활 상품✨ 오후3시마감'
                        ? 'border-[#0d5c63] bg-[#0d5c63]/[0.04]'
                        : 'border-[#d2d2d7] hover:border-[#1d1d1f]'
                    }`}
                  >
                    <p className="text-[13px] font-extrabold text-[#1d1d1f]">
                      활 상품✨
                    </p>
                    <p className="text-[11.5px] text-[#6e6e73] mt-0.5">
                      오후 3시 마감 (+0원)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrepOption('찜 추가🎁 오후1시마감')}
                    className={`p-3 rounded-[14px] border-2 text-left transition cursor-pointer ${
                      prepOption === '찜 추가🎁 오후1시마감'
                        ? 'border-[#0d5c63] bg-[#0d5c63]/[0.04]'
                        : 'border-[#d2d2d7] hover:border-[#1d1d1f]'
                    }`}
                  >
                    <p className="text-[13px] font-extrabold text-[#1d1d1f]">
                      찜 추가🎁
                    </p>
                    <p className="text-[11.5px] text-[#6e6e73] mt-0.5">
                      오후 1시 마감 (+{formatKRW(product.steamingFee || 3000)})
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Date Select */}
            <div className="pt-4">
              <label className="block text-[13px] font-bold text-[#1d1d1f] mb-2">
                배송일 선택
              </label>
              <select
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full h-[44px] px-3.5 rounded-[12px] border border-[#d2d2d7] bg-white text-[14px] font-semibold text-[#1d1d1f] outline-none focus:border-[#0d5c63]"
              >
                {DELIVERY_DATES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Add-ons (Ice Pack & Sauce) */}
            <div className="pt-4 space-y-2.5">
              <p className="text-[13px] font-bold text-[#1d1d1f]">추가 구성</p>
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#f5f5f7]">
                <div>
                  <p className="text-[13.5px] font-bold text-[#1d1d1f]">
                    🧊 아이스팩 추가
                  </p>
                  <p className="text-[11.5px] text-[#6e6e73]">
                    개당 500원 · 기본 2팩 포함
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full border border-[#d2d2d7] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setIcePackQty((q) => Math.max(0, q - 1))}
                    className="w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-[13px] font-bold">{icePackQty}</span>
                  <button
                    type="button"
                    onClick={() => setIcePackQty((q) => q + 1)}
                    className="w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#f5f5f7]">
                <div>
                  <p className="text-[13.5px] font-bold text-[#1d1d1f]">
                    뱃사람 소스
                  </p>
                  <p className="text-[11.5px] text-[#6e6e73]">
                    개당 3,500원 · 게살·새우 특제 디핑소스
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full border border-[#d2d2d7] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setSauceQty((q) => Math.max(0, q - 1))}
                    className="w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-[13px] font-bold">{sauceQty}</span>
                  <button
                    type="button"
                    onClick={() => setSauceQty((q) => q + 1)}
                    className="w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quantity & Selected Option Summary */}
            <div className="mt-4 p-4 rounded-[16px] bg-[#f5f5f7] border border-[#d2d2d7]/70">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[13px]">
                  <p className="font-bold text-[#1d1d1f]">{prepOption}</p>
                  <p className="text-[12px] text-[#6e6e73]">{deliveryDate}</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full border border-[#d2d2d7] px-2.5 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-[14px] font-extrabold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price Bar */}
            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-[14px] font-bold text-[#6e6e73]">
                총 상품금액 (수량 {quantity}개)
              </span>
              <span className="text-[26px] font-black text-[#e05a47]">
                {formatKRW(totalAmount)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 h-[50px] rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white text-[16px] font-extrabold transition cursor-pointer"
              >
                바로 구매
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-[50px] rounded-full border-[1.5px] border-[#1d1d1f] bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-[16px] font-extrabold transition cursor-pointer"
              >
                장바구니
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="관심상품"
                className="w-[50px] h-[50px] rounded-full border-[1.5px] border-[#d2d2d7] flex items-center justify-center hover:border-[#0d5c63] transition cursor-pointer shrink-0"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWished ? 'fill-[#e05a47] text-[#0d5c63]' : 'text-[#1d1d1f]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Detail Tabs */}
        <div className="mt-14 border-b border-[#d2d2d7] sticky top-[72px] md:top-[80px] z-30 bg-white">
          <div className="grid grid-cols-4 max-w-[720px] mx-auto text-center">
            {[
              { id: 'desc', label: '상품설명' },
              { id: 'info', label: '상세정보' },
              { id: 'reviews', label: `후기 ${product.reviewCount.toLocaleString()}` },
              { id: 'qna', label: `문의 ${productInquiries.length}` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 text-[14.5px] font-bold border-b-2 transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#0d5c63] text-[#0d5c63]'
                    : 'border-transparent text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="max-w-[880px] mx-auto pt-10">
          {activeTab === 'desc' && (
            <div className="space-y-8 text-center">
              <div className="p-8 md:p-12 rounded-[24px] bg-[#f5f5f7]">
                <p className="text-[13px] font-bold text-[#0d5c63]">산지와 식탁 사이 크랩마스터</p>
                <h2 className="mt-2 text-[28px] md:text-[36px] font-extrabold text-[#1d1d1f]">
                  {product.shortName}
                </h2>
                <p className="mt-4 text-[16px] text-[#6e6e73] leading-relaxed max-w-[600px] mx-auto">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-6 rounded-[18px] bg-[#f5f5f7]">
                  <ShieldCheck className="w-7 h-7 text-[#0d5c63] mb-3" />
                  <h4 className="font-extrabold text-[#1d1d1f]">특A급 수율 선별</h4>
                  <p className="mt-1 text-[13.5px] text-[#6e6e73]">
                    인천·화성·하남·동탄 점장이 매일 아침 직접 수율 확인 후 발송합니다.
                  </p>
                </div>
                <div className="p-6 rounded-[18px] bg-[#f5f5f7]">
                  <CheckCircle2 className="w-7 h-7 text-[#0d5c63] mb-3" />
                  <h4 className="font-extrabold text-[#1d1d1f]">4종 풀키트 동봉</h4>
                  <p className="mt-1 text-[13.5px] text-[#6e6e73]">
                    식탁보·비닐장갑·게포크·물티슈를 함께 보내 편하게 드실 수 있습니다.
                  </p>
                </div>
                <div className="p-6 rounded-[18px] bg-[#f5f5f7]">
                  <Truck className="w-7 h-7 text-[#0d5c63] mb-3" />
                  <h4 className="font-extrabold text-[#1d1d1f]">신선 산소·보냉 포장</h4>
                  <p className="mt-1 text-[13.5px] text-[#6e6e73]">
                    아이스박스와 외박스 2중 포장으로 안전하게 배송됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="rounded-[20px] border border-[#d2d2d7] overflow-hidden text-[14px]">
              <table className="w-full">
                <tbody className="divide-y divide-[#d2d2d7]">
                  <tr>
                    <th className="w-1/3 bg-[#f5f5f7] p-4 text-left font-bold">품목명</th>
                    <td className="p-4">{product.name}</td>
                  </tr>
                  <tr>
                    <th className="bg-[#f5f5f7] p-4 text-left font-bold">원산지</th>
                    <td className="p-4">{product.origin}</td>
                  </tr>
                  <tr>
                    <th className="bg-[#f5f5f7] p-4 text-left font-bold">중량/구성</th>
                    <td className="p-4">{product.weight}</td>
                  </tr>
                  <tr>
                    <th className="bg-[#f5f5f7] p-4 text-left font-bold">배송 안내</th>
                    <td className="p-4">
                      활 상품 오후 3시 / 찜 상품 오후 1시 이전 결제 시 당일 출고 (익일 수령)
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-[#f5f5f7] p-4 text-left font-bold">교환·환불 안내</th>
                    <td className="p-4">
                      신선식품 특성상 단순 변심 반품은 어려우나, 수율 불량·파손 시 수령 당일 사진 첨부하시면 100% 보상해 드립니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="p-6 rounded-[20px] bg-[#f5f5f7] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold text-[#6e6e73]">구매자 평점</p>
                  <p className="text-[36px] font-black text-[#1d1d1f] flex items-center gap-2">
                    <Star className="w-7 h-7 fill-[#e05a47] text-[#e05a47]" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-[16px] font-semibold text-[#6e6e73]">/ 5.0</span>
                  </p>
                </div>
                <p className="text-[14px] font-semibold text-[#1d1d1f]">
                  총 {product.reviewCount.toLocaleString()}건의 리얼 후기
                </p>
              </div>

              {/* Write Review Form */}
              <form
                onSubmit={handleSubmitReview}
                className="p-5 rounded-[18px] border border-[#d2d2d7] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold">구매 후기 작성하기</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newReviewRating
                              ? 'fill-[#e05a47] text-[#0d5c63]'
                              : 'text-[#d2d2d7]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  rows={3}
                  placeholder="수율, 신선도, 배송 후기를 남겨주세요."
                  className="w-full p-3 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none"
                />
                <div className="text-right">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#0d5c63] text-white text-[13.5px] font-bold cursor-pointer"
                  >
                    후기 등록
                  </button>
                </div>
              </form>

              <div className="divide-y divide-[#d2d2d7]/70">
                {productReviews.length === 0 ? (
                  <p className="py-8 text-center text-[#6e6e73]">
                    첫 번째 후기를 남겨보세요!
                  </p>
                ) : (
                  productReviews.map((rev) => (
                    <div key={rev.id} className="py-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex text-[#0d5c63]">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#e05a47]" />
                            ))}
                          </div>
                          <span className="text-[13px] font-bold">{rev.authorMasked}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6e6e73] font-semibold">
                              네이버페이/회원 구매
                            </span>
                          )}
                        </div>
                        <span className="text-[12px] text-[#6e6e73]">{rev.createdAt}</span>
                      </div>
                      <p className="text-[14.5px] text-[#1d1d1f] leading-relaxed">
                        {rev.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'qna' && (
            <div id="qna" className="space-y-6">
              <form
                onSubmit={handleSubmitInquiry}
                className="p-5 rounded-[18px] border border-[#d2d2d7] flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={newInquiryText}
                  onChange={(e) => setNewInquiryText(e.target.value)}
                  placeholder="배송일, 손질, 수율에 대해 궁금한 점을 남겨주세요."
                  className="flex-1 h-[44px] px-4 rounded-full bg-[#f5f5f7] text-[14px] outline-none"
                />
                <button
                  type="submit"
                  className="h-[44px] px-6 rounded-full bg-[#1d1d1f] text-white text-[14px] font-bold cursor-pointer"
                >
                  문의 등록
                </button>
              </form>

              <div className="divide-y divide-[#d2d2d7]/70">
                {productInquiries.length === 0 ? (
                  <p className="py-8 text-center text-[#6e6e73]">
                    등록된 상품 문의가 없습니다.
                  </p>
                ) : (
                  productInquiries.map((inq) => (
                    <div key={inq.id} className="py-5 space-y-2.5">
                      <div className="flex items-center justify-between text-[12.5px] text-[#6e6e73]">
                        <span className="font-bold text-[#1d1d1f]">{inq.authorName}</span>
                        <span>{inq.createdAt}</span>
                      </div>
                      <p className="text-[14.5px] font-semibold text-[#1d1d1f]">
                        Q. {inq.question}
                      </p>
                      {inq.answer ? (
                        <div className="p-4 rounded-[14px] bg-[#f5f5f7] text-[13.5px] text-[#1d1d1f]">
                          <p className="font-bold text-[#0d5c63] mb-1">
                            A. 크랩마스터 답변 ({inq.answeredAt})
                          </p>
                          <p>{inq.answer}</p>
                        </div>
                      ) : (
                        <p className="text-[12.5px] text-[#6e6e73]">답변 대기중입니다.</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
