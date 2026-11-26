import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useStore } from '../context/storeContextValue';

export const ReviewsPage: React.FC = () => {
  const { reviews } = useStore();
  const [minStars, setMinStars] = useState<number>(0);

  const visibleReviews =
    minStars > 0 ? reviews.filter((r) => r.rating >= minStars) : reviews;

  return (
    <div className="bg-white pb-24">
      <div className="bg-[#f5f5f7] py-12 md:py-16 text-center px-4">
        <h1 className="text-[32px] md:text-[44px] font-extrabold text-[#1d1d1f]">
          구매 후기
        </h1>
        <p className="mt-2 text-[15px] text-[#6e6e73]">
          크랩마스터를 먼저 받아본 고객님들의 생생한 수율·맛 후기
        </p>
      </div>

      <div className="max-w-[1180px] mx-auto px-[22px] pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#d2d2d7]">
          <p className="text-[14px] text-[#6e6e73]">
            총 <strong className="text-[#1d1d1f]">{visibleReviews.length}</strong>건의 베스트 후기
          </p>
          <div className="flex gap-2">
            {[
              { label: '전체', value: 0 },
              { label: '★ 5점만', value: 5 },
            ].map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setMinStars(f.value)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold cursor-pointer ${
                  minStars === f.value
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-[#f5f5f7] text-[#6e6e73]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-[20px] bg-[#f5f5f7] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-[#0d5c63]">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-[#e05a47]" />
                    ))}
                  </div>
                  <span className="text-[12px] text-[#6e6e73]">{rev.createdAt}</span>
                </div>
                <p className="text-[15px] text-[#1d1d1f] leading-relaxed">
                  {rev.content}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#d2d2d7]/70 flex items-center justify-between text-[12.5px]">
                <span className="font-bold text-[#6e6e73]">{rev.authorMasked}</span>
                <Link
                  to={`/product/${rev.productId}`}
                  className="font-bold text-[#0d5c63] hover:underline truncate max-w-[180px]"
                >
                  {rev.productName} ›
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
