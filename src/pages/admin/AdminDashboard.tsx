import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useStore } from '../../context/storeContextValue';
import { formatKRW } from '../../utils/format';

const WEEKLY_SALES = [
  { day: '금', amount: 1850000 },
  { day: '토', amount: 2640000 },
  { day: '일', amount: 2980000 },
  { day: '월', amount: 1420000 },
  { day: '화', amount: 1790000 },
  { day: '수', amount: 2150000 },
  { day: '목(오늘)', amount: 2490000 },
];

export const AdminDashboard: React.FC = () => {
  const { products, orders, members, inquiries, branches } = useStore();

  const totalRevenue = orders
    .filter((o) => o.status !== '취소/환불')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(
    (o) => o.status === '결제완료' || o.status === '상품준비중' || o.status === '활/자숙 손질중'
  );
  const lowStockProducts = products.filter((p) => p.stock <= 15);
  const unansweredInquiries = inquiries.filter((i) => !i.answer);

  const maxWeekly = Math.max(...WEEKLY_SALES.map((d) => d.amount));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[32px] font-extrabold tracking-tight">
            운영 대시보드
          </h1>
          <p className="text-[14px] text-[#6e6e73]">
            실시간 주문·수산물 시세·직영 매장 출고 현황을 한눈에 확인하세요.
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="h-[40px] px-5 rounded-full bg-[#0d5c63] text-white text-[13.5px] font-bold inline-flex items-center gap-1.5"
        >
          <span>출고 대기 {pendingOrders.length}건 처리</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60">
          <div className="flex items-center justify-between text-[#6e6e73] text-[13px] font-bold">
            <span>누적 주문 매출</span>
            <TrendingUp className="w-4 h-4 text-[#0d5c63]" />
          </div>
          <p className="mt-2 text-[28px] font-black text-[#1d1d1f]">
            {formatKRW(totalRevenue)}
          </p>
          <p className="mt-1 text-[12px] text-[#e05a47] font-bold">
            전주 대비 +14.8% (특A급 활대게 수요 증가)
          </p>
        </div>

        <div className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60">
          <div className="flex items-center justify-between text-[#6e6e73] text-[13px] font-bold">
            <span>신규/출고 대기 주문</span>
            <ShoppingBag className="w-4 h-4 text-[#0d5c63]" />
          </div>
          <p className="mt-2 text-[28px] font-black text-[#1d1d1f]">
            {pendingOrders.length}건
          </p>
          <p className="mt-1 text-[12px] text-[#6e6e73]">
            전체 주문 {orders.length}건 중
          </p>
        </div>

        <div className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60">
          <div className="flex items-center justify-between text-[#6e6e73] text-[13px] font-bold">
            <span>등록 회원 / VIP</span>
            <Users className="w-4 h-4 text-[#1d1d1f]" />
          </div>
          <p className="mt-2 text-[28px] font-black text-[#1d1d1f]">
            {members.length}명
          </p>
          <p className="mt-1 text-[12px] text-[#6e6e73]">
            VIP·VVIP {members.filter((m) => m.grade === 'VIP' || m.grade === 'VVIP').length}명
          </p>
        </div>

        <div className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60">
          <div className="flex items-center justify-between text-[#6e6e73] text-[13px] font-bold">
            <span>미답변 Q&amp;A / 품절임박</span>
            <PackageCheck className="w-4 h-4 text-[#0d5c63]" />
          </div>
          <p className="mt-2 text-[28px] font-black text-[#1d1d1f]">
            {unansweredInquiries.length} / {lowStockProducts.length}
          </p>
          <p className="mt-1 text-[12px] text-[#6e6e73]">
            미답변 문의 {unansweredInquiries.length}건 · 재고 15이하 {lowStockProducts.length}종
          </p>
        </div>
      </div>

      {/* Weekly Chart & Branch Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-[22px] bg-white border border-[#d2d2d7]/60">
          <h2 className="text-[18px] font-extrabold mb-6">최근 7일 일별 매출 추이</h2>
          <div className="h-[220px] flex items-end gap-3 sm:gap-5 pt-4">
            {WEEKLY_SALES.map((d) => {
              const heightPct = Math.round((d.amount / maxWeekly) * 100);
              const isToday = d.day.includes('오늘');
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-bold text-[#6e6e73]">
                    {Math.round(d.amount / 10000)}만
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[44px] rounded-t-[10px] transition-all ${
                      isToday ? 'bg-[#e05a47]' : 'bg-[#1d1d1f]/85'
                    }`}
                  />
                  <span className="text-[12px] font-bold text-[#1d1d1f]">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-[22px] bg-white border border-[#d2d2d7]/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold">직영 매장 수조 현황</h2>
            <Link to="/admin/cs" className="text-[12.5px] font-bold text-[#0d5c63]">
              상태 변경 ›
            </Link>
          </div>
          <div className="space-y-2.5">
            {branches.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-[14px] bg-[#f5f5f7] flex items-center justify-between"
              >
                <div>
                  <p className="text-[14px] font-extrabold text-[#1d1d1f]">
                    {b.name} ({b.role})
                  </p>
                  <p className="text-[12px] text-[#6e6e73]">{b.phone}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11.5px] font-bold ${
                    b.status === '정상영업'
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-[#0d5c63] text-white'
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-[22px] bg-white border border-[#d2d2d7]/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-extrabold">실시간 최근 주문</h2>
            <Link to="/admin/orders" className="text-[13px] font-bold text-[#0d5c63]">
              전체 보기 ›
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-[#d2d2d7] text-left text-[#6e6e73]">
                  <th className="py-2.5 pr-3">주문번호</th>
                  <th className="py-2.5 pr-3">주문자</th>
                  <th className="py-2.5 pr-3">상품</th>
                  <th className="py-2.5 pr-3">금액</th>
                  <th className="py-2.5">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pr-3 font-bold">{o.orderNo}</td>
                    <td className="py-3 pr-3">{o.customerName}</td>
                    <td className="py-3 pr-3 max-w-[220px] truncate">
                      {o.items[0]?.productName}
                    </td>
                    <td className="py-3 pr-3 font-bold">{formatKRW(o.totalAmount)}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[12px] font-bold text-[#0d5c63]">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-[22px] bg-white border border-[#d2d2d7]/60">
          <h2 className="text-[18px] font-extrabold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#e05a47]" />
            <span>품절 / 재고 부족</span>
          </h2>
          <div className="space-y-2.5">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-[14px] bg-[#f5f5f7] flex items-center justify-between gap-2"
              >
                <span className="text-[13.5px] font-bold truncate">{p.shortName}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-extrabold shrink-0 ${
                    p.stock === 0
                      ? 'bg-[#0d5c63] text-white'
                      : 'bg-white text-[#1d1d1f]'
                  }`}
                >
                  {p.stock === 0 ? '품절' : `잔여 ${p.stock}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
