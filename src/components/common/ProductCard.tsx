import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import type { Product } from '../../types/store';
import { useStore } from '../../context/storeContextValue';
import { SafeImage } from './BrandAssets';
import { formatKRW } from '../../utils/format';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  showReviews?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  compact = false,
  showReviews = true,
}) => {
  const { currentMember, toggleWishlist } = useStore();
  const isWished = currentMember?.wishlist.includes(product.id) ?? false;

  return (
    <div
      className={`group rounded-[18px] bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${
        compact ? 'w-[240px] sm:w-[272px] shrink-0 p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]' : 'flex flex-col'
      }`}
    >
      {/* Thumbnail 1:1 */}
      <div className="relative aspect-square rounded-[14px] bg-[#f5f5f7] overflow-hidden mb-3">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <SafeImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Top-left badge */}
        {product.badge && !product.soldOut && (
          <span
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${
              product.badge === '신상품' ? 'bg-[#0d5c63]' : 'bg-[#e05a47]'
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Sold-out overlay */}
        {product.soldOut && (
          <Link
            to={`/product/${product.id}`}
            className="absolute inset-0 bg-black/55 flex items-center justify-center"
          >
            <span className="text-white text-[18px] font-extrabold tracking-widest">
              품절
            </span>
          </Link>
        )}

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label="관심상품 토글"
          className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-110 transition cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              isWished ? 'fill-[#e05a47] text-[#e05a47]' : 'text-[#6e6e73]'
            }`}
          />
        </button>
      </div>

      {/* Info */}
      <Link to={`/product/${product.id}`} className="block flex-1">
        <h3 className="text-[14.5px] sm:text-[15.5px] font-semibold text-[#1d1d1f] leading-snug line-clamp-2 min-h-[42px]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline flex-wrap gap-1.5">
          {product.discountRate > 0 && (
            <span className="text-[15px] font-extrabold text-[#e05a47]">
              {product.discountRate}%
            </span>
          )}
          <span className="text-[17px] font-extrabold text-[#1d1d1f]">
            {formatKRW(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[13px] text-[#6e6e73] line-through">
              {formatKRW(product.originalPrice)}
            </span>
          )}
        </div>

        {showReviews && (
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
            <span>리뷰: {product.reviewCount.toLocaleString()}</span>
            <span>|</span>
            <span className="inline-flex items-center gap-0.5 text-[#1d1d1f] font-semibold">
              <Star className="w-3.5 h-3.5 fill-[#e05a47] text-[#e05a47]" />
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
};
