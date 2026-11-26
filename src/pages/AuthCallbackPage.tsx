import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/storeContextValue';
import { BrandLogo } from '../components/common/BrandAssets';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authSession, currentMember, refreshFromSupabase, showToast } = useStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If StoreContext already resolved the logged-in member, proceed right away
  useEffect(() => {
    if (authSession && currentMember) {
      navigate(currentMember.role === 'admin' ? '/admin' : '/mypage', {
        replace: true,
      });
    }
  }, [authSession, currentMember, navigate]);

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;
    let timerId: number | null = null;

    const finishLogin = async (userId?: string) => {
      let targetPath = '/mypage';
      try {
        await refreshFromSupabase();
        if (supabase && userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('auth_user_id', userId)
            .maybeSingle();
          if (profile?.role === 'admin') {
            targetPath = '/admin';
          }
        }
      } catch {
        // non-fatal; StoreContext already handles fallback
      }
      if (cancelled) return;
      showToast(
        targetPath === '/admin'
          ? '관리자 계정으로 로그인되었습니다!'
          : '소셜 로그인이 완료되었습니다!'
      );
      navigate(targetPath, { replace: true });
    };

    const handleCallback = async () => {
      const oauthError =
        searchParams.get('error_description') || searchParams.get('error');
      if (oauthError) {
        if (!cancelled) setErrorMsg(oauthError);
        return;
      }

      if (!supabase) {
        if (!cancelled) navigate('/login', { replace: true });
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) throw error;

        if (data.session) {
          await finishLogin(data.session.user.id);
          return;
        }

        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (cancelled) return;
          if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
            sub.subscription.unsubscribe();
            void finishLogin(session.user.id);
          }
        });
        subscription = sub.subscription;

        timerId = window.setTimeout(async () => {
          if (cancelled || !supabase) return;
          sub.subscription.unsubscribe();
          const retry = await supabase.auth.getSession();
          if (cancelled) return;
          if (retry.data.session) {
            await finishLogin(retry.data.session.user.id);
          } else {
            setErrorMsg(
              `로그인 세션을 확인하지 못했습니다. 시작했던 주소(${window.location.origin})와 동일한 브라우저에서 다시 시도해 주세요.`
            );
          }
        }, 3000);
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : '소셜 로그인 처리 중 오류가 발생했습니다.'
          );
        }
      }
    };

    void handleCallback();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      if (timerId !== null) window.clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[75vh] bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] rounded-[24px] bg-white p-8 text-center shadow-sm space-y-4">
        <BrandLogo compact />
        {errorMsg ? (
          <>
            <h1 className="text-[20px] font-extrabold text-[#e05a47]">
              로그인 확인 필요
            </h1>
            <p className="text-[14px] text-[#6e6e73] leading-relaxed">{errorMsg}</p>
            <Link
              to="/login"
              className="inline-flex h-[44px] px-6 rounded-full bg-[#0d5c63] text-white text-[14px] font-bold items-center"
            >
              로그인 페이지로 돌아가기
            </Link>
          </>
        ) : (
          <>
            <div className="w-8 h-8 mx-auto rounded-full border-4 border-[#f5f5f7] border-t-[#0d5c63] animate-spin" />
            <h1 className="text-[19px] font-extrabold text-[#1d1d1f]">
              구글 / 카카오 로그인 처리 중...
            </h1>
            <p className="text-[13.5px] text-[#6e6e73]">
              잠시만 기다려 주시면 마이쇼핑으로 이동합니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
