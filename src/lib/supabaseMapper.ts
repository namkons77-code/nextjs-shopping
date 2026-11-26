import type {
  CartItem,
  GnbCategoryId,
  Member,
  MemberGrade,
  Order,
  OrderStatus,
  PickerTabId,
  PrepType,
  Product,
  ProductInquiry,
  Review,
  StoreBranch,
  VaultConfig,
} from '../types/store';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapDbProductToApp(row: any): Product {
  const gallery = Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : undefined;
  return {
    id: row.id,
    productNo: row.product_no ?? 100,
    name: row.name,
    shortName: row.short_name || row.name,
    subtitle: row.subtitle || '',
    category: (row.category || 'crab') as GnbCategoryId,
    pickerTab: (row.picker_tab || '대게') as PickerTabId,
    prepType: (row.prep_type || '둘다') as PrepType,
    price: Number(row.price ?? 0),
    originalPrice: Number(row.original_price ?? row.price ?? 0),
    discountRate: Number(row.discount_percent ?? 0),
    image: row.image || '/images/hero-crab-whole.jpg',
    gallery,
    badge: row.badge || undefined,
    isBestTile: Boolean(row.is_best_tile),
    bestTileTag: row.best_tile_tag || undefined,
    bestTileSubtext: row.best_tile_subtext || undefined,
    rating: Number(row.rating ?? 4.8),
    reviewCount: Number(row.review_count ?? 0),
    stock: Number(row.stock ?? 30),
    soldOut: Boolean(row.sold_out) || row.status === '품절',
    origin: row.origin || '러시아',
    weight: row.weight || '1kg 내외',
    shippingFee: Number(row.shipping_fee ?? 4000),
    supportsPrepOption: Boolean(row.supports_prep_option),
    steamingFee: Number(row.steaming_fee ?? 3000),
    description: row.description || row.subtitle || '',
  };
}

export function mapAppProductToDb(p: Product) {
  return {
    id: p.id,
    product_no: p.productNo,
    name: p.name,
    short_name: p.shortName,
    subtitle: p.subtitle,
    category: p.category,
    picker_tab: p.pickerTab,
    prep_type: p.prepType,
    price: p.price,
    original_price: p.originalPrice,
    discount_percent: p.discountRate,
    rating: p.rating,
    review_count: p.reviewCount,
    image: p.image,
    gallery: p.gallery ?? [],
    badge: p.badge ?? null,
    yield_standard: '특A급 수율보장',
    origin: p.origin,
    weight: p.weight,
    shipping_fee: p.shippingFee,
    supports_prep_option: Boolean(p.supportsPrepOption),
    steaming_fee: p.steamingFee ?? 3000,
    description: p.description,
    is_best_tile: Boolean(p.isBestTile),
    best_tile_tag: p.bestTileTag ?? null,
    best_tile_subtext: p.bestTileSubtext ?? null,
    stock: p.stock,
    sold_out: Boolean(p.soldOut),
    status: p.soldOut ? '품절' : '판매중',
  };
}

export function mapDbProfileToMember(row: any, allCoupons: any[]): Member {
  const memberCoupons = allCoupons
    .filter((c) => c.member_id === row.id || (row.auth_user_id && c.user_id === row.auth_user_id))
    .map((c) => ({
      id: c.id,
      title: c.title,
      discountAmount: Number(c.discount_amount ?? 0),
      minOrder: Number(c.min_order_amount ?? 0),
      expiresAt: c.expires_at,
      used: Boolean(c.used),
    }));

  const channel = String(row.channel || '');
  const loginType: Member['loginType'] = channel.includes('카카오')
    ? '카카오'
    : channel.includes('구글')
      ? '구글'
      : '일반';

  return {
    id: row.id,
    authUserId: row.auth_user_id || undefined,
    name: row.name || '크랩마스터 회원',
    email: row.email || '',
    phone: row.phone || '',
    grade: (row.tier || '일반') as MemberGrade,
    role: row.role === 'admin' ? 'admin' : 'member',
    points: Number(row.points ?? 0),
    coupons: memberCoupons,
    joinedAt:
      typeof row.created_at === 'string'
        ? row.created_at.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    totalSpent: Number(row.total_spent ?? 0),
    orderCount: Number(row.order_count ?? 0),
    wishlist: Array.isArray(row.wishlist) ? row.wishlist : [],
    recentViewed: Array.isArray(row.recent_viewed) ? row.recent_viewed : [],
    defaultAddress: row.default_address || '',
    loginType,
  };
}

export function mapDbOrderToApp(row: any): Order {
  const items: CartItem[] = Array.isArray(row.items) ? row.items : [];
  return {
    id: row.id,
    orderNo: row.order_no || row.id,
    createdAt: row.ordered_at || row.created_at || '',
    memberId: row.member_id || 'guest',
    customerName: row.customer || '',
    customerPhone: row.phone || '',
    recipientName: row.recipient_name || row.customer || '',
    recipientPhone: row.recipient_phone || row.phone || '',
    address: row.address || '',
    deliveryMemo: row.delivery_memo || '',
    paymentMethod: (row.payment_method || '카카오페이') as Order['paymentMethod'],
    items,
    subtotal: Number(row.subtotal ?? row.amount ?? 0),
    shippingFee: Number(row.shipping_fee ?? 0),
    discountAmount: Number(row.discount_amount ?? 0),
    usedPoints: Number(row.used_points ?? 0),
    totalAmount: Number(row.amount ?? 0),
    status: (row.status || '결제완료') as OrderStatus,
    trackingNumber: row.tracking_no || undefined,
    courier: row.courier || 'CJ대한통운(신선특송)',
  };
}

export function mapDbReviewToApp(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    authorMasked: row.author_masked || `${(row.author || '고')[0]}*****`,
    authorName: row.author || '고객',
    rating: Number(row.rating ?? 5),
    content: row.text || '',
    createdAt: row.created_at || '',
    isFeatured: row.is_featured !== false,
    verifiedPurchase: row.verified_purchase !== false,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export function mapDbInquiryToApp(row: any): ProductInquiry {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    authorName: row.author || '고객',
    question: row.question || '',
    answer: row.answer || undefined,
    answeredAt: row.answered_at || undefined,
    createdAt: row.created_at || '',
    isSecret: Boolean(row.is_secret),
  };
}

export function mapDbBranchToApp(row: any): StoreBranch {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    quote: row.quote,
    isNew: Boolean(row.is_new),
    address: row.address,
    phone: row.phone,
    hours: row.hours,
    status: (row.status || '정상영업') as StoreBranch['status'],
    image: row.image || '/images/store-picker.jpg',
  };
}

export function mapDbVaultToApp(row: any): VaultConfig {
  return {
    isOpen: row.is_open !== false,
    title: row.title || '갑각류 비밀창고 금주의 시세 특가',
    subtitle: row.discount_note || '매주 1~2회 특별창고 오픈 · 카톡방 선착순 전용가',
    noticeBanner:
      row.notice_banner || '특가 뜨면 카톡이 울려요 · 갑각류 비밀창고로 모십니다',
    discountCode: row.discount_code || 'MASTER10',
  };
}
