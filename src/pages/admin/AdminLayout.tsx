import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Monitor,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Users,
} from 'lucide-react';
import { useStore } from '../../context/storeContextValue';
import { BrandLogo, GoogleGIcon } from '../../components/common/BrandAssets';

const ADMIN_NAV = [
  { to: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: '상품·시세 관리', icon: Package },
  { to: '/admin/orders', label: '주문·배송 관리', icon: ShoppingCart },
  { to: '/admin/members', label: '회원·등급 관리', icon: Users },
  { to: '/admin/cs', label: '후기·문의·비밀창고', icon: MessageSquare },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const {
    currentMember,
    authLoading,
    toastMessage,
    resetDemoData,
    dbConnected,
    dbLoading,
    refreshFromSupabase,
    signInWithEmail,
    signInWithOAuthProvider,
    logout,
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentMember?.role === 'admin';

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!email.trim() || !password.trim()) {
      setLoginError('관리자 이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    const res = await signInWithEmail(email.trim(), password);
    setSubmitting(false);
    if (!res.ok) {
      setLoginError(res.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    await refreshFromSupabase();
  };

  if (authLoading || (dbLoading && !currentMember)) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-white border-t-[#0d5c63] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#161617] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px] rounded-[26px] bg-white p-7 sm:p-9 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <BrandLogo compact />
            <span className="px-3 py-1 rounded-full bg-[#0d5c63] text-white text-[11px] font-extrabold tracking-wider inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff7b69]" />
              ADMIN ONLY
            </span>
          </div>

          <div>
            <h1 className="text-[24px] font-extrabold text-[#1d1d1f]">
              크랩마스터 관리자 로그인
            </h1>
            <p className="mt-1 text-[13.5px] text-[#6e6e73]">
              관리자 권한(`role: admin`)이 있는 계정으로 로그인해 주세요.
            </p>
          </div>

          {currentMember && currentMember.role !== 'admin' && (
            <div className="p-3.5 rounded-[14px] bg-amber-50 border border-amber-200 text-[12.5px] text-amber-900 space-y-2">
              <div className="flex items-start gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>
                  현재 로그인된 &apos;{currentMember.name}&apos;({currentMember.email}) 계정은 일반 회원입니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="px-3 py-1 rounded-full bg-white border border-amber-300 text-[12px] font-bold cursor-pointer"
              >
                로그아웃 후 관리자 계정으로 전환
              </button>
            </div>
          )}

          {loginError && (
            <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200 text-[13px] font-semibold text-red-700">
              {loginError}
            </div>
          )}

          <form onSubmit={(e) => void handleAdminSubmit(e)} className="space-y-3">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[12px] font-bold text-[#6e6e73] mb-1"
              >
                관리자 이메일
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="crabmaster.admin@gmail.com"
                className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none focus:ring-2 focus:ring-[#0d5c63]/30"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-[12px] font-bold text-[#6e6e73] mb-1"
              >
                비밀번호
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none focus:ring-2 focus:ring-[#0d5c63]/30"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[48px] rounded-full bg-[#0d5c63] hover:bg-[#094449] disabled:opacity-60 text-white font-extrabold text-[15px] inline-flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? '인증 확인 중...' : '관리자 콘솔 입장'}</span>
            </button>
          </form>

          <div className="pt-2 space-y-2 border-t border-[#d2d2d7]/70">
            <button
              type="button"
              onClick={() => void signInWithOAuthProvider('google')}
              className="w-full h-[44px] rounded-[12px] bg-white hover:bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] font-bold text-[13.5px] inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <GoogleGIcon size={17} />
              <span>구글 관리자 계정으로 로그인</span>
            </button>

            <div className="flex items-center justify-between text-[12px] pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('crabmaster.admin@gmail.com');
                  setPassword('CrabAdmin2026!');
                }}
                className="font-bold text-[#0d5c63] hover:underline cursor-pointer"
              >
                기본 관리자 계정 자동 입력
              </button>
              <Link to="/" className="text-[#6e6e73] font-semibold hover:text-[#1d1d1f]">
                쇼핑몰 홈으로 ›
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col lg:flex-row">
      {/* Dark Apple-inspired Admin Sidebar */}
      <aside className="w-full lg:w-[250px] bg-[#161617] text-white shrink-0 flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center justify-between lg:block">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-[#0d5c63] text-[10px] font-extrabold tracking-wider mb-1.5">
              ADMIN PORTAL
            </span>
            <p className="text-[20px] font-black tracking-tight">크랩마스터 관리자</p>
          </div>
          <Link
            to="/"
            className="lg:hidden px-3 py-1.5 rounded-full bg-white/10 text-[12px] font-bold"
          >
            쇼핑몰 홈
          </Link>
        </div>

        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto kk-no-scrollbar flex-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-[14px] text-[14px] font-bold transition ${
                  active
                    ? 'bg-[#0d5c63] text-white'
                    : 'text-[#a1a1a6] hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="w-full h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition"
          >
            <Monitor className="w-4 h-4" />
            <span>회원용 쇼핑몰 보기</span>
          </Link>
          <Link
            to="/mobile"
            className="w-full h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>모바일 페이지 보기</span>
          </Link>
          <button
            type="button"
            onClick={resetDemoData}
            className="w-full h-[36px] rounded-full text-[#a1a1a6] hover:text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>세션 초기화 / 새로고침</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[64px] bg-white border-b border-[#d2d2d7]/70 px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo compact />
            <span className="hidden xl:inline text-[13px] text-[#6e6e73] font-medium">
              주식회사 크랩마스터에프앤비 통합 운영 콘솔
            </span>
            <button
              type="button"
              onClick={() => void refreshFromSupabase()}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-bold cursor-pointer ${
                dbConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
              title="클릭하여 Supabase DB 새로고침"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  dbConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>
                {dbLoading
                  ? 'Supabase 동기화중...'
                  : dbConnected
                    ? 'Supabase DB 연결됨'
                    : '로컬 모드'}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] text-[12px] font-bold text-[#0d5c63]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentMember.name}</span>
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="px-3 py-1.5 rounded-full border border-[#d2d2d7] text-[12px] font-bold text-[#6e6e73] hover:text-[#1d1d1f] inline-flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-full bg-[#1d1d1f] text-white text-[12.5px] font-bold"
            >
              쇼핑몰 ›
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-[1360px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full bg-[#1d1d1f] text-white text-[13.5px] font-semibold shadow-xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
