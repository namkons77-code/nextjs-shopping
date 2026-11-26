import React, { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { GNB_CATEGORIES } from '../data/seedData';
import { useStore } from '../context/storeContextValue';
import { ProductCard } from '../components/common/ProductCard';

type SortOption = 'newest' | 'name' | 'price-asc' | 'price-desc' | 'reviews';

export const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products } = useStore();

  const query = searchParams.get('q') || '';
  const prepParam = searchParams.get('prep') || '전체';
  const tabParam = searchParams.get('tab') || '';
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const currentCatObj = GNB_CATEGORIES.find((c) => c.id === category);
  const pageTitle = query
    ? `'${query}' 검색 결과`
    : tabParam
      ? tabParam
      : currentCatObj?.label || '전체 상품';

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (category && category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

    if (tabParam) {
      list = list.filter((p) => p.pickerTab === tabParam);
    }

    if (prepParam === '활') {
      list = list.filter((p) => p.prepType === '활' || p.prepType === '둘다');
    } else if (prepParam === '자숙') {
      list = list.filter((p) => p.prepType === '자숙' || p.prepType === '둘다');
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortName.toLowerCase().includes(q) ||
          p.pickerTab.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'reviews':
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        list.sort((a, b) => a.productNo - b.productNo);
        break;
    }

    return list;
  }, [products, category, tabParam, prepParam, query, sortBy]);

  const setPrepFilter = (prep: string) => {
    const next = new URLSearchParams(searchParams);
    if (prep === '전체') next.delete('prep');
    else next.set('prep', prep);
    setSearchParams(next);
  };

  return (
    <div className="bg-white pb-20">
      {/* Full-width #f5f5f7 Category Title Banner */}
      <div className="bg-[#f5f5f7] py-12 md:py-16 text-center px-4">
        <h1 className="text-[32px] md:text-[44px] font-extrabold tracking-[-0.03em] text-[#1d1d1f]">
          {pageTitle}
        </h1>
        <p className="mt-2 text-[15px] text-[#6e6e73]">
          매일 아침 직영 매장에서 선별한 특A급 신선 수산물
        </p>
      </div>

      {/* Filter & Sort Bar */}
      <div className="max-w-[1180px] mx-auto px-[22px] pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#d2d2d7]/70">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[14px] text-[#6e6e73]">
              총 <strong className="text-[#1d1d1f] font-extrabold">{filteredProducts.length}</strong>개의 상품이 있습니다.
            </p>
            <div className="flex items-center gap-1.5">
              {['전체', '활', '자숙'].map((prep) => (
                <button
                  key={prep}
                  type="button"
                  onClick={() => setPrepFilter(prep)}
                  className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold transition cursor-pointer ${
                    prepParam === prep
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {prep}
                </button>
              ))}
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="정렬방식"
            className="h-[38px] px-3.5 rounded-full border border-[#d2d2d7] bg-white text-[13.5px] font-semibold text-[#1d1d1f] outline-none"
          >
            <option value="newest">- 정렬방식 -</option>
            <option value="newest">신상품</option>
            <option value="name">상품명</option>
            <option value="price-asc">낮은가격</option>
            <option value="price-desc">높은가격</option>
            <option value="reviews">사용후기</option>
          </select>
        </div>

        {/* 4-column desktop / 2-column mobile grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[18px] font-bold text-[#1d1d1f]">
              조건에 맞는 상품이 없습니다.
            </p>
            <p className="mt-2 text-[14px] text-[#6e6e73]">
              다른 검색어나 카테고리를 선택해 주세요.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
