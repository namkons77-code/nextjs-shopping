import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ANATOMY_CALLOUTS = [
  {
    num: '01',
    title: '게딱지 속 장',
    desc: '밥 한 숟갈 넣고 비벼 드세요',
    posClass: 'top-[14%] left-[4%] md:left-[6%]',
    dotClass: 'top-[42%] left-[48%]',
  },
  {
    num: '02',
    title: '몸통살',
    desc: '칸칸이 든 살, 젓가락으로 쏙',
    posClass: 'top-[16%] right-[4%] md:right-[6%]',
    dotClass: 'top-[54%] left-[56%]',
  },
  {
    num: '03',
    title: '집게살',
    desc: '통으로 쏙 빠져요',
    posClass: 'bottom-[18%] left-[4%] md:left-[6%]',
    dotClass: 'top-[68%] left-[32%]',
  },
  {
    num: '04',
    title: '다리살',
    desc: '쭉 빼면 한 줄로 나와요',
    posClass: 'bottom-[16%] right-[4%] md:right-[6%]',
    dotClass: 'top-[62%] left-[72%]',
  },
];

export const HeroCrabStage: React.FC = () => {
  const [peeled, setPeeled] = useState(false);

  return (
    <section className="bg-white pt-10 md:pt-16 pb-14 md:pb-20 overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-[22px] text-center">
        {/* Eyebrow */}
        <p className="text-[15px] md:text-[16px] font-bold text-[#0d5c63] mb-2">
          갑각류 전문 수산몰 · CRAB MASTER
        </p>

        {/* H1 */}
        <h1 className="text-[42px] sm:text-[54px] md:text-[70px] font-extrabold leading-[1.12] tracking-[-0.04em] text-[#1d1d1f]">
          대게 킹크랩은
          <br />
          <span className="text-[#0d5c63]">크랩마스터.</span>
        </h1>

        {/* Subcopy */}
        <p className="mt-4 max-w-[540px] mx-auto text-[16px] md:text-[19px] text-[#6e6e73] leading-relaxed">
          러시아 선주 직송 활대게와 킹크랩. 직영 매장 4곳이 매일 아침 직접 골라 보내요.
        </p>

        {/* Hero CTAs */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/product/prod-41"
            className="h-[48px] px-7 rounded-full bg-[#0d5c63] hover:bg-[#094449] text-white text-[16px] font-bold inline-flex items-center justify-center transition"
          >
            대게 구매하기
          </Link>
          <a
            href="#r2-pick"
            className="h-[48px] px-4 inline-flex items-center gap-1 text-[#0d5c63] hover:text-[#094449] text-[16px] font-bold transition"
          >
            <span>전체 품목 보기</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </a>
        </div>

        {/* Interactive Crab Anatomy Stage (.xstage) */}
        <div className="relative mt-8 md:mt-10 max-w-[820px] mx-auto">
          {/* Floating Speech Bubble */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]/70 text-[13px] font-bold text-[#1d1d1f] shadow-sm mb-3">
            <span className="w-2 h-2 rounded-full bg-[#e05a47] animate-pulse" />
            <span>{peeled ? '수율 꽉 찬 속살을 확인하세요!' : '당겨서 까 보세요!'}</span>
          </div>

          {/* Segment Toggle (.xseg) */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex p-1 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]/70">
              <button
                type="button"
                onClick={() => setPeeled(false)}
                className={`px-5 py-2 rounded-full text-[14px] font-bold transition cursor-pointer ${
                  !peeled
                    ? 'bg-[#1d1d1f] text-white shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                통째로
              </button>
              <button
                type="button"
                onClick={() => setPeeled(true)}
                className={`px-5 py-2 rounded-full text-[14px] font-bold transition cursor-pointer ${
                  peeled
                    ? 'bg-[#0d5c63] text-white shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                까서 보기
              </button>
            </div>
          </div>

          {/* Interactive Crab Visual Canvas */}
          <div
            onClick={() => setPeeled((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setPeeled((v) => !v);
            }}
            aria-label="대게 통째로 또는 까서 보기 전환"
            className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[470px] mx-auto rounded-[28px] bg-white flex items-center justify-center cursor-pointer select-none"
          >
            <img
              src={peeled ? '/images/hero-crab-open.jpg' : '/images/hero-crab-whole.jpg'}
              alt={peeled ? '까서 본 러시아 자숙 대게 속살과 게장' : '통째로 찐 러시아 대게'}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-contain transition-all duration-500 scale-[0.94] hover:scale-[0.97]"
            />

            {/* Callout Pins when peeled */}
            {peeled &&
              ANATOMY_CALLOUTS.map((item) => (
                <React.Fragment key={item.num}>
                  <span
                    className={`hidden sm:block absolute w-3.5 h-3.5 rounded-full bg-[#e05a47] ring-4 ring-[#e05a47]/25 ${item.dotClass}`}
                  />
                  <div
                    className={`absolute ${item.posClass} max-w-[165px] sm:max-w-[205px] p-2.5 sm:p-3.5 rounded-[16px] bg-white/95 backdrop-blur-md border border-[#d2d2d7] shadow-[0_10px_28px_rgba(0,0,0,0.08)] text-left transition-all`}
                  >
                    <p className="text-[11px] font-extrabold text-[#0d5c63]">
                      {item.num} {item.title}
                    </p>
                    <p className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#1d1d1f] leading-snug mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </React.Fragment>
              ))}
          </div>
        </div>

        {/* Bottom 3 Facts Strip (.r2-hero__facts) */}
        <div className="mt-10 md:mt-14 pt-8 border-t border-[#d2d2d7]/70 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[880px] mx-auto">
          <div className="text-center">
            <p className="text-[32px] md:text-[38px] font-extrabold tracking-tight text-[#1d1d1f]">
              4곳
            </p>
            <p className="mt-1 text-[14px] text-[#6e6e73]">
              인천·화성·하남·동탄 직영 매장
            </p>
          </div>
          <div className="text-center">
            <p className="text-[32px] md:text-[38px] font-extrabold tracking-tight text-[#1d1d1f]">
              2,000만+
            </p>
            <p className="mt-1 text-[14px] text-[#6e6e73]">
              대게·킹크랩 릴스 누적 조회수
            </p>
          </div>
          <div className="text-center">
            <p className="text-[32px] md:text-[38px] font-extrabold tracking-tight text-[#1d1d1f]">
              kg
            </p>
            <p className="mt-1 text-[14px] text-[#6e6e73]">
              러시아 대게·킹크랩은 무게로 달아 팔아요
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
