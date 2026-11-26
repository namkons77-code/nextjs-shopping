import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { useStore } from '../context/storeContextValue';
import {
  GoogleGIcon,
  KakaoBubbleIcon,
  BrandLogo,
} from '../components/common/BrandAssets';

export const LoginPage: React.FC = () => {
  const {
    currentMember,
    signInWithOAuthProvider,
    signInWithEmail,
    loginWithCredentials,
    orders,
    showToast,
  } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentMember) {
      navigate(currentMember.role === 'admin' ? '/admin' : '/mypage', {
        replace: true,
      });
    }
  }, [currentMember, navigate]);

  const [mode, setMode] = useState<'member' | 'guest'>('member');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [guestOrderNo, setGuestOrderNo] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [foundGuestOrder, setFoundGuestOrder] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<{
    provider: 'google' | 'kakao';
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSocialOneClick = async (provider: 'google' | 'kakao') => {
    setOauthNotice(null);
    setSubmitting(true);
    const res = await signInWithOAuthProvider(provider);
    setSubmitting(false);

    if (!res.ok) {
      setOauthNotice({
        provider,
        message:
          res.error ||
          `${provider === 'google' ? 'Google' : 'Kakao'} OAuth 공급자가 Supabase에서 활성화되지 않았습니다.`,
      });
    }
  };

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      showToast('이메일 또는 아이디를 입력해 주세요.');
      return;
    }
    if (userId.includes('@') && password.trim()) {
      setSubmitting(true);
      const res = await signInWithEmail(userId.trim(), password);
      setSubmitting(false);
      if (res.ok) {
        navigate(res.role === 'admin' ? '/admin' : '/mypage');
        return;
      }
      showToast(res.error || '이메일 또는 비밀번호를 확인해 주세요.');
      return;
    }
    const loggedIn = loginWithCredentials(userId.trim(), '일반');
    navigate(loggedIn.role === 'admin' ? '/admin' : '/mypage');
  };

  const handleGuestLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const match = orders.find(
      (o) =>
        o.orderNo.toLowerCase() === guestOrderNo.trim().toLowerCase() ||
        o.customerPhone.replace(/-/g, '') === guestPhone.replace(/-/g, '')
    );
    if (match) {
      setFoundGuestOrder(
        `${match.orderNo} · ${match.status} (${match.items[0]?.productName})`
      );
    } else {
      setFoundGuestOrder('일치하는 비회원 주문 내역이 없습니다.');
    }
  };

  return (
    <div className="min-h-[82vh] bg-[#f5f5f7] py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-[440px] rounded-[26px] bg-white p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] cursor-pointer"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <BrandLogo compact />
          <Link
            to="/"
            className="w-9 h-9 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]"
            aria-label="홈으로"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-[24px] font-extrabold text-[#1d1d1f]">로그인</h1>
          <p className="mt-1.5 text-[13.5px] text-[#6e6e73]">
            구글·카카오 1초 로그인으로 3,000원 적립금 &amp; 비밀창고 혜택을 받으세요.
          </p>
        </div>

        {/* Supabase OAuth 1초 로그인 버튼 */}
        <div className="space-y-2.5 mb-6">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSocialOneClick('google')}
            className="w-full h-[50px] rounded-[12px] bg-white hover:bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] font-extrabold text-[15px] flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-60"
          >
            <GoogleGIcon size={19} />
            <span>구글 1초 로그인/회원가입</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSocialOneClick('kakao')}
            className="w-full h-[50px] rounded-[12px] bg-[#fee500] hover:brightness-95 text-[#3c1e1e] font-extrabold text-[15px] flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
          >
            <KakaoBubbleIcon size={20} />
            <span>카카오 1초 로그인/회원가입</span>
          </button>
        </div>

        {/* OAuth Provider Setup Guide if provider is not enabled yet */}
        {oauthNotice && (
          <div className="mb-6 p-4 rounded-[16px] bg-amber-50 border border-amber-200 text-[12.5px] space-y-2">
            <div className="flex items-start gap-2 text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>
                {oauthNotice.provider === 'google' ? 'Google' : 'Kakao'} OAuth 연결 안내
              </span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Supabase 대시보드 → <strong>Authentication → Providers</strong>에서{' '}
              {oauthNotice.provider === 'google' ? 'Google' : 'Kakao'} Client ID/Secret을
              등록하시면 실제 OAuth 로그인이 작동합니다.
              <br />
              Callback URL:{' '}
              <code className="bg-white/80 px-1 py-0.5 rounded text-[11px]">
                https://jgoycpqkmcllspvzqove.supabase.co/auth/v1/callback
              </code>
            </p>
          </div>
        )}

        {/* Bottom Toggle Tabs: 기존 회원이세요? | 비회원 배송조회 */}
        <div className="grid grid-cols-2 border-b border-[#d2d2d7] mb-5 text-[14px] font-bold">
          <button
            type="button"
            onClick={() => setMode('member')}
            className={`py-3 border-b-2 transition cursor-pointer ${
              mode === 'member'
                ? 'border-[#1d1d1f] text-[#1d1d1f]'
                : 'border-transparent text-[#6e6e73]'
            }`}
          >
            기존 회원이세요?
          </button>
          <button
            type="button"
            onClick={() => setMode('guest')}
            className={`py-3 border-b-2 transition cursor-pointer ${
              mode === 'guest'
                ? 'border-[#1d1d1f] text-[#1d1d1f]'
                : 'border-transparent text-[#6e6e73]'
            }`}
          >
            비회원 배송조회
          </button>
        </div>

        {mode === 'member' ? (
          <form onSubmit={(e) => void handleMemberLogin(e)} className="space-y-3">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="이메일 또는 아이디"
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none focus:ring-2 focus:ring-[#0d5c63]/30"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none focus:ring-2 focus:ring-[#0d5c63]/30"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[48px] rounded-full bg-[#1d1d1f] hover:bg-black text-white font-bold text-[15px] transition cursor-pointer disabled:opacity-60"
            >
              로그인
            </button>

            <div className="pt-2 flex items-center justify-end text-[13px] text-[#6e6e73]">
              <Link to="/signup" className="font-semibold hover:text-[#1d1d1f]">
                일반 회원가입 ›
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleGuestLookup} className="space-y-3">
            <input
              type="text"
              value={guestOrderNo}
              onChange={(e) => setGuestOrderNo(e.target.value)}
              placeholder="주문번호 (예: KK20261126-0041)"
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none"
            />
            <input
              type="text"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="주문자 연락처 (예: 010-4821-2244)"
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none"
            />
            <button
              type="submit"
              className="w-full h-[48px] rounded-full bg-[#1d1d1f] text-white font-bold text-[15px] cursor-pointer"
            >
              비회원 주문 조회
            </button>
            {foundGuestOrder && (
              <div className="p-3 rounded-[12px] bg-[#f5f5f7] text-[13px] font-semibold text-[#1d1d1f]">
                {foundGuestOrder}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
