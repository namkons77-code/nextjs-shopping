import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import { useStore } from '../context/storeContextValue';
import { supabase } from '../lib/supabase';

interface SubmitResult {
  mode: 'smtp_sent' | 'ethereal_preview' | 'saved_only';
  to?: string;
  previewUrl?: string | null;
}

export const ContactPage: React.FC = () => {
  const { currentMember, showToast } = useStore();

  const [name, setName] = useState(currentMember?.name || '');
  const [phone, setPhone] = useState(currentMember?.phone || '');
  const [email, setEmail] = useState(currentMember?.email || '');
  const [address, setAddress] = useState(currentMember?.defaultAddress || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim() ||
      !message.trim()
    ) {
      setErrorMsg('이름, 전화번호, 이메일, 주소, 문의 내용을 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      let emailRes: SubmitResult = { mode: 'saved_only' };
      let mailOk = false;

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            message: message.trim(),
          }),
        });

        const data = (await res.json()) as {
          ok?: boolean;
          mode?: 'smtp_sent' | 'ethereal_preview';
          to?: string;
          previewUrl?: string | null;
          error?: string;
        };

        if (!res.ok || !data.ok) {
          throw new Error(data.error || '이메일 발송에 실패했습니다.');
        }
        mailOk = true;
        emailRes = {
          mode: data.mode || 'smtp_sent',
          to: data.to,
          previewUrl: data.previewUrl,
        };
      } catch (err) {
        if (!supabase) {
          throw err;
        }
        setErrorMsg(
          err instanceof Error
            ? `메일 서버 응답 확인 필요: ${err.message} (문의 내용은 DB에 안전하게 저장되었습니다.)`
            : '메일 서버 연결 실패 (문의 내용은 DB에 저장되었습니다.)'
        );
      }

      if (supabase) {
        await supabase.from('customer_inquiries').insert({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          message: message.trim(),
          email_status: mailOk ? emailRes.mode : 'db_only',
        });
      }

      setResult(emailRes);
      setMessage('');
      showToast('문의가 정상적으로 접수되었습니다!');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : '문의 전송 중 문제가 발생했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white pb-24">
      {/* Header Banner */}
      <div className="bg-[#f5f5f7] py-12 md:py-16 text-center px-4">
        <p className="text-[14px] font-bold text-[#0d5c63] mb-1.5">
          CUSTOMER SUPPORT · CRAB MASTER
        </p>
        <h1 className="text-[32px] md:text-[44px] font-extrabold tracking-[-0.03em] text-[#1d1d1f]">
          문의하기
        </h1>
        <p className="mt-2 text-[15px] text-[#6e6e73] max-w-[520px] mx-auto">
          상품 시세, 대량·법인 배송, 직영 매장 픽업 등 궁금한 점을 남겨주시면 이메일로 바로 받아 확인 후 연락드립니다.
        </p>
      </div>

      <div className="max-w-[1060px] mx-auto px-[22px] pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Info Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-7 rounded-[24px] bg-[#0d5c63] text-white space-y-5">
            <div>
              <p className="text-[12px] font-extrabold tracking-widest text-[#ff7b69]">
                CRAB MASTER CS
              </p>
              <h2 className="mt-1 text-[24px] font-extrabold">크랩마스터 고객센터</h2>
              <p className="mt-2 text-[14px] text-white/80 leading-relaxed">
                평일 10:30 ~ 17:30 운영 · 접수된 문의는 담당자 이메일로 즉시 전송됩니다.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/15 text-[14px]">
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ff7b69] shrink-0" />
                <span className="font-bold">031-8043-2244</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#ff7b69] shrink-0" />
                <span>help@crabmaster.kr</span>
              </p>
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#ff7b69] shrink-0 mt-1" />
                <span>경기 화성시 동탄기흥로 594-7, 1214·1215호</span>
              </p>
            </div>
          </div>

          <div className="p-6 rounded-[20px] bg-[#f5f5f7] text-[13.5px] text-[#6e6e73] space-y-2">
            <p className="font-bold text-[#1d1d1f]">자주 묻는 안내</p>
            <p>• 활 상품은 오후 3시, 찜 상품은 오후 1시 이전 결제 시 당일 출고됩니다.</p>
            <p>• 법인·명절 선물 대량 주문은 주소지 엑셀 접수 및 세금계산서 발행이 가능합니다.</p>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="p-8 rounded-[24px] bg-[#f5f5f7] text-center space-y-4">
              <CheckCircle2 className="w-14 h-14 text-[#0d5c63] mx-auto" />
              <h2 className="text-[24px] font-extrabold text-[#1d1d1f]">
                문의 이메일이 접수되었습니다!
              </h2>
              <p className="text-[14.5px] text-[#6e6e73] leading-relaxed">
                {result.mode === 'smtp_sent'
                  ? `담당자 이메일(${result.to})로 문의 내용이 즉시 발송되었습니다.`
                  : result.mode === 'ethereal_preview'
                    ? 'Nodemailer 테스트 메일함으로 발송되었습니다. 아래 링크에서 발송된 이메일을 바로 미리보기 할 수 있습니다.'
                    : '문의 내용이 데이터베이스에 저장되었습니다.'}
              </p>

              {result.previewUrl && (
                <a
                  href={result.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-[#d2d2d7] text-[13.5px] font-bold text-[#0d5c63] hover:underline"
                >
                  <span>발송된 이메일 미리보기 (Ethereal)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <div className="pt-3 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="h-[46px] px-6 rounded-full bg-[#0d5c63] text-white text-[14px] font-bold cursor-pointer"
                >
                  추가 문의하기
                </button>
                <Link
                  to="/"
                  className="h-[46px] px-6 rounded-full bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[14px] font-bold flex items-center"
                >
                  홈으로 이동
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="p-6 sm:p-8 rounded-[24px] bg-[#f5f5f7] space-y-4"
            >
              <h2 className="text-[20px] font-extrabold text-[#1d1d1f] mb-1">
                1:1 이메일 문의 작성
              </h2>

              {errorMsg && (
                <div className="p-3.5 rounded-[14px] bg-amber-50 border border-amber-200 text-[13px] font-semibold text-amber-900">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[13px] font-bold text-[#1d1d1f] mb-1.5"
                  >
                    이름 *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full h-[46px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-[13px] font-bold text-[#1d1d1f] mb-1.5"
                  >
                    전화번호 *
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full h-[46px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-[13px] font-bold text-[#1d1d1f] mb-1.5"
                >
                  이메일 *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full h-[46px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-address"
                  className="block text-[13px] font-bold text-[#1d1d1f] mb-1.5"
                >
                  주소 *
                </label>
                <input
                  id="contact-address"
                  name="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="배송지 또는 거주지 주소를 입력해 주세요"
                  className="w-full h-[46px] px-4 rounded-[12px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-[13px] font-bold text-[#1d1d1f] mb-1.5"
                >
                  문의 내용 *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="문의하실 상품명, 수량, 배송 희망일 등 자세한 내용을 작성해 주세요."
                  className="w-full p-4 rounded-[14px] bg-white border border-[#d2d2d7] text-[14px] outline-none focus:border-[#0d5c63] resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-[50px] rounded-full bg-[#0d5c63] hover:bg-[#094449] disabled:opacity-60 text-white text-[15.5px] font-extrabold inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? '이메일 전송 중...' : '문의 이메일 보내기'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
