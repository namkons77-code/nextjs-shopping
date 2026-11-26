import React, { useState } from 'react';
import { useStore } from '../../context/storeContextValue';
import type { OrderStatus } from '../../types/store';
import { formatKRW } from '../../utils/format';

const ORDER_STATUSES: OrderStatus[] = [
  '결제완료',
  '상품준비중',
  '활/자숙 손질중',
  '배송중',
  '배송완료',
  '취소/환불',
];

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState<'전체' | OrderStatus>('전체');
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});

  const visibleOrders =
    statusFilter === '전체'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-extrabold">주문 · 배송 관리</h1>
        <p className="text-[14px] text-[#6e6e73]">
          활/찜 손질 상태 및 송장번호를 입력하면 회원 마이쇼핑에 즉시 반영됩니다.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('전체')}
          className={`px-4 py-2 rounded-full text-[13px] font-bold cursor-pointer ${
            statusFilter === '전체' ? 'bg-[#1d1d1f] text-white' : 'bg-white border border-[#d2d2d7]/70'
          }`}
        >
          전체 ({orders.length})
        </button>
        {ORDER_STATUSES.map((st) => {
          const count = orders.filter((o) => o.status === st).length;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0d5c63] text-white'
                  : 'bg-white border border-[#d2d2d7]/70'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {visibleOrders.map((order) => (
          <div
            key={order.id}
            className="p-5 sm:p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f5f5f7]">
              <div>
                <span className="text-[16px] font-extrabold">{order.orderNo}</span>
                <span className="ml-3 text-[13px] text-[#6e6e73]">{order.createdAt}</span>
                <span className="ml-3 px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-[12px] font-bold">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="text-[18px] font-black text-[#e05a47]">
                {formatKRW(order.totalAmount)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-5 space-y-1 text-[13.5px]">
                <p>
                  <strong className="text-[#1d1d1f]">{order.customerName}</strong> ({order.customerPhone})
                </p>
                <p className="text-[#6e6e73]">
                  수령: {order.recipientName} · {order.address}
                </p>
                {order.deliveryMemo && (
                  <p className="text-[12px] text-[#0d5c63]">요청: {order.deliveryMemo}</p>
                )}
              </div>

              <div className="lg:col-span-4 space-y-1 text-[13px]">
                {order.items.map((item) => (
                  <div key={item.cartItemId} className="p-2.5 rounded-[12px] bg-[#f5f5f7]">
                    <p className="font-bold truncate">{item.productName}</p>
                    <p className="text-[11.5px] text-[#6e6e73]">
                      {item.prepOption} · {item.deliveryDate} · {item.quantity}개
                      {item.icePackQty > 0 ? ` · 아이스팩 ${item.icePackQty}` : ''}
                      {item.sauceQty > 0 ? ` · 소스 ${item.sauceQty}` : ''}
                    </p>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-3 space-y-2">
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(order.id, e.target.value as OrderStatus)
                  }
                  className="w-full h-[38px] px-3 rounded-[10px] border border-[#d2d2d7] font-bold text-[13px]"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <div className="flex gap-1.5">
                  <input
                    value={trackingDrafts[order.id] ?? order.trackingNumber ?? ''}
                    onChange={(e) =>
                      setTrackingDrafts((prev) => ({
                        ...prev,
                        [order.id]: e.target.value,
                      }))
                    }
                    placeholder="송장번호 입력"
                    className="flex-1 min-w-0 h-[36px] px-3 rounded-[10px] bg-[#f5f5f7] text-[12.5px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateOrderStatus(
                        order.id,
                        '배송중',
                        trackingDrafts[order.id] ?? order.trackingNumber ?? '9100-2244-8811'
                      )
                    }
                    className="px-3 h-[36px] rounded-[10px] bg-[#1d1d1f] text-white text-[12px] font-bold shrink-0 cursor-pointer"
                  >
                    발송
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
