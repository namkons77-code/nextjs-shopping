import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { StoreLayout } from './components/layout/StoreLayout';
import { HomePage } from './pages/HomePage';

const CategoryPage = lazy(() =>
  import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const CartPage = lazy(() =>
  import('./pages/CartPage').then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const OrderCompletePage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.OrderCompletePage }))
);
const PaymentSuccessPage = lazy(() =>
  import('./pages/PaymentResultPages').then((m) => ({
    default: m.PaymentSuccessPage,
  }))
);
const PaymentFailPage = lazy(() =>
  import('./pages/PaymentResultPages').then((m) => ({
    default: m.PaymentFailPage,
  }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() =>
  import('./pages/SignupPage').then((m) => ({ default: m.SignupPage }))
);
const AuthCallbackPage = lazy(() =>
  import('./pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage }))
);
const MyPage = lazy(() =>
  import('./pages/MyPage').then((m) => ({ default: m.MyPage }))
);
const ReviewsPage = lazy(() =>
  import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const MobileViewPage = lazy(() =>
  import('./pages/MobileViewPage').then((m) => ({ default: m.MobileViewPage }))
);
const AdminLayout = lazy(() =>
  import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminProducts = lazy(() =>
  import('./pages/admin/AdminProducts').then((m) => ({ default: m.AdminProducts }))
);
const AdminOrders = lazy(() =>
  import('./pages/admin/AdminOrders').then((m) => ({ default: m.AdminOrders }))
);
const AdminMembers = lazy(() =>
  import('./pages/admin/AdminMembers').then((m) => ({ default: m.AdminMembers }))
);
const AdminCS = lazy(() =>
  import('./pages/admin/AdminCS').then((m) => ({ default: m.AdminCS }))
);

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-[#f5f5f7] border-t-[#0d5c63] animate-spin" />
  </div>
);

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* 회원용 쇼핑몰 (PC + 반응형) */}
            <Route element={<StoreLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<CategoryPage />} />
              <Route path="/products/:category" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/fail" element={<PaymentFailPage />} />
              <Route path="/order-complete/:orderId" element={<OrderCompletePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/mypage" element={<MyPage />} />
            </Route>

            {/* 모바일 전용 페이지 */}
            <Route path="/mobile" element={<MobileViewPage />} />

            {/* 관리자 페이지 */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="cs" element={<AdminCS />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
