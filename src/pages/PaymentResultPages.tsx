import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/storeContextValue';
import type { CartItem, Order } from '../types/store';
import { formatKRW } from '../utils/format';

export const PENDING_TOSS_ORDER_KEY = 'crabmaster_pending_toss_order_v1';

export interface PendingTossOrderPayload {
  orderId: string;
  expectedAmount: number;
  customerName: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  deliveryMemo: string;
  paymentMethod: Order['paymentMethod'];
  items: CartItem[];
  usedPoints: number;
  couponId?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { placeOrder, showToast } = useStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey') || '';
      const orderId = searchParams.get('orderId') || '';
      const amount = Number(searchParams.get('amount') || 0);

      if (!paymentKey || !orderId || !amount) {
        if (active) setErrorMsg('결제 승인 정보가 올바르지 않습니다.');
        return;
      }

      let pending: PendingTossOrderPayload | null = null;
      try {
        const raw = sessionStorage.getItem(PENDING_TOSS_ORDER_KEY);
        if (raw) pending = JSON.parse(raw) as PendingTossOrderPayload;
      } catch {
        pending = null;
      }

      if (pending && pending.expectedAmount !== amount) {
        if (active) {
          setErrorMsg(
            `결제 금액 검증에 실패했습니다. (예상 ${formatKRW(pending.expectedAmount)} / 응답 ${formatKRW(amount)})`
          );
        }
        return;
      }

      try {
        const res = await fetch('/api/payments/toss/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          receiptUrl?: string | null;
          totalAmount?: number;
        };

        if (!res.ok || !data.ok) {
          throw new Error(data.error || '토스페이 결제 승인에 실패했습니다.');
        }

        if (!active) return;
        setConfirmedAmount(data.totalAmount ?? amount);
        setReceiptUrl(data.receiptUrl ?? null);

        if (pending) {
          sessionStorage.removeItem(PENDING_TOSS_ORDER_KEY);
          const createdOrder = placeOrder({
            customerName: pending.customerName,
            customerPhone: pending.customerPhone,
            recipientName: pending.recipientName,
            recipientPhone: pending.recipientPhone,
            address: pending.address,
            deliveryMemo: pending.deliveryMemo,
            paymentMethod: '토스페이',
            items: pending.items,
            usedPoints: pending.usedPoints,
            couponId: pending.couponId,
          });
          showToast('토스페이 결제가 승인되었습니다!');
          navigate(`/order-complete/${createdOrder.id}`, { replace: true });
        }
      } catch (err) {
        if (active) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : '결제 승인 처리 중 오류가 발생했습니다.'
          );
        }
      }
    };

    void confirmPayment();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[75vh] bg-[#f5f5f7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] rounded-[24px] bg-white p-8 text-center shadow-sm space-y-4">
        {errorMsg ? (
          <>
            <AlertTriangle className="w-12 h-12 text-[#e05a47] mx-auto" />
            <h1 className="text-[20px] font-extrabold text-[#1d1d1f]">
              토스페이 결제 승인 실패
            </h1>
            <p className="text-[14px] text-[#6e6e73] leading-relaxed">{errorMsg}</p>
            <Link
              to="/checkout"
              className="inline-flex h-[44px] px-6 rounded-full bg-[#0d5c63] text-white text-[14px] font-bold items-center"
            >
              주문서로 돌아가기
            </Link>
          </>
        ) : confirmedAmount ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-[#0064FF] mx-auto" />
            <h1 className="text-[22px] font-extrabold text-[#1d1d1f]">
              토스페이 결제 승인 완료
            </h1>
            <p className="text-[15px] font-bold text-[#0d5c63]">
              {formatKRW(confirmedAmount)} 결제 완료
            </p>
            {receiptUrl && (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[13px] font-bold text-[#0064FF] underline"
              >
                토스페이 영수증 보기
              </a>
            )}
            <Link
              to="/mypage"
              className="block w-full h-[46px] rounded-full bg-[#0d5c63] text-white font-bold text-[14.5px] leading-[46px]"
            >
              주문 내역 확인하기
            </Link>
          </>
        ) : (
          <>
            <div className="w-9 h-9 mx-auto rounded-full border-4 border-[#f5f5f7] border-t-[#0064FF] animate-spin" />
            <h1 className="text-[20px] font-extrabold text-[#1d1d1f]">
              토스페이 결제 승인 확인 중...
            </h1>
            <p className="text-[13.5px] text-[#6e6e73]">
              잠시만 기다려 주시면 주문 완료 페이지로 이동합니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export const PaymentFailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || 'PAY_CANCELLED';
  const message =
    searchParams.get('message') || '결제가 취소되었거나 실패했습니다.';

  return (
    <div className="min-h-[75vh] bg-[#f5f5f7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] rounded-[24px] bg-white p-8 text-center shadow-sm space-y-4">
        <AlertTriangle className="w-12 h-12 text-[#e05a47] mx-auto" />
        <h1 className="text-[22px] font-extrabold text-[#1d1d1f]">
          결제가 완료되지 않았습니다
        </h1>
        <p className="text-[14px] text-[#6e6e73] leading-relaxed">{message}</p>
        <p className="text-[12px] font-mono text-[#6e6e73] bg-[#f5f5f7] py-1.5 px-3 rounded-full inline-block">
          오류 코드: {code}
        </p>
        <div className="pt-2 flex gap-2.5 justify-center">
          <Link
            to="/checkout"
            className="h-[46px] px-6 rounded-full bg-[#0064FF] text-white text-[14px] font-bold flex items-center"
          >
            다시 결제하기
          </Link>
          <Link
            to="/cart"
            className="h-[46px] px-6 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-bold flex items-center"
          >
            장바구니
          </Link>
        </div>
      </div>
    </div>
  );
};
