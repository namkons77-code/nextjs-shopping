import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
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

export interface LocalSession {
  cart: CartItem[];
  currentMemberId: string | null;
}

export interface PersistedState extends LocalSession {
  products: Product[];
  orders: Order[];
  members: Member[];
  reviews: Review[];
  inquiries: ProductInquiry[];
  branches: StoreBranch[];
  vaultConfig: VaultConfig;
}

export interface OAuthResult {
  ok: boolean;
  error?: string;
  role?: 'member' | 'admin';
}

export interface StoreContextValue extends PersistedState {
  currentMember: Member | null;
  authSession: Session | null;
  authLoading: boolean;
  cartCount: number;
  toastMessage: string | null;
  dbConnected: boolean;
  dbLoading: boolean;
  showToast: (msg: string) => void;
  refreshFromSupabase: () => Promise<void>;
  signInWithOAuthProvider: (provider: 'google' | 'kakao') => Promise<OAuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<OAuthResult>;
  signUpWithEmail: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    defaultAddress?: string;
  }) => Promise<OAuthResult>;
  loginWithMemberId: (memberId: string) => void;
  loginWithCredentials: (emailOrName: string, loginType?: Member['loginType']) => Member;
  signupMember: (data: {
    name: string;
    email: string;
    phone: string;
    defaultAddress?: string;
    loginType?: Member['loginType'];
  }) => Member;
  logout: () => Promise<void>;
  toggleWishlist: (productId: string) => void;
  recordRecentView: (productId: string) => void;
  updateMemberProfile: (memberId: string, patch: Partial<Member>) => void;
  updateMemberGradeOrPoints: (memberId: string, grade: MemberGrade, deltaPoints: number) => void;
  updateMemberRole: (memberId: string, role: 'member' | 'admin') => void;
  deleteMember: (memberId: string) => Promise<void>;
  addToCart: (item: Omit<CartItem, 'cartItemId' | 'selected'>) => void;
  updateCartQty: (cartItemId: string, delta: number) => void;
  toggleCartSelected: (cartItemId: string) => void;
  toggleAllCartSelected: (selected: boolean) => void;
  removeCartItem: (cartItemId: string) => void;
  clearSelectedCart: () => void;
  placeOrder: (payload: {
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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'productNo'>) => void;
  updateProduct: (productId: string, patch: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  toggleReviewFeatured: (reviewId: string) => void;
  addInquiry: (inquiry: Omit<ProductInquiry, 'id' | 'createdAt'>) => void;
  answerInquiry: (inquiryId: string, answer: string) => void;
  updateBranchStatus: (branchId: string, status: StoreBranch['status']) => void;
  updateVaultConfig: (patch: Partial<VaultConfig>) => void;
  resetDemoData: () => void;
}

export const StoreContext = createContext<StoreContextValue | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};
