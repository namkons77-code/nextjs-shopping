export type GnbCategoryId =
  | 'crab'
  | 'lobster-shrimp'
  | 'seafood'
  | 'produce'
  | 'gift'
  | 'all';

export type PickerTabId =
  | '대게'
  | '킹크랩'
  | '홍게'
  | '꽃게'
  | '랍스터'
  | '새우'
  | '수산물'
  | '농산물';

export type PrepType = '활' | '자숙' | '둘다' | '일반';

export interface Product {
  id: string;
  productNo: number;
  name: string;
  shortName: string;
  subtitle: string;
  category: GnbCategoryId;
  pickerTab: PickerTabId;
  prepType: PrepType;
  price: number;
  originalPrice: number;
  discountRate: number;
  image: string;
  gallery?: string[];
  badge?: '추천' | '신상품' | 'BEST' | '특가';
  isBestTile?: boolean;
  bestTileTag?: string;
  bestTileSubtext?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  soldOut?: boolean;
  origin: string;
  weight: string;
  shippingFee: number;
  supportsPrepOption?: boolean;
  steamingFee?: number;
  description: string;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  image: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  prepOption: '활 상품✨ 오후3시마감' | '찜 추가🎁 오후1시마감' | '기본 포장';
  prepExtraCost: number;
  deliveryDate: string;
  icePackQty: number;
  sauceQty: number;
  selected: boolean;
}

export type OrderStatus =
  | '결제완료'
  | '상품준비중'
  | '활/자숙 손질중'
  | '배송중'
  | '배송완료'
  | '취소/환불';

export interface Order {
  id: string;
  orderNo: string;
  createdAt: string;
  memberId: string;
  customerName: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  deliveryMemo: string;
  paymentMethod: '토스페이' | '카카오페이' | '네이버페이' | '신용/체크카드' | '무통장입금';
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  usedPoints: number;
  totalAmount: number;
  status: OrderStatus;
  trackingNumber?: string;
  courier?: string;
}

export type MemberGrade = '일반' | '실버' | 'VIP' | 'VVIP';

export interface Member {
  id: string;
  authUserId?: string;
  name: string;
  email: string;
  phone: string;
  grade: MemberGrade;
  role?: 'member' | 'admin';
  points: number;
  coupons: {
    id: string;
    title: string;
    discountAmount: number;
    minOrder: number;
    expiresAt: string;
    used?: boolean;
  }[];
  joinedAt: string;
  totalSpent: number;
  orderCount: number;
  wishlist: string[];
  recentViewed: string[];
  defaultAddress?: string;
  loginType: '일반' | '카카오' | '구글';
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorMasked: string;
  authorName: string;
  rating: number;
  content: string;
  createdAt: string;
  isFeatured: boolean;
  verifiedPurchase: boolean;
  tags?: string[];
}

export interface ProductInquiry {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
  isSecret?: boolean;
}

export interface StoreBranch {
  id: string;
  name: string;
  role: string;
  quote: string;
  isNew?: boolean;
  address: string;
  phone: string;
  hours: string;
  status: '정상영업' | '물량입고중' | '마감임박';
  image: string;
}

export interface VaultConfig {
  isOpen: boolean;
  title: string;
  subtitle: string;
  noticeBanner: string;
  discountCode: string;
}
