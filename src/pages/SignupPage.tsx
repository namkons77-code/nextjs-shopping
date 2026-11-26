import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useStore } from '../context/storeContextValue';
import { GoogleGIcon, KakaoBubbleIcon } from '../components/common/BrandAssets';

export const SignupPage: React.FC = () => {
  const { signInWithOAuthProvider, signUpWithEmail, showToast } = useStore();
  const navigate = useNavigate();

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOAuthSignup = async (provider: 'google' | 'kakao') => {
    setOauthNotice(null);
    setSubmitting(true);
    const res = await signInWithOAuthProvider(provider);
    setSubmitting(false);
    if (!res.ok) {
      setOauthNotice(
        `${provider === 'google' ? 'Google' : 'Kakao'} OAuth 공급자가 Supabase Dashboard에 아직 설정되지 않았습니다. (${res.error || 'Provider not enabled'})`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreePrivacy) {
      showToast('필수 약관에 동의해 주세요.');
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim() || password.trim().length < 6) {
      showToast('이름, 이메일, 비밀번호(6자 이상), 휴대폰 번호를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    const res = await signUpWithEmail({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      defaultAddress: address.trim(),
    });
    setSubmitting(false);
    if (res.ok) {
      navigate('/mypage');
    } else {
      showToast(res.error || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-[82vh] bg-[#f5f5f7] py-12 px-4">
      <div className="max-w-[520px] mx-auto rounded-[26px] bg-white p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <h1 className="text-[26px] font-extrabold text-[#1d1d1f] text-center">
          회원가입
        </h1>
        <p className="mt-2 text-center text-[13.5px] text-[#6e6e73]">
          가입 즉시 적립금 <strong className="text-[#0d5c63]">3,000원</strong> +{' '}
          <strong className="text-[#0d5c63]">5,000원 할인 쿠폰</strong> 지급!
        </p>

        {/* 1초 간편가입 (Supabase OAuth) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-6 border-b border-[#d2d2d7]">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleOAuthSignup('google')}
            className="h-[46px] rounded-[12px] bg-white hover:bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <GoogleGIcon size={18} />
            <span>구글 1초 가입</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleOAuthSignup('kakao')}
            className="h-[46px] rounded-[12px] bg-[#fee500] text-[#3c1e1e] font-bold text-[14px] inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <KakaoBubbleIcon size={18} />
            <span>카카오 1초 가입</span>
          </button>
        </div>

        {oauthNotice && (
          <div className="mt-4 p-4 rounded-[14px] bg-amber-50 border border-amber-200 text-[12.5px]">
            <div className="flex items-start gap-2 text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>{oauthNotice}</span>
            </div>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          {/* 약관 동의 */}
          <div className="p-4 rounded-[16px] bg-[#f5f5f7] space-y-2.5 text-[13.5px]">
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms && agreePrivacy && agreeMarketing}
                onChange={(e) => {
                  const v = e.target.checked;
                  setAgreeTerms(v);
                  setAgreePrivacy(v);
                  setAgreeMarketing(v);
                }}
                className="w-4 h-4 accent-[#0d5c63]"
              />
              <span>전체 약관에 동의합니다</span>
            </label>
            <div className="pl-6 space-y-1.5 text-[13px] text-[#6e6e73]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="accent-[#0d5c63]"
                />
                <span>[필수] 이용약관 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="accent-[#0d5c63]"
                />
                <span>[필수] 개인정보 수집 및 이용 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="accent-[#0d5c63]"
                />
                <span>[선택] 비밀창고 특가·시세 알림 수신 동의</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
              이름 *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="김마스터"
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
              이메일 *
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="master@crabmaster.kr"
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
              비밀번호 (6자 이상) *
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 6자 이상"
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
              휴대폰 번호 *
            </label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-[#6e6e73] mb-1">
              기본 배송지 (선택)
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="경기도 화성시 동탄대로..."
              className="w-full h-[46px] px-4 rounded-[12px] bg-[#f5f5f7] text-[14px] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[50px] rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white font-extrabold text-[15.5px] transition cursor-pointer disabled:opacity-60"
          >
            가입하고 혜택 받기
          </button>

          <p className="text-center text-[13px] text-[#6e6e73]">
            이미 회원이신가요?{' '}
            <Link to="/login" className="font-bold text-[#1d1d1f] underline">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
