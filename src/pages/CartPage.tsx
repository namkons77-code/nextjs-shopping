import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/storeContextValue';
import { SafeImage } from '../components/common/BrandAssets';
import { formatKRW } from '../utils/format';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQty,
    toggleCartSelected,
    toggleAllCartSelected,
    removeCartItem,
    clearSelectedCart,
  } = useStore();
  const navigate = useNavigate();

  const allSelected = cart.length > 0 && cart.every((c) => c.selected);
  const selectedItems = cart.filter((c) => c.selected);

  const calcItemTotal = (item: (typeof cart)[number]) =>
    (item.unitPrice + item.prepExtraCost) * item.quantity +
    item.icePackQty * 500 +
    item.sauceQty * 3500;

  const subtotal = selectedItems.reduce((sum, item) => sum + calcItemTotal(item), 0);
  const shippingFee = subtotal >= 100000 || subtotal === 0 ? 0 : 4000;
  const totalAmount = subtotal + shippingFee;
  const freeShippingRemaining = Math.max(0, 100000 - subtotal);

  return (
    <div className="bg-white pb-24">
      {/* Header + 3-step indicator */}
      <div className="bg-[#f5f5f7] py-10 px-4 text-center">
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#1d1d1f]">
          장바구니
        </h1>
        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4 text-[13px] sm:text-[14px] font-bold">
          <span className="px-3.5 py-1.5 rounded-full bg-[#0d5c63] text-white">
            1. 장바구니
          </span>
          <span className="text-[#6e6e73]">→</span>
          <span className="text-[#6e6e73]">2. 주문서작성</span>
          <span className="text-[#6e6e73]">→</span>
          <span className="text-[#6e6e73]">3. 주문완료</span>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-[22px] pt-10">
        {cart.length === 0 ? (
          <div className="py-24 text-center rounded-[24px] bg-[#f5f5f7]">
            <ShoppingBag className="w-12 h-12 text-[#6e6e73] mx-auto mb-4 stroke-[1.5]" />
            <p className="text-[19px] font-bold text-[#1d1d1f]">
              장바구니가 비어 있습니다.
            </p>
            <p className="mt-2 text-[14px] text-[#6e6e73]">
              신선한 활대게와 킹크랩을 담아보세요.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex h-[46px] px-7 rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white text-[15px] font-bold items-center justify-center transition"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#d2d2d7]">
                <label className="inline-flex items-center gap-2 text-[14px] font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleAllCartSelected(e.target.checked)}
                    className="w-4 h-4 accent-[#0d5c63]"
                  />
                  <span>전체 선택 ({selectedItems.length}/{cart.length})</span>
                </label>
                <button
                  type="button"
                  onClick={clearSelectedCart}
                  className="text-[13px] font-semibold text-[#6e6e73] hover:text-[#0d5c63] cursor-pointer"
                >
                  선택 삭제
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-4 sm:p-5 rounded-[18px] bg-[#f5f5f7] flex gap-4 items-start"
                >
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleCartSelected(item.cartItemId)}
                    className="mt-1 w-4 h-4 accent-[#0d5c63] shrink-0"
                  />
                  <Link
                    to={`/product/${item.productId}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-[14px] overflow-hidden bg-white shrink-0"
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-[15px] sm:text-[16px] font-bold text-[#1d1d1f] leading-snug hover:underline"
                      >
                        {item.productName}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.cartItemId)}
                        className="text-[#6e6e73] hover:text-[#0d5c63] p-1 cursor-pointer"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-1.5 text-[12.5px] text-[#6e6e73] space-y-0.5">
                      <p>옵션: {item.prepOption} {item.prepExtraCost > 0 ? `(+${formatKRW(item.prepExtraCost)})` : ''}</p>
                      <p>배송일: {item.deliveryDate}</p>
                      {(item.icePackQty > 0 || item.sauceQty > 0) && (
                        <p>
                          추가: {item.icePackQty > 0 ? `아이스팩 ${item.icePackQty}개 ` : ''}
                          {item.sauceQty > 0 ? `뱃사람 소스 ${item.sauceQty}개` : ''}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-white rounded-full border border-[#d2d2d7] px-2.5 py-1">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.cartItemId, -1)}
                          className="w-5 h-5 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.cartItemId, 1)}
                          className="w-5 h-5 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[17px] font-extrabold text-[#1d1d1f]">
                        {formatKRW(calcItemTotal(item))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <div className="lg:col-span-4 rounded-[22px] bg-[#f5f5f7] p-6 sticky top-[100px]">
              <h2 className="text-[18px] font-extrabold text-[#1d1d1f] mb-4">
                결제 예정 금액
              </h2>

              {subtotal > 0 && freeShippingRemaining > 0 ? (
                <div className="mb-4 p-3 rounded-[12px] bg-white text-[12.5px] text-[#1d1d1f]">
                  <strong className="text-[#0d5c63]">
                    {formatKRW(freeShippingRemaining)}
                  </strong>{' '}
                  더 담으시면 무료배송!
                </div>
              ) : subtotal >= 100000 ? (
                <div className="mb-4 p-3 rounded-[12px] bg-white text-[12.5px] font-bold text-[#0d5c63]">
                  10만원 이상 무료배송 혜택이 적용되었습니다.
                </div>
              ) : null}

              <dl className="space-y-2.5 text-[14px] pb-4 border-b border-[#d2d2d7]">
                <div className="flex justify-between">
                  <dt className="text-[#6e6e73]">총 상품금액</dt>
                  <dd className="font-bold">{formatKRW(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6e6e73]">총 배송비</dt>
                  <dd className="font-bold">
                    {shippingFee === 0 ? '무료' : formatKRW(shippingFee)}
                  </dd>
                </div>
              </dl>

              <div className="py-4 flex items-baseline justify-between">
                <span className="text-[15px] font-bold text-[#1d1d1f]">결제예정금액</span>
                <span className="text-[24px] font-black text-[#e05a47]">
                  {formatKRW(totalAmount)}
                </span>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={selectedItems.length === 0}
                  onClick={() => navigate('/checkout')}
                  className="w-full h-[50px] rounded-full bg-[#0d5c63] hover:bg-[#094449] disabled:bg-[#d2d2d7] text-white text-[15.5px] font-extrabold transition cursor-pointer"
                >
                  선택상품 주문하기 ({selectedItems.length})
                </button>
                <Link
                  to="/products"
                  className="w-full h-[46px] rounded-full bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[14px] font-bold flex items-center justify-center"
                >
                  쇼핑 계속하기
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
