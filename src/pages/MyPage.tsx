import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Award,
  Clock,
  Heart,
  Package,
  Settings,
  Ticket,
  Trash2,
  User,
} from 'lucide-react';
import { useStore } from '../context/storeContextValue';
import { SafeImage } from '../components/common/BrandAssets';
import { formatKRW } from '../utils/format';
import { ProductCard } from '../components/common/ProductCard';

export const MyPage: React.FC = () => {
  const {
    currentMember,
    orders,
    products,
    updateMemberProfile,
    deleteMember,
    showToast,
    logout,
  } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    (searchParams.get('tab') as 'orders' | 'wishlist' | 'recent' | 'profile') ||
    'orders';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);

  const [editPhone, setEditPhone] = useState(currentMember?.phone || '');
  const [editAddress, setEditAddress] = useState(currentMember?.defaultAddress || '');

  if (!currentMember) {
    return (
      <div className="bg-[#f5f5f7] py-20 px-4">
        <div className="max-w-[460px] mx-auto rounded-[24px] bg-white p-8 text-center shadow-sm">
          <User className="w-12 h-12 text-[#0d5c63] mx-auto mb-4" />
          <h1 className="text-[24px] font-extrabold text-[#1d1d1f]">
            마이쇼핑 로그인
          </h1>
          <p className="mt-2 text-[14px] text-[#6e6e73]">
            주문/배송 조회, 적립금, 관심상품을 확인하려면 로그인해 주세요.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="h-[48px] rounded-full bg-[#0d5c63] text-white font-bold flex items-center justify-center"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.memberId === currentMember.id);
  const wishedProducts = products.filter((p) =>
    currentMember.wishlist.includes(p.id)
  );
  const recentProducts = products.filter((p) =>
    currentMember.recentViewed.includes(p.id)
  );
  const usableCoupons = currentMember.coupons.filter((c) => !c.used);

  const countByStatus = {
    paid: myOrders.filter((o) => o.status === '결제완료').length,
    prep: myOrders.filter(
      (o) => o.status === '상품준비중' || o.status === '활/자숙 손질중'
    ).length,
    shipping: myOrders.filter((o) => o.status === '배송중').length,
    done: myOrders.filter((o) => o.status === '배송완료').length,
  };

  const switchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="bg-white pb-24">
      {/* Top Member Summary Banner */}
      <div className="bg-[#f5f5f7] py-10 px-[22px]">
        <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d5c63] text-white text-[12px] font-bold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>{currentMember.grade} 회원 ({currentMember.loginType})</span>
            </div>
            <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#1d1d1f]">
              {currentMember.name}님의 마이쇼핑
            </h1>
            <p className="text-[13.5px] text-[#6e6e73] mt-1">
              등급이 오르면 구매 적립률도 함께 올라갑니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-[18px] bg-white min-w-[110px] text-center">
              <p className="text-[12px] font-semibold text-[#6e6e73]">적립금</p>
              <p className="mt-1 text-[18px] sm:text-[20px] font-black text-[#e05a47]">
                {formatKRW(currentMember.points)}
              </p>
            </div>
            <div className="p-4 rounded-[18px] bg-white min-w-[110px] text-center">
              <p className="text-[12px] font-semibold text-[#6e6e73]">보유 쿠폰</p>
              <p className="mt-1 text-[18px] sm:text-[20px] font-black text-[#1d1d1f]">
                {usableCoupons.length}장
              </p>
            </div>
            <div className="p-4 rounded-[18px] bg-white min-w-[110px] text-center">
              <p className="text-[12px] font-semibold text-[#6e6e73]">누적 주문</p>
              <p className="mt-1 text-[18px] sm:text-[20px] font-black text-[#1d1d1f]">
                {myOrders.length}건
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-[22px] pt-8">
        {/* Order Status Summary Bar */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 p-4 sm:p-6 rounded-[20px] bg-[#f5f5f7] text-center mb-8">
          <div>
            <p className="text-[22px] sm:text-[28px] font-black text-[#1d1d1f]">
              {countByStatus.paid}
            </p>
            <p className="text-[12px] sm:text-[13px] font-semibold text-[#6e6e73]">
              결제완료
            </p>
          </div>
          <div>
            <p className="text-[22px] sm:text-[28px] font-black text-[#e05a47]">
              {countByStatus.prep}
            </p>
            <p className="text-[12px] sm:text-[13px] font-semibold text-[#6e6e73]">
              선별·찜 준비중
            </p>
          </div>
          <div>
            <p className="text-[22px] sm:text-[28px] font-black text-[#1d1d1f]">
              {countByStatus.shipping}
            </p>
            <p className="text-[12px] sm:text-[13px] font-semibold text-[#6e6e73]">
              배송중
            </p>
          </div>
          <div>
            <p className="text-[22px] sm:text-[28px] font-black text-[#1d1d1f]">
              {countByStatus.done}
            </p>
            <p className="text-[12px] sm:text-[13px] font-semibold text-[#6e6e73]">
              배송완료
            </p>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#d2d2d7]">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: '주문·배송 조회', icon: Package },
              { id: 'wishlist', label: `관심상품 (${wishedProducts.length})`, icon: Heart },
              { id: 'recent', label: `최근 본 상품 (${recentProducts.length})`, icon: Clock },
              { id: 'profile', label: '회원정보·쿠폰', icon: Settings },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTab(t.id as typeof activeTab)}
                  className={`h-[40px] px-4 rounded-full text-[13.5px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5ea]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-[13px] font-semibold text-[#6e6e73] hover:text-[#0d5c63] cursor-pointer"
          >
            로그아웃
          </button>
        </div>

        {/* Tab Body */}
        <div className="pt-8">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="py-16 text-center rounded-[20px] bg-[#f5f5f7]">
                  <p className="font-bold text-[#1d1d1f]">주문 내역이 없습니다.</p>
                </div>
              ) : (
                myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 rounded-[20px] bg-[#f5f5f7] space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#d2d2d7]">
                      <div>
                        <span className="text-[14px] font-extrabold text-[#1d1d1f]">
                          {order.orderNo}
                        </span>
                        <span className="ml-2 text-[12.5px] text-[#6e6e73]">
                          {order.createdAt}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#0d5c63] text-white text-[12px] font-bold">
                          {order.status}
                        </span>
                        {order.trackingNumber && (
                          <span className="text-[12px] font-semibold text-[#6e6e73]">
                            {order.courier} {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {order.items.map((item) => (
                      <div key={item.cartItemId} className="flex items-center gap-4">
                        <SafeImage
                          src={item.image}
                          alt={item.productName}
                          className="w-16 h-16 rounded-[12px] object-cover bg-white shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-[15px] font-bold text-[#1d1d1f] hover:underline block truncate"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-[12.5px] text-[#6e6e73]">
                            {item.prepOption} · {item.deliveryDate} · {item.quantity}개
                          </p>
                        </div>
                        <p className="text-[15px] font-extrabold">
                          {formatKRW(order.totalAmount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishedProducts.length === 0 ? (
                <p className="col-span-full py-12 text-center text-[#6e6e73]">
                  관심상품이 비어 있습니다.
                </p>
              ) : (
                wishedProducts.map((p) => <ProductCard key={p.id} product={p} />)
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentProducts.length === 0 ? (
                <p className="col-span-full py-12 text-center text-[#6e6e73]">
                  최근 본 상품이 없습니다.
                </p>
              ) : (
                recentProducts.map((p) => <ProductCard key={p.id} product={p} />)
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[20px] bg-[#f5f5f7] space-y-4">
                <h3 className="text-[18px] font-extrabold">내 정보 수정</h3>
                <div>
                  <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                    연락처
                  </label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-[44px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
                    기본 배송지
                  </label>
                  <input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full h-[44px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px]"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateMemberProfile(currentMember.id, {
                        phone: editPhone,
                        defaultAddress: editAddress,
                      })
                    }
                    className="h-[44px] px-6 rounded-full bg-[#0d5c63] text-white text-[14px] font-bold cursor-pointer"
                  >
                    저장하기
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentMember.role === 'admin') {
                        showToast('관리자 계정은 마이페이지에서 탈퇴할 수 없습니다.');
                        return;
                      }
                      setWithdrawConfirmOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>회원 탈퇴(계정 삭제)</span>
                  </button>
                </div>

                {withdrawConfirmOpen && (
                  <div className="mt-3 p-4 rounded-[14px] bg-red-50 border border-red-200 space-y-2.5 text-[13px]">
                    <p className="font-bold text-red-700">
                      정말 회원 탈퇴를 진행하시겠습니까? 보유 적립금({formatKRW(currentMember.points)})과 쿠폰이 모두 소멸됩니다.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWithdrawConfirmOpen(false)}
                        className="px-4 py-1.5 rounded-full bg-white border border-[#d2d2d7] font-bold cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawConfirmOpen(false);
                          void deleteMember(currentMember.id);
                        }}
                        className="px-4 py-1.5 rounded-full bg-red-600 text-white font-bold cursor-pointer"
                      >
                        탈퇴 확정
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-[20px] bg-[#f5f5f7] space-y-3">
                <h3 className="text-[18px] font-extrabold flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#0d5c63]" />
                  <span>보유 쿠폰함</span>
                </h3>
                {usableCoupons.length === 0 ? (
                  <p className="text-[14px] text-[#6e6e73]">사용 가능한 쿠폰이 없습니다.</p>
                ) : (
                  usableCoupons.map((cp) => (
                    <div
                      key={cp.id}
                      className="p-4 rounded-[14px] bg-white flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[14px] font-bold text-[#1d1d1f]">
                          {cp.title}
                        </p>
                        <p className="text-[12px] text-[#6e6e73]">
                          {formatKRW(cp.minOrder)} 이상 구매 시 · ~{cp.expiresAt}
                        </p>
                      </div>
                      <span className="text-[16px] font-black text-[#e05a47]">
                        -{formatKRW(cp.discountAmount)}
                      </span>
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
