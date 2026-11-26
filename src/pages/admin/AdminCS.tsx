import React, { useEffect, useState } from 'react';
import { Mail, Star } from 'lucide-react';
import { useStore } from '../../context/storeContextValue';
import { supabase } from '../../lib/supabase';
import type { StoreBranch } from '../../types/store';

interface CustomerInquiryRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  message: string;
  email_status: string;
  created_at: string;
}

export const AdminCS: React.FC = () => {
  const {
    reviews,
    inquiries,
    branches,
    vaultConfig,
    toggleReviewFeatured,
    answerInquiry,
    updateBranchStatus,
    updateVaultConfig,
  } = useStore();

  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [vaultTitle, setVaultTitle] = useState(vaultConfig.title);
  const [vaultBanner, setVaultBanner] = useState(vaultConfig.noticeBanner);
  const [vaultCode, setVaultCode] = useState(vaultConfig.discountCode);
  const [contactInquiries, setContactInquiries] = useState<CustomerInquiryRow[]>([]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase
      .from('customer_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (active && data) {
          setContactInquiries(data as CustomerInquiryRow[]);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[26px] font-extrabold">후기 · 문의 · 비밀창고 관리</h1>
        <p className="text-[14px] text-[#6e6e73]">
          홈 화면 상단 리본, 직영 매장 상태, 상품 Q&amp;A 답변 및 베스트 후기를 관리합니다.
        </p>
      </div>

      {/* Secret Vault & Top Ribbon Control */}
      <section className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold">카카오 비밀창고 &amp; 상단 리본 설정</h2>
          <button
            type="button"
            onClick={() => updateVaultConfig({ isOpen: !vaultConfig.isOpen })}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold cursor-pointer ${
              vaultConfig.isOpen ? 'bg-[#fee500] text-[#3c1e1e]' : 'bg-[#f5f5f7] text-[#6e6e73]'
            }`}
          >
            {vaultConfig.isOpen ? '비밀창고 OPEN' : '오픈 대기중'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[13.5px]">
          <div>
            <label className="block text-[12px] font-bold text-[#6e6e73] mb-1">
              상단 리본 안내 문구
            </label>
            <input
              value={vaultBanner}
              onChange={(e) => setVaultBanner(e.target.value)}
              className="w-full h-[42px] px-3.5 rounded-[12px] bg-[#f5f5f7] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#6e6e73] mb-1">
              비밀창고 타이틀
            </label>
            <input
              value={vaultTitle}
              onChange={(e) => setVaultTitle(e.target.value)}
              className="w-full h-[42px] px-3.5 rounded-[12px] bg-[#f5f5f7] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#6e6e73] mb-1">
              전용 할인 코드
            </label>
            <input
              value={vaultCode}
              onChange={(e) => setVaultCode(e.target.value)}
              className="w-full h-[42px] px-3.5 rounded-[12px] bg-[#f5f5f7] outline-none font-bold"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            updateVaultConfig({
              title: vaultTitle,
              noticeBanner: vaultBanner,
              discountCode: vaultCode,
            })
          }
          className="h-[40px] px-5 rounded-full bg-[#1d1d1f] text-white text-[13px] font-bold cursor-pointer"
        >
          비밀창고 설정 저장
        </button>
      </section>

      {/* Branch Status */}
      <section className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60 space-y-4">
        <h2 className="text-[18px] font-extrabold">직영 매장 상태 관리</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {branches.map((b) => (
            <div key={b.id} className="p-4 rounded-[16px] bg-[#f5f5f7] space-y-2">
              <p className="font-extrabold">{b.name}</p>
              <p className="text-[12px] text-[#6e6e73]">{b.quote}</p>
              <select
                value={b.status}
                onChange={(e) =>
                  updateBranchStatus(b.id, e.target.value as StoreBranch['status'])
                }
                className="w-full h-[36px] px-2.5 rounded-[10px] bg-white border border-[#d2d2d7] text-[13px] font-bold"
              >
                <option value="정상영업">정상영업</option>
                <option value="물량입고중">물량입고중</option>
                <option value="마감임박">마감임박</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Product Q&A */}
      <section className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60 space-y-4">
        <h2 className="text-[18px] font-extrabold">상품 Q&amp;A 답변 관리</h2>
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="p-4 rounded-[16px] bg-[#f5f5f7] space-y-2">
              <div className="flex justify-between text-[12px] text-[#6e6e73]">
                <span className="font-bold text-[#1d1d1f]">
                  {inq.authorName} · {inq.productName}
                </span>
                <span>{inq.createdAt}</span>
              </div>
              <p className="text-[14px] font-bold">Q. {inq.question}</p>
              {inq.answer ? (
                <p className="text-[13px] text-[#1d1d1f] bg-white p-3 rounded-[12px]">
                  <strong className="text-[#0d5c63]">A.</strong> {inq.answer}
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={answerDrafts[inq.id] || ''}
                    onChange={(e) =>
                      setAnswerDrafts((prev) => ({
                        ...prev,
                        [inq.id]: e.target.value,
                      }))
                    }
                    placeholder="답변 내용을 입력하세요"
                    className="flex-1 h-[38px] px-3.5 rounded-[10px] bg-white text-[13px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const ans = (answerDrafts[inq.id] || '').trim();
                      if (ans) answerInquiry(inq.id, ans);
                    }}
                    className="px-4 h-[38px] rounded-[10px] bg-[#0d5c63] text-white text-[12.5px] font-bold cursor-pointer"
                  >
                    답변 등록
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 1:1 Email Inquiries */}
      <section className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#0d5c63]" />
            <span>1:1 고객 이메일 문의 접수 ({contactInquiries.length})</span>
          </h2>
        </div>
        {contactInquiries.length === 0 ? (
          <p className="text-[13.5px] text-[#6e6e73]">접수된 1:1 이메일 문의가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {contactInquiries.map((item) => (
              <div key={item.id} className="p-4 rounded-[16px] bg-[#f5f5f7] space-y-1.5 text-[13.5px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-[#1d1d1f]">
                    {item.name} · {item.phone} · {item.email}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[11.5px] font-bold text-[#0d5c63]">
                    {item.email_status} · {item.created_at.slice(0, 10)}
                  </span>
                </div>
                <p className="text-[12.5px] text-[#6e6e73]">주소: {item.address}</p>
                <p className="text-[#1d1d1f] pt-1 whitespace-pre-wrap">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews Management */}
      <section className="p-6 rounded-[20px] bg-white border border-[#d2d2d7]/60 space-y-4">
        <h2 className="text-[18px] font-extrabold">홈 메인 노출 베스트 후기 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-[16px] bg-[#f5f5f7] flex items-start justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-1 text-[#0d5c63] mb-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#e05a47]" />
                  ))}
                  <span className="ml-1 text-[12px] font-bold text-[#6e6e73]">
                    {r.authorMasked}
                  </span>
                </div>
                <p className="text-[13px] text-[#1d1d1f] line-clamp-2">{r.content}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleReviewFeatured(r.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-bold cursor-pointer ${
                  r.isFeatured ? 'bg-[#0d5c63] text-white' : 'bg-white text-[#6e6e73]'
                }`}
              >
                {r.isFeatured ? '홈 노출중' : '노출 안함'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
