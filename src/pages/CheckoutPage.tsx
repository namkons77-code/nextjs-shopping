import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '../context/storeContextValue';
import { SafeImage } from '../components/common/BrandAssets';
import { formatKRW } from '../utils/format';
import type { Order } from '../types/store';
import {
  PENDING_TOSS_ORDER_KEY,
  type PendingTossOrderPayload,
} from './PaymentResultPages';

export const CheckoutPage: React.FC = () => {
  const { cart, currentMember, placeOrder } = useStore();
  const navigate = useNavigate();

  const checkoutItems = cart.filter((c) => c.selected);

  const [customerName, setCustomerName] = useState(currentMember?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentMember?.phone || '');
  const [recipientName, setRecipientName] = useState(currentMember?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(currentMember?.phone || '');
  const [address, setAddress] = useState(
    currentMember?.defaultAddress || '경기도 화성시 동탄대로 537'
  );
  const [deliveryMemo, setDeliveryMemo] = useState('문 앞에 놓아주세요.');
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [usedPoints, setUsedPoints] = useState(0);
  const [paymentMethod, setPaymentMethod] =
    useState<Order['paymentMethod']>('토스페이');
  const [tossLoading, setTossLoading] = useState(false);
  const [tossError, setTossError] = useState('');
  const [sandboxOrder, setSandboxOrder] =
    useState<PendingTossOrderPayload | null>(null);

  const subtotal = checkoutItems.reduce(
    (sum, item) =>
      sum +
      (item.unitPrice + item.prepExtraCost) * item.quantity +
      item.icePackQty * 500 +
      item.sauceQty * 3500,
    0
  );
  const shippingFee = subtotal >= 100000 || subtotal === 0 ? 0 : 4000;

  const availableCoupons =
    currentMember?.coupons.filter((c) => !c.used && subtotal >= c.minOrder) || [];
  const selectedCoupon = availableCoupons.find((c) => c.id === selectedCouponId);
  const discountAmount = selectedCoupon ? selectedCoupon.discountAmount : 0;
  const maxUsablePoints = Math.min(currentMember?.points || 0, subtotal);
  const finalTotal = Math.max(
    0,
    subtotal + shippingFee - discountAmount - usedPoints
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0 || tossLoading) return;
    setTossError('');

    if (paymentMethod === '토스페이' && finalTotal > 0) {
      const tossOrderId = `CM_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const pendingPayload: PendingTossOrderPayload = {
        orderId: tossOrderId,
        expectedAmount: finalTotal,
        customerName: customerName || '주문자',
        customerPhone: customerPhone || '010-0000-0000',
        recipientName: recipientName || customerName || '수령인',
        recipientPhone: recipientPhone || customerPhone || '010-0000-0000',
        address,
        deliveryMemo,
        paymentMethod,
        items: checkoutItems,
        usedPoints,
        couponId: selectedCouponId || undefined,
      };
      sessionStorage.setItem(
        PENDING_TOSS_ORDER_KEY,
        JSON.stringify(pendingPayload)
      );

      const clientKey = String(
        import.meta.env.VITE_TOSS_CLIENT_KEY || ''
      ).trim();
      const hasConfiguredKey = Boolean(
        clientKey && !clientKey.includes('여기에')
      );

      if (!hasConfiguredKey) {
        setSandboxOrder(pendingPayload);
        return;
      }

      setTossLoading(true);
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const payment = tossPayments.payment({
          customerKey: currentMember?.id || ANONYMOUS,
        });
        const firstProductName = checkoutItems[0]?.productName || '크랩마스터 상품';
        const orderName =
          checkoutItems.length > 1
            ? `${firstProductName} 외 ${checkoutItems.length - 1}건`
            : firstProductName;

        await payment.requestPayment({
          method: 'CARD',
          amount: {
            currency: 'KRW',
            value: finalTotal,
          },
          orderId: tossOrderId,
          orderName,
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
          customerEmail: currentMember?.email || 'guest@crabmaster.kr',
          customerName: customerName || '주문자',
          customerMobilePhone:
            (customerPhone || '01000000000').replace(/\D/g, '') ||
            '01000000000',
          card: {
            flowMode: 'DIRECT',
            easyPay: 'TOSSPAY',
          },
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '토스페이 결제창을 여는 중 오류가 발생했습니다.';
        setTossError(message);
        setTossLoading(false);
      }
      return;
    }

    const order = placeOrder({
      customerName: customerName || '주문자',
      customerPhone: customerPhone || '010-0000-0000',
      recipientName: recipientName || customerName || '수령인',
      recipientPhone: recipientPhone || customerPhone || '010-0000-0000',
      address,
      deliveryMemo,
      paymentMethod,
      items: checkoutItems,
      usedPoints,
      couponId: selectedCouponId || undefined,
    });

    navigate(`/order-complete/${order.id}`);
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-24 text-center">
        <p className="text-[20px] font-bold">주문할 상품이 없습니다.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex h-[46px] px-7 rounded-full bg-[#0d5c63] text-white font-bold items-center"
        >
          상품 보러가기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pb-24">
      {/* Header + 3-step */}
      <div className="bg-[#f5f5f7] py-10 px-4 text-center">
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#1d1d1f]">
          주문서 작성
        </h1>
        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4 text-[13px] sm:text-[14px] font-bold">
          <span className="text-[#6e6e73]">1. 장바구니</span>
          <span className="text-[#6e6e73]">→</span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#0d5c63] text-white">
            2. 주문서작성
          </span>
          <span className="text-[#6e6e73]">→</span>
          <span className="text-[#6e6e73]">3. 주문완료</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmitOrder}
        className="max-w-[1180px] mx-auto px-[22px] pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        <div className="lg:col-span-8 space-y-8">
          {/* 주문 상품 */}
          <section className="p-6 rounded-[20px] bg-[#f5f5f7]">
            <h2 className="text-[18px] font-extrabold mb-4">
              주문 상품 ({checkoutItems.length})
            </h2>
            <div className="space-y-3">
              {checkoutItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center gap-4 p-3 rounded-[14px] bg-white"
                >
                  <SafeImage
                    src={item.image}
                    alt={item.productName}
                    className="w-16 h-16 rounded-[10px] object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14.5px] font-bold truncate">{item.productName}</p>
                    <p className="text-[12px] text-[#6e6e73]">
                      {item.prepOption} · {item.deliveryDate} · 수량 {item.quantity}개
                    </p>
                  </div>
                  <p className="text-[15px] font-extrabold shrink-0">
                    {formatKRW(
                      (item.unitPrice + item.prepExtraCost) * item.quantity +
                        item.icePackQty * 500 +
                        item.sauceQty * 3500
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 배송지 정보 */}
          <section className="p-6 rounded-[20px] bg-[#f5f5f7] space-y-4">
            <h2 className="text-[18px] font-extrabold flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0d5c63]" />
              <span>배송지 정보</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                  주문자명 *
                </label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full h-[44px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                  주문자 연락처 *
                </label>
                <input
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full h-[44px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                  수령인 *
                </label>
                <input
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full h-[44px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                  수령인 연락처 *
                </label>
                <input
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full h-[44px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                배송 주소 *
              </label>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="도로명 주소 및 상세 주소"
                className="w-full h-[44px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                배송 요청사항
              </label>
              <input
                value={deliveryMemo}
                onChange={(e) => setDeliveryMemo(e.target.value)}
                className="w-full h-[44px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
              />
            </div>
          </section>

          {/* 쿠폰 / 적립금 */}
          {currentMember && (
            <section className="p-6 rounded-[20px] bg-[#f5f5f7] space-y-4">
              <h2 className="text-[18px] font-extrabold">쿠폰 · 적립금 사용</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                    보유 쿠폰 ({availableCoupons.length}장 사용 가능)
                  </label>
                  <select
                    value={selectedCouponId}
                    onChange={(e) => setSelectedCouponId(e.target.value)}
                    className="w-full h-[44px] px-3 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px]"
                  >
                    <option value="">쿠폰 선택 안함</option>
                    {availableCoupons.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.title} (-{formatKRW(cp.discountAmount)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                    적립금 사용 (보유 {formatKRW(currentMember.points)})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      max={maxUsablePoints}
                      value={usedPoints}
                      onChange={(e) =>
                        setUsedPoints(
                          Math.min(maxUsablePoints, Math.max(0, Number(e.target.value)))
                        )
                      }
                      className="flex-1 h-[44px] px-3 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setUsedPoints(maxUsablePoints)}
                      className="px-4 rounded-[12px] bg-[#1d1d1f] text-white text-[13px] font-bold cursor-pointer"
                    >
                      전액
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 결제 수단 */}
          <section className="p-6 rounded-[20px] bg-[#f5f5f7]">
            <h2 className="text-[18px] font-extrabold flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#0d5c63]" />
              <span>결제 수단</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(
                ['토스페이', '카카오페이', '네이버페이', '신용/체크카드', '무통장입금'] as const
              ).map((method) => {
                const isSelected = paymentMethod === method;
                const isToss = method === '토스페이';
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      setTossError('');
                    }}
                    className={`h-[48px] rounded-[14px] border-2 text-[14px] font-bold transition cursor-pointer ${
                      isSelected
                        ? isToss
                          ? 'border-[#0064FF] bg-[#eef5ff] text-[#0064FF]'
                          : 'border-[#0d5c63] bg-white text-[#0d5c63]'
                        : 'border-transparent bg-white text-[#1d1d1f]'
                    }`}
                  >
                    {isToss ? 'toss pay 토스페이' : method}
                  </button>
                );
              })}
            </div>
            {paymentMethod === '토스페이' && (
              <div className="mt-3 px-4 py-3 rounded-[14px] bg-[#eef5ff] border border-[#cce0ff] text-[13px] text-[#004ecc] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#0064FF]" />
                  <span>
                    토스페이 간편결제 선택됨 —{' '}
                    {import.meta.env.VITE_TOSS_CLIENT_KEY
                      ? '결제하기 클릭 시 토스페이 SDK 결제창이 열립니다.'
                      : '테스트 키 미설정 상태로 토스페이 샌드박스 모의 결제로 안전하게 테스트할 수 있습니다.'}
                  </span>
                </div>
              </div>
            )}
            {tossError && (
              <div className="mt-3 px-4 py-3 rounded-[14px] bg-[#fff1f0] border border-[#ffccc7] text-[13px] text-[#cf1322] font-semibold">
                {tossError}
              </div>
            )}
          </section>
        </div>

        {/* 결제 요약 */}
        <div className="lg:col-span-4 rounded-[22px] bg-[#f5f5f7] p-6 sticky top-[100px]">
          <h2 className="text-[18px] font-extrabold mb-4">최종 결제 금액</h2>
          <dl className="space-y-2.5 text-[14px] pb-4 border-b border-[#d2d2d7]">
            <div className="flex justify-between">
              <dt className="text-[#6e6e73]">상품금액</dt>
              <dd className="font-bold">{formatKRW(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6e6e73]">배송비</dt>
              <dd className="font-bold">
                {shippingFee === 0 ? '무료' : formatKRW(shippingFee)}
              </dd>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#0d5c63]">
                <dt>쿠폰 할인</dt>
                <dd className="font-bold">-{formatKRW(discountAmount)}</dd>
              </div>
            )}
            {usedPoints > 0 && (
              <div className="flex justify-between text-[#0d5c63]">
                <dt>적립금 사용</dt>
                <dd className="font-bold">-{formatKRW(usedPoints)}</dd>
              </div>
            )}
          </dl>

          <div className="py-4 flex items-baseline justify-between">
            <span className="text-[15px] font-bold">총 결제금액</span>
            <span className="text-[26px] font-black text-[#e05a47]">
              {formatKRW(finalTotal)}
            </span>
          </div>

          <button
            type="submit"
            disabled={tossLoading}
            className={`w-full h-[52px] rounded-full text-white text-[16px] font-extrabold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 ${
              paymentMethod === '토스페이'
                ? 'bg-[#0064FF] hover:bg-[#0052d4]'
                : 'bg-[#0d5c63] hover:bg-[#094449]'
            }`}
          >
            {tossLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>
              {tossLoading
                ? '토스페이 결제창 연결 중...'
                : paymentMethod === '토스페이'
                  ? `토스페이로 ${formatKRW(finalTotal)} 결제하기`
                  : `${formatKRW(finalTotal)} 결제하기`}
            </span>
          </button>
          <p className="mt-3 text-[12px] text-[#6e6e73] text-center">
            구매 확정 시 결제금액의 2% 적립금이 적립됩니다.
          </p>
        </div>
      </form>

      {sandboxOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center px-4">
          <div className="w-full max-w-[440px] rounded-[24px] bg-white shadow-2xl overflow-hidden border border-[#e5e5ea]">
            <div className="bg-[#0064FF] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-80">
                  TOSS PAY SANDBOX
                </p>
                <h3 className="text-[20px] font-black mt-0.5">
                  토스페이 테스트 결제
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSandboxOrder(null)}
                aria-label="닫기"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-[16px] bg-[#f5f7fa] p-4 space-y-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#6e6e73]">가맹점</span>
                  <span className="font-bold text-[#1d1d1f]">크랩마스터</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6e73]">주문번호</span>
                  <span className="font-mono text-[12px] text-[#1d1d1f]">
                    {sandboxOrder.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6e73]">주문자</span>
                  <span className="font-bold text-[#1d1d1f]">
                    {sandboxOrder.customerName}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#e5e5ea] flex justify-between items-baseline">
                  <span className="font-bold text-[#1d1d1f]">결제 금액</span>
                  <span className="text-[22px] font-black text-[#0064FF]">
                    {formatKRW(sandboxOrder.expectedAmount)}
                  </span>
                </div>
              </div>

              <p className="text-[12px] text-[#6e6e73] leading-relaxed">
                현재 <code className="px-1 py-0.5 bg-[#f5f5f7] rounded">.env</code>의{' '}
                <code>VITE_TOSS_CLIENT_KEY</code>가 비어 있어 실제 카드 청구 없는
                샌드박스 시뮬레이션 결제로 동작합니다. 승인 버튼을 누르면{' '}
                <code>/api/payments/toss/confirm</code> 검증 후 주문이 완료됩니다.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const msg = encodeURIComponent('사용자가 결제를 취소했습니다.');
                    setSandboxOrder(null);
                    navigate(`/payment/fail?code=PAY_PROCESS_CANCELED&message=${msg}`);
                  }}
                  className="h-[48px] rounded-[14px] border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-bold cursor-pointer"
                >
                  결제 취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const paymentKey = `test_tp_sim_${Date.now()}`;
                    const params = new URLSearchParams({
                      paymentKey,
                      orderId: sandboxOrder.orderId,
                      amount: String(sandboxOrder.expectedAmount),
                    });
                    setSandboxOrder(null);
                    navigate(`/payment/success?${params.toString()}`);
                  }}
                  className="h-[48px] rounded-[14px] bg-[#0064FF] hover:bg-[#0052d4] text-white text-[14px] font-extrabold cursor-pointer"
                >
                  토스페이 테스트 결제 승인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const OrderCompletePage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === orderId) || orders[0];

  return (
    <div className="bg-white pb-24">
      <div className="bg-[#f5f5f7] py-10 px-4 text-center">
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#1d1d1f]">
          주문 완료
        </h1>
        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4 text-[13px] sm:text-[14px] font-bold">
          <span className="text-[#6e6e73]">1. 장바구니</span>
          <span className="text-[#6e6e73]">→</span>
          <span className="text-[#6e6e73]">2. 주문서작성</span>
          <span className="text-[#6e6e73]">→</span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#0d5c63] text-white">
            3. 주문완료
          </span>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 pt-12">
        <div className="rounded-[24px] bg-[#f5f5f7] p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-[#0d5c63] mx-auto mb-4" />
          <h2 className="text-[24px] font-extrabold text-[#1d1d1f]">
            주문이 정상적으로 접수되었습니다!
          </h2>
          {order && (
            <>
              <p className="mt-2 text-[14.5px] text-[#6e6e73]">
                주문번호 <strong className="text-[#1d1d1f]">{order.orderNo}</strong>
              </p>

              <div className="mt-6 p-5 rounded-[18px] bg-white text-left space-y-2.5 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#6e6e73]">받는 분</span>
                  <span className="font-bold">
                    {order.recipientName} ({order.recipientPhone})
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#6e6e73] shrink-0">배송지</span>
                  <span className="font-semibold text-right">{order.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6e73]">결제수단</span>
                  <span className="font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#f5f5f7]">
                  <span className="font-bold">총 결제금액</span>
                  <span className="text-[18px] font-black text-[#e05a47]">
                    {formatKRW(order.totalAmount)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/mypage"
              className="h-[46px] px-7 rounded-full bg-[#1d1d1f] text-white text-[14.5px] font-bold inline-flex items-center"
            >
              주문·배송 조회
            </Link>
            <Link
              to="/"
              className="h-[46px] px-7 rounded-full bg-[#0d5c63] text-white text-[14.5px] font-bold inline-flex items-center"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
