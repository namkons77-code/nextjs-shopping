import React, { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  INITIAL_BRANCHES,
  INITIAL_INQUIRIES,
  INITIAL_MEMBERS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_VAULT_CONFIG,
} from '../data/seedData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  mapAppProductToDb,
  mapDbBranchToApp,
  mapDbInquiryToApp,
  mapDbOrderToApp,
  mapDbProductToApp,
  mapDbProfileToMember,
  mapDbReviewToApp,
  mapDbVaultToApp,
} from '../lib/supabaseMapper';
import {
  StoreContext,
  type LocalSession,
  type OAuthResult,
  type PersistedState,
  type StoreContextValue,
} from './storeContextValue';
import type {
  CartItem,
  Member,
  MemberGrade,
  Order,
  OrderStatus,
  Product,
  ProductInquiry,
  Review,
  StoreBranch,
  VaultConfig,
} from '../types/store';

const LOCAL_SESSION_KEY = 'crabmaster_session_v1';

const getInitialSession = (): LocalSession => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw) return JSON.parse(raw) as LocalSession;
  } catch {
    // ignore storage read error
  }
  return { cart: [], currentMemberId: null };
};

const getInitialState = (): PersistedState => ({
  ...getInitialSession(),
  products: INITIAL_PRODUCTS,
  orders: INITIAL_ORDERS,
  members: INITIAL_MEMBERS,
  reviews: INITIAL_REVIEWS,
  inquiries: INITIAL_INQUIRIES,
  branches: INITIAL_BRANCHES,
  vaultConfig: INITIAL_VAULT_CONFIG,
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(getInitialState);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbLoading, setDbLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    try {
      const session: LocalSession = {
        cart: state.cart,
        currentMemberId: state.currentMemberId,
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore storage write errors
    }
  }, [state.cart, state.currentMemberId]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const syncAuthUserToProfile = useCallback(async (user: User) => {
    if (!supabase) return;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    let profileRow = existingProfile;

    if (!profileRow) {
      const provider = String(user.app_metadata?.provider || 'email');
      const channel =
        provider === 'kakao'
          ? '카카오 1초'
          : provider === 'google'
            ? '구글 로그인'
            : '이메일 회원';
      const displayName =
        (user.user_metadata?.name as string) ||
        (user.user_metadata?.full_name as string) ||
        (user.email ? user.email.split('@')[0] : '크랩마스터 회원');

      const { data: inserted } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            auth_user_id: user.id,
            email: user.email || '',
            name: displayName,
            handle: displayName,
            channel,
            tier: '일반',
            role: 'member',
            points: 3000,
            coupons: 1,
          },
          { onConflict: 'id' }
        )
        .select('*')
        .maybeSingle();

      profileRow = inserted;

      const welcomeCouponId = `cp-welcome-${user.id.slice(0, 8)}`;
      await supabase.from('coupons').upsert(
        {
          id: welcomeCouponId,
          user_id: user.id,
          member_id: user.id,
          title: '신규 소셜/회원가입 5,000원 쿠폰',
          discount_amount: 5000,
          min_order_amount: 40000,
          expires_at: '2026-12-31',
          used: false,
        },
        { onConflict: 'id' }
      );
    }

    if (profileRow) {
      const { data: allCoupons } = await supabase.from('coupons').select('*');
      const mappedMember = mapDbProfileToMember(profileRow, allCoupons ?? []);
      setState((prev) => {
        const exists = prev.members.some((m) => m.id === mappedMember.id);
        return {
          ...prev,
          members: exists
            ? prev.members.map((m) => (m.id === mappedMember.id ? mappedMember : m))
            : [mappedMember, ...prev.members],
          currentMemberId: mappedMember.id,
        };
      });
      return mappedMember;
    }
    return null;
  }, []);

  const fetchSupabaseSnapshot = useCallback(async () => {
    if (!supabase) return false;

    const [
      productsRes,
      profilesRes,
      couponsRes,
      ordersRes,
      reviewsRes,
      inquiriesRes,
      branchesRes,
      vaultRes,
    ] = await Promise.all([
      supabase.from('products').select('*').order('product_no', { ascending: true }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('coupons').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('store_branches').select('*').order('sort_order', { ascending: true }),
      supabase.from('vault_campaigns').select('*').eq('id', 'vault-default').maybeSingle(),
    ]);

    if (productsRes.error) throw productsRes.error;

    const allCoupons = couponsRes.data ?? [];
    setState((prev) => ({
      ...prev,
      products:
        productsRes.data && productsRes.data.length > 0
          ? productsRes.data.map(mapDbProductToApp)
          : prev.products,
      members:
        profilesRes.data && profilesRes.data.length > 0
          ? profilesRes.data.map((row) => mapDbProfileToMember(row, allCoupons))
          : prev.members,
      orders:
        ordersRes.data && ordersRes.data.length > 0
          ? ordersRes.data.map(mapDbOrderToApp)
          : prev.orders,
      reviews:
        reviewsRes.data && reviewsRes.data.length > 0
          ? reviewsRes.data.map(mapDbReviewToApp)
          : prev.reviews,
      inquiries:
        inquiriesRes.data && inquiriesRes.data.length > 0
          ? inquiriesRes.data.map(mapDbInquiryToApp)
          : prev.inquiries,
      branches:
        branchesRes.data && branchesRes.data.length > 0
          ? branchesRes.data.map(mapDbBranchToApp)
          : prev.branches,
      vaultConfig: vaultRes.data ? mapDbVaultToApp(vaultRes.data) : prev.vaultConfig,
    }));
    return true;
  }, []);

  const refreshFromSupabase = useCallback(async () => {
    if (!supabase) {
      setDbLoading(false);
      setDbConnected(false);
      return;
    }

    setDbLoading(true);
    try {
      await fetchSupabaseSnapshot();
      setDbConnected(true);
    } catch (err) {
      console.error('Supabase sync failed, falling back to local seed:', err);
      setDbConnected(false);
    } finally {
      setDbLoading(false);
    }
  }, [fetchSupabaseSnapshot]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    void fetchSupabaseSnapshot()
      .then(() => {
        if (active) setDbConnected(true);
      })
      .catch((err) => {
        console.error('Supabase sync failed, falling back to local seed:', err);
        if (active) setDbConnected(false);
      })
      .finally(() => {
        if (active) setDbLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchSupabaseSnapshot]);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthSession(data.session ?? null);
      if (data.session?.user) {
        void syncAuthUserToProfile(data.session.user);
      }
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setAuthSession(session);
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        void syncAuthUserToProfile(session.user);
        if (event === 'SIGNED_IN') {
          showToast('소셜/회원 로그인이 완료되었습니다!');
        }
      }
      if (event === 'SIGNED_OUT') {
        setState((prev) => ({ ...prev, currentMemberId: null }));
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [showToast, syncAuthUserToProfile]);

  const currentMember =
    state.members.find(
      (m) =>
        m.id === state.currentMemberId ||
        (authSession?.user?.id && m.authUserId === authSession.user.id)
    ) || null;

  const cartCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);

  const signInWithOAuthProvider = async (
    provider: 'google' | 'kakao'
  ): Promise<OAuthResult> => {
    if (!supabase) {
      return { ok: false, error: 'Supabase 클라이언트가 설정되지 않았습니다.' };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          headers: { apikey: supabaseKey },
        });
        if (res.ok) {
          const settings = (await res.json()) as {
            external?: Record<string, boolean>;
          };
          if (settings.external && settings.external[provider] === false) {
            return {
              ok: false,
              error: `Supabase Auth에서 ${provider === 'google' ? 'Google' : 'Kakao'} 공급자가 아직 비활성화되어 있습니다.`,
            };
          }
        }
      } catch {
        // continue to standard OAuth call if settings check is blocked
      }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    if (data?.url) {
      window.location.href = data.url;
    }
    return { ok: true };
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<OAuthResult> => {
    if (!supabase) {
      loginWithCredentials(email, '일반');
      return { ok: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    if (data.user) {
      const synced = await syncAuthUserToProfile(data.user);
      showToast('로그인 되었습니다.');
      return { ok: true, role: synced?.role };
    }
    return { ok: true };
  };

  const signUpWithEmail = async (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    defaultAddress?: string;
  }): Promise<OAuthResult> => {
    if (!supabase) {
      signupMember({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        defaultAddress: payload.defaultAddress,
        loginType: '일반',
      });
      return { ok: true };
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          full_name: payload.name,
          phone: payload.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          phone: payload.phone,
          default_address: payload.defaultAddress || '',
        })
        .eq('auth_user_id', data.user.id);

      if (data.session) {
        await syncAuthUserToProfile(data.user);
        showToast(`${payload.name}님 회원가입이 완료되었습니다!`);
      } else {
        showToast('인증 메일을 발송했습니다. 이메일 확인 후 로그인해 주세요.');
      }
    }
    return { ok: true };
  };

  const loginWithMemberId = (memberId: string) => {
    setState((prev) => ({ ...prev, currentMemberId: memberId }));
    const found = state.members.find((m) => m.id === memberId);
    if (found) showToast(`${found.name}님 환영합니다!`);
  };

  const loginWithCredentials = (
    emailOrName: string,
    loginType: Member['loginType'] = '일반'
  ) => {
    const existing = state.members.find(
      (m) =>
        m.email.toLowerCase() === emailOrName.toLowerCase() ||
        m.name === emailOrName ||
        m.phone === emailOrName
    );
    if (existing) {
      setState((prev) => ({ ...prev, currentMemberId: existing.id }));
      showToast(`${existing.name}님(${existing.grade}) 로그인 되었습니다.`);
      return existing;
    }

    const newMemberId = `mem-${Date.now()}`;
    const couponId = `cp-${Date.now()}`;
    const name = emailOrName.includes('@') ? emailOrName.split('@')[0] : emailOrName || '크랩마스터 회원';
    const email = emailOrName.includes('@') ? emailOrName : `${Date.now()}@crabmaster.kr`;

    const newMember: Member = {
      id: newMemberId,
      name,
      email,
      phone: '010-0000-2244',
      grade: '일반',
      points: 3000,
      coupons: [
        {
          id: couponId,
          title: '신규가입 3,000원 할인 쿠폰',
          discountAmount: 3000,
          minOrder: 30000,
          expiresAt: '2026-12-31',
        },
      ],
      joinedAt: new Date().toISOString().slice(0, 10),
      totalSpent: 0,
      orderCount: 0,
      wishlist: [],
      recentViewed: [],
      loginType,
    };

    setState((prev) => ({
      ...prev,
      members: [newMember, ...prev.members],
      currentMemberId: newMember.id,
    }));

    if (supabase) {
      void supabase.from('profiles').insert({
        id: newMemberId,
        email,
        name,
        handle: name,
        phone: newMember.phone,
        channel: loginType === '일반' ? '이메일' : loginType,
        tier: '일반',
        points: 3000,
        coupons: 1,
      });
      void supabase.from('coupons').insert({
        id: couponId,
        member_id: newMemberId,
        title: '신규가입 3,000원 할인 쿠폰',
        discount_amount: 3000,
        min_order_amount: 30000,
        expires_at: '2026-12-31',
        used: false,
      });
    }

    showToast(`${newMember.name}님 가입 및 로그인이 완료되었습니다!`);
    return newMember;
  };

  const signupMember = (data: {
    name: string;
    email: string;
    phone: string;
    defaultAddress?: string;
    loginType?: Member['loginType'];
  }) => {
    const newMemberId = `mem-${Date.now()}`;
    const couponId = `cp-${Date.now()}`;
    const newMember: Member = {
      id: newMemberId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      grade: '일반',
      points: 3000,
      coupons: [
        {
          id: couponId,
          title: '신규 회원가입 축하 5,000원 쿠폰',
          discountAmount: 5000,
          minOrder: 40000,
          expiresAt: '2026-12-31',
        },
      ],
      joinedAt: new Date().toISOString().slice(0, 10),
      totalSpent: 0,
      orderCount: 0,
      wishlist: [],
      recentViewed: [],
      defaultAddress: data.defaultAddress || '',
      loginType: data.loginType || '일반',
    };

    setState((prev) => ({
      ...prev,
      members: [newMember, ...prev.members],
      currentMemberId: newMember.id,
    }));

    if (supabase) {
      void supabase.from('profiles').insert({
        id: newMemberId,
        email: data.email,
        name: data.name,
        handle: data.name,
        phone: data.phone,
        default_address: data.defaultAddress || '',
        channel: (data.loginType || '일반') === '일반' ? '이메일' : data.loginType,
        tier: '일반',
        points: 3000,
        coupons: 1,
      });
      void supabase.from('coupons').insert({
        id: couponId,
        member_id: newMemberId,
        title: '신규 회원가입 축하 5,000원 쿠폰',
        discount_amount: 5000,
        min_order_amount: 40000,
        expires_at: '2026-12-31',
        used: false,
      });
    }

    showToast(`${newMember.name}님 회원가입 축하 적립금 3,000원이 지급되었습니다!`);
    return newMember;
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAuthSession(null);
    setState((prev) => ({ ...prev, currentMemberId: null }));
    showToast('로그아웃 되었습니다.');
  };

  const toggleWishlist = (productId: string) => {
    if (!currentMember) {
      showToast('로그인 후 관심상품에 담을 수 있습니다.');
      return;
    }
    const exists = currentMember.wishlist.includes(productId);
    const nextWishlist = exists
      ? currentMember.wishlist.filter((id) => id !== productId)
      : [productId, ...currentMember.wishlist];

    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === currentMember.id ? { ...m, wishlist: nextWishlist } : m
      ),
    }));
    showToast(exists ? '관심상품에서 제거했습니다.' : '관심상품에 담았습니다.');

    if (supabase) {
      void supabase
        .from('profiles')
        .update({ wishlist: nextWishlist })
        .eq('id', currentMember.id);
    }
  };

  const recordRecentView = useCallback((productId: string) => {
    setState((prev) => {
      if (!prev.currentMemberId) return prev;
      const member = prev.members.find((m) => m.id === prev.currentMemberId);
      if (!member || member.recentViewed[0] === productId) return prev;

      const nextRecent = [
        productId,
        ...member.recentViewed.filter((id) => id !== productId),
      ].slice(0, 10);

      if (supabase) {
        void supabase
          .from('profiles')
          .update({ recent_viewed: nextRecent })
          .eq('id', member.id);
      }

      return {
        ...prev,
        members: prev.members.map((m) =>
          m.id === member.id ? { ...m, recentViewed: nextRecent } : m
        ),
      };
    });
  }, []);

  const updateMemberProfile = (memberId: string, patch: Partial<Member>) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === memberId ? { ...m, ...patch } : m)),
    }));
    if (supabase) {
      void supabase
        .from('profiles')
        .update({
          phone: patch.phone,
          default_address: patch.defaultAddress,
        })
        .eq('id', memberId);
    }
    showToast('회원 정보가 저장되었습니다.');
  };

  const updateMemberGradeOrPoints = (
    memberId: string,
    grade: MemberGrade,
    deltaPoints: number
  ) => {
    const target = state.members.find((m) => m.id === memberId);
    const nextPoints = Math.max(0, (target?.points ?? 0) + deltaPoints);

    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === memberId ? { ...m, grade, points: nextPoints } : m
      ),
    }));
    if (supabase) {
      void supabase
        .from('profiles')
        .update({ tier: grade, points: nextPoints })
        .eq('id', memberId);
    }
    showToast('회원 등급 및 적립금이 업데이트되었습니다.');
  };

  const updateMemberRole = (memberId: string, role: 'member' | 'admin') => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === memberId ? { ...m, role } : m
      ),
    }));
    if (supabase) {
      void supabase
        .from('profiles')
        .update({ role })
        .eq('id', memberId);
    }
    showToast(
      role === 'admin'
        ? '관리자 권한이 부여되었습니다.'
        : '일반 회원 권한으로 변경되었습니다.'
    );
  };

  const deleteMember = async (memberId: string) => {
    const target = state.members.find((m) => m.id === memberId);
    const isSelf = currentMember?.id === memberId;

    setState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
      currentMemberId: isSelf ? null : prev.currentMemberId,
    }));

    if (supabase) {
      await supabase.from('coupons').delete().eq('member_id', memberId);
      await supabase.from('profiles').delete().eq('id', memberId);
      if (isSelf) {
        await supabase.auth.signOut();
        setAuthSession(null);
      }
    }

    showToast(
      isSelf
        ? '회원 탈퇴가 완료되었습니다.'
        : `'${target?.name || '회원'}' 계정이 삭제되었습니다.`
    );
  };

  const addToCart = (item: Omit<CartItem, 'cartItemId' | 'selected'>) => {
    setState((prev) => {
      const match = prev.cart.find(
        (c) =>
          c.productId === item.productId &&
          c.prepOption === item.prepOption &&
          c.deliveryDate === item.deliveryDate
      );
      if (match) {
        return {
          ...prev,
          cart: prev.cart.map((c) =>
            c.cartItemId === match.cartItemId
              ? {
                  ...c,
                  quantity: c.quantity + item.quantity,
                  icePackQty: c.icePackQty + item.icePackQty,
                  sauceQty: c.sauceQty + item.sauceQty,
                }
              : c
          ),
        };
      }
      return {
        ...prev,
        cart: [
          ...prev.cart,
          {
            ...item,
            cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            selected: true,
          },
        ],
      };
    });
    showToast('장바구니에 상품을 담았습니다.');
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((c) =>
        c.cartItemId === cartItemId
          ? { ...c, quantity: Math.max(1, c.quantity + delta) }
          : c
      ),
    }));
  };

  const toggleCartSelected = (cartItemId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((c) =>
        c.cartItemId === cartItemId ? { ...c, selected: !c.selected } : c
      ),
    }));
  };

  const toggleAllCartSelected = (selected: boolean) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((c) => ({ ...c, selected })),
    }));
  };

  const removeCartItem = (cartItemId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((c) => c.cartItemId !== cartItemId),
    }));
  };

  const clearSelectedCart = () => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((c) => !c.selected),
    }));
  };

  const placeOrder: StoreContextValue['placeOrder'] = (payload) => {
    const subtotal = payload.items.reduce(
      (sum, item) =>
        sum +
        (item.unitPrice + item.prepExtraCost) * item.quantity +
        item.icePackQty * 500 +
        item.sauceQty * 3500,
      0
    );
    const shippingFee = subtotal >= 100000 || subtotal === 0 ? 0 : 4000;
    const member = currentMember;
    const coupon = member?.coupons.find((c) => c.id === payload.couponId && !c.used);
    const discountAmount = coupon ? coupon.discountAmount : 0;
    const totalAmount = Math.max(
      0,
      subtotal + shippingFee - discountAmount - payload.usedPoints
    );
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
    const orderNo = `KK${ymd}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const orderedAt = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNo,
      createdAt: orderedAt,
      memberId: member?.id || 'guest',
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      recipientName: payload.recipientName,
      recipientPhone: payload.recipientPhone,
      address: payload.address,
      deliveryMemo: payload.deliveryMemo,
      paymentMethod: payload.paymentMethod,
      items: payload.items,
      subtotal,
      shippingFee,
      discountAmount,
      usedPoints: payload.usedPoints,
      totalAmount,
      status: '결제완료',
      courier: 'CJ대한통운(신선특송)',
    };

    const earnedPoints = Math.floor(totalAmount * 0.02);

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      cart: prev.cart.filter(
        (c) => !payload.items.some((ordered) => ordered.cartItemId === c.cartItemId)
      ),
      products: prev.products.map((p) => {
        const orderedQty = payload.items
          .filter((i) => i.productId === p.id)
          .reduce((a, b) => a + b.quantity, 0);
        if (!orderedQty) return p;
        const nextStock = Math.max(0, p.stock - orderedQty);
        return { ...p, stock: nextStock, soldOut: nextStock === 0 };
      }),
      members: prev.members.map((m) => {
        if (m.id !== member?.id) return m;
        return {
          ...m,
          points: Math.max(0, m.points - payload.usedPoints) + earnedPoints,
          totalSpent: m.totalSpent + totalAmount,
          orderCount: m.orderCount + 1,
          coupons: m.coupons.map((c) =>
            c.id === payload.couponId ? { ...c, used: true } : c
          ),
        };
      }),
    }));

    if (supabase) {
      const summary = payload.items
        .map((i) => `${i.productName} × ${i.quantity}`)
        .join(', ');
      void supabase.from('orders').insert({
        id: newOrder.id,
        user_id: authSession?.user?.id ?? null,
        order_no: orderNo,
        member_id: newOrder.memberId,
        customer: payload.customerName,
        phone: payload.customerPhone,
        recipient_name: payload.recipientName,
        recipient_phone: payload.recipientPhone,
        address: payload.address,
        delivery_memo: payload.deliveryMemo,
        payment_method: payload.paymentMethod,
        tier: member?.grade || '일반',
        channel: '웹 주문',
        product_summary: summary,
        prep_type: payload.items[0]?.prepOption || '기본 포장',
        items: payload.items,
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        used_points: payload.usedPoints,
        amount: totalAmount,
        status: '결제완료',
        courier: newOrder.courier,
        ordered_at: orderedAt,
        confirmed: true,
      });

      for (const p of state.products) {
        const orderedQty = payload.items
          .filter((i) => i.productId === p.id)
          .reduce((a, b) => a + b.quantity, 0);
        if (orderedQty > 0) {
          const nextStock = Math.max(0, p.stock - orderedQty);
          void supabase
            .from('products')
            .update({
              stock: nextStock,
              sold_out: nextStock === 0,
              status: nextStock === 0 ? '품절' : '판매중',
            })
            .eq('id', p.id);
        }
      }

      if (member) {
        void supabase
          .from('profiles')
          .update({
            points: Math.max(0, member.points - payload.usedPoints) + earnedPoints,
            total_spent: member.totalSpent + totalAmount,
            order_count: member.orderCount + 1,
            last_order_date: now.toISOString().slice(0, 10),
          })
          .eq('id', member.id);
      }

      if (payload.couponId) {
        void supabase
          .from('coupons')
          .update({ used: true })
          .eq('id', payload.couponId);
      }
    }

    showToast(`주문이 완료되었습니다! (${orderNo})`);
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              trackingNumber:
                trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
            }
          : o
      ),
    }));
    if (supabase) {
      const patch: Record<string, unknown> = { status };
      if (trackingNumber !== undefined) patch.tracking_no = trackingNumber;
      void supabase.from('orders').update(patch).eq('id', orderId);
    }
    showToast(`주문 상태가 '${status}'(으)로 변경되었습니다.`);
  };

  const addProduct = (product: Omit<Product, 'id' | 'productNo'>) => {
    const nextNo = Math.max(100, ...state.products.map((p) => p.productNo)) + 1;
    const newProduct: Product = {
      ...product,
      id: `prod-${nextNo}`,
      productNo: nextNo,
    };
    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
    }));
    if (supabase) {
      void supabase.from('products').insert(mapAppProductToDb(newProduct));
    }
    showToast(`신규 상품 '${newProduct.shortName}'이 등록되었습니다.`);
  };

  const updateProduct = (productId: string, patch: Partial<Product>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, ...patch } : p
      ),
    }));
    if (supabase) {
      const dbPatch: Record<string, unknown> = {};
      if (patch.price !== undefined) dbPatch.price = patch.price;
      if (patch.discountRate !== undefined) dbPatch.discount_percent = patch.discountRate;
      if (patch.stock !== undefined) dbPatch.stock = patch.stock;
      if (patch.soldOut !== undefined) {
        dbPatch.sold_out = patch.soldOut;
        dbPatch.status = patch.soldOut ? '품절' : '판매중';
      }
      if (patch.reviewCount !== undefined) dbPatch.review_count = patch.reviewCount;
      if (Object.keys(dbPatch).length > 0) {
        void supabase.from('products').update(dbPatch).eq('id', productId);
      }
    }
    showToast('상품 정보가 수정되었습니다.');
  };

  const deleteProduct = (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
    if (supabase) {
      void supabase.from('products').delete().eq('id', productId);
    }
    showToast('상품이 삭제되었습니다.');
  };

  const addReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const targetProduct = state.products.find((p) => p.id === review.productId);
    const nextCount = (targetProduct?.reviewCount ?? 0) + 1;

    setState((prev) => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
      products: prev.products.map((p) =>
        p.id === review.productId ? { ...p, reviewCount: nextCount } : p
      ),
    }));

    if (supabase) {
      void supabase.from('reviews').insert({
        id: newReview.id,
        user_id: authSession?.user?.id ?? null,
        product_id: newReview.productId,
        product_name: newReview.productName,
        author: newReview.authorName,
        author_masked: newReview.authorMasked,
        rating: newReview.rating,
        text: newReview.content,
        created_at: newReview.createdAt,
        is_featured: newReview.isFeatured,
        verified_purchase: newReview.verifiedPurchase,
        tags: newReview.tags ?? [],
      });
      void supabase
        .from('products')
        .update({ review_count: nextCount })
        .eq('id', review.productId);
    }
    showToast('소중한 구매 후기가 등록되었습니다!');
  };

  const toggleReviewFeatured = (reviewId: string) => {
    const target = state.reviews.find((r) => r.id === reviewId);
    const nextVal = !(target?.isFeatured ?? false);
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === reviewId ? { ...r, isFeatured: nextVal } : r
      ),
    }));
    if (supabase) {
      void supabase
        .from('reviews')
        .update({ is_featured: nextVal })
        .eq('id', reviewId);
    }
  };

  const addInquiry = (inquiry: Omit<ProductInquiry, 'id' | 'createdAt'>) => {
    const newInq: ProductInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      inquiries: [newInq, ...prev.inquiries],
    }));
    if (supabase) {
      void supabase.from('inquiries').insert({
        id: newInq.id,
        user_id: authSession?.user?.id ?? null,
        product_id: newInq.productId,
        product_name: newInq.productName,
        author: newInq.authorName,
        question: newInq.question,
        created_at: newInq.createdAt,
        is_secret: Boolean(newInq.isSecret),
      });
    }
    showToast('상품 문의가 등록되었습니다.');
  };

  const answerInquiry = (inquiryId: string, answer: string) => {
    const answeredAt = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      inquiries: prev.inquiries.map((inq) =>
        inq.id === inquiryId ? { ...inq, answer, answeredAt } : inq
      ),
    }));
    if (supabase) {
      void supabase
        .from('inquiries')
        .update({ answer, answered_at: answeredAt })
        .eq('id', inquiryId);
    }
    showToast('문의 답변이 등록되었습니다.');
  };

  const updateBranchStatus = (branchId: string, status: StoreBranch['status']) => {
    setState((prev) => ({
      ...prev,
      branches: prev.branches.map((b) =>
        b.id === branchId ? { ...b, status } : b
      ),
    }));
    if (supabase) {
      void supabase
        .from('store_branches')
        .update({ status })
        .eq('id', branchId);
    }
    showToast('직영 매장 상태가 업데이트되었습니다.');
  };

  const updateVaultConfig = (patch: Partial<VaultConfig>) => {
    setState((prev) => ({
      ...prev,
      vaultConfig: { ...prev.vaultConfig, ...patch },
    }));
    if (supabase) {
      void supabase
        .from('vault_campaigns')
        .update({
          is_open: patch.isOpen,
          title: patch.title,
          discount_note: patch.subtitle,
          notice_banner: patch.noticeBanner,
          discount_code: patch.discountCode,
        })
        .eq('id', 'vault-default');
    }
    showToast('비밀창고 설정이 저장되었습니다.');
  };

  const resetDemoData = () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setState((prev) => ({
      ...prev,
      cart: [],
      currentMemberId: null,
    }));
    void refreshFromSupabase();
    showToast('세션 초기화 및 Supabase 데이터를 새로고침했습니다.');
  };

  return (
    <StoreContext.Provider
      value={{
        ...state,
        currentMember,
        authSession,
        authLoading,
        cartCount,
        toastMessage,
        dbConnected,
        dbLoading,
        showToast,
        refreshFromSupabase,
        signInWithOAuthProvider,
        signInWithEmail,
        signUpWithEmail,
        loginWithMemberId,
        loginWithCredentials,
        signupMember,
        logout,
        toggleWishlist,
        recordRecentView,
        updateMemberProfile,
        updateMemberGradeOrPoints,
        updateMemberRole,
        deleteMember,
        addToCart,
        updateCartQty,
        toggleCartSelected,
        toggleAllCartSelected,
        removeCartItem,
        clearSelectedCart,
        placeOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        toggleReviewFeatured,
        addInquiry,
        answerInquiry,
        updateBranchStatus,
        updateVaultConfig,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
