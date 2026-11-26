import React, { useState } from 'react';
import { AlertTriangle, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/storeContextValue';
import type { Member, MemberGrade } from '../../types/store';
import { formatKRW } from '../../utils/format';

const GRADES: MemberGrade[] = ['일반', '실버', 'VIP', 'VVIP'];

export const AdminMembers: React.FC = () => {
  const {
    members,
    currentMember,
    updateMemberGradeOrPoints,
    updateMemberRole,
    deleteMember,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'member' | 'admin'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visibleMembers = members.filter((m) => {
    const matchRole =
      roleFilter === 'all' || (m.role === 'admin' ? 'admin' : 'member') === roleFilter;
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q);
    return matchRole && matchQ;
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentMember?.id) {
      showToast('현재 로그인 중인 관리자 계정은 삭제할 수 없습니다.');
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    await deleteMember(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">회원 · 등급 · 삭제 관리</h1>
          <p className="text-[14px] text-[#6e6e73]">
            회원 등급·관리자 권한 변경, 적립금 관리 및 회원 삭제를 처리합니다.
          </p>
        </div>
        <span className="text-[13.5px] font-bold text-[#6e6e73]">
          전체 <strong className="text-[#1d1d1f]">{members.length}</strong>명
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-[18px] bg-white border border-[#d2d2d7]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {[
            { id: 'all', label: `전체 (${members.length})` },
            {
              id: 'member',
              label: `일반회원 (${members.filter((m) => m.role !== 'admin').length})`,
            },
            {
              id: 'admin',
              label: `관리자 (${members.filter((m) => m.role === 'admin').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id as typeof roleFilter)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer ${
                roleFilter === tab.id ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-full h-[38px] px-4 w-full sm:w-[260px]">
          <Search className="w-4 h-4 text-[#6e6e73]" />
          <input
            aria-label="회원 이름 또는 이메일 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름, 이메일, 연락처 검색"
            className="bg-transparent text-[13.5px] outline-none flex-1"
          />
        </div>
      </div>

      <div className="rounded-[20px] bg-white border border-[#d2d2d7]/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-[#f5f5f7] text-left text-[#6e6e73]">
              <tr>
                <th className="p-4">회원명</th>
                <th className="p-4">가입유형 / 연락처</th>
                <th className="p-4">권한</th>
                <th className="p-4">누적 구매액</th>
                <th className="p-4">등급</th>
                <th className="p-4">보유 적립금</th>
                <th className="p-4">적립금 지급/차감</th>
                <th className="p-4 text-right">회원 삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {visibleMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-[#6e6e73]">
                    조건에 맞는 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                visibleMembers.map((m) => {
                  const isSelf = m.id === currentMember?.id;
                  return (
                    <tr key={m.id} className="hover:bg-[#f5f5f7]/50">
                      <td className="p-4">
                        <p className="font-extrabold text-[#1d1d1f] flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {m.role === 'admin' && (
                            <ShieldCheck className="w-4 h-4 text-[#0d5c63]" />
                          )}
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded-full bg-[#0d5c63]/10 text-[#0d5c63] text-[10.5px] font-bold">
                              본인
                            </span>
                          )}
                        </p>
                        <p className="text-[12px] text-[#6e6e73]">{m.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[11px] font-bold mr-1.5">
                          {m.loginType}
                        </span>
                        <span>{m.phone}</span>
                      </td>
                      <td className="p-4">
                        <select
                          aria-label={`${m.name} 권한`}
                          value={m.role === 'admin' ? 'admin' : 'member'}
                          disabled={isSelf}
                          onChange={(e) =>
                            updateMemberRole(
                              m.id,
                              e.target.value as 'member' | 'admin'
                            )
                          }
                          className={`h-[34px] px-2.5 rounded-[10px] border font-bold text-[12.5px] disabled:opacity-70 ${
                            m.role === 'admin'
                              ? 'bg-[#0d5c63] text-white border-[#0d5c63]'
                              : 'bg-white text-[#1d1d1f] border-[#d2d2d7]'
                          }`}
                        >
                          <option value="member">일반회원</option>
                          <option value="admin">관리자 (admin)</option>
                        </select>
                      </td>
                      <td className="p-4 font-bold">
                        {formatKRW(m.totalSpent)}{' '}
                        <span className="text-[12px] text-[#6e6e73] font-normal">
                          ({m.orderCount}건)
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          aria-label={`${m.name} 등급`}
                          value={m.grade}
                          onChange={(e) =>
                            updateMemberGradeOrPoints(
                              m.id,
                              e.target.value as MemberGrade,
                              0
                            )
                          }
                          className="h-[34px] px-2.5 rounded-[10px] border border-[#d2d2d7] font-bold"
                        >
                          {GRADES.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 font-extrabold text-[#0d5c63]">
                        {formatKRW(m.points)}
                      </td>
                      <td className="p-4 space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => updateMemberGradeOrPoints(m.id, m.grade, 1000)}
                          className="px-2.5 py-1 rounded-full bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[12px] font-bold cursor-pointer"
                        >
                          +1,000
                        </button>
                        <button
                          type="button"
                          onClick={() => updateMemberGradeOrPoints(m.id, m.grade, 5000)}
                          className="px-2.5 py-1 rounded-full bg-[#1d1d1f] text-white text-[12px] font-bold cursor-pointer"
                        >
                          +5,000
                        </button>
                        <button
                          type="button"
                          onClick={() => updateMemberGradeOrPoints(m.id, m.grade, -1000)}
                          className="px-2.5 py-1 rounded-full border border-[#d2d2d7] text-[12px] font-bold text-[#6e6e73] cursor-pointer"
                        >
                          -1,000
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => setDeleteTarget(m)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-[12px] font-bold transition cursor-pointer"
                          title={isSelf ? '현재 로그인한 관리자 계정은 삭제할 수 없습니다' : '회원 삭제'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-[20px] font-extrabold text-[#1d1d1f]">
                회원 삭제 확인
              </h2>
              <p className="mt-2 text-[14px] text-[#6e6e73] leading-relaxed">
                <strong className="text-[#1d1d1f]">{deleteTarget.name}</strong> ({deleteTarget.email})
                회원을 정말 삭제하시겠습니까?
                <br />
                삭제 시 해당 회원의 프로필과 보유 쿠폰 데이터가 Supabase DB에서 제거됩니다.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-[44px] rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-bold cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleConfirmDelete()}
                className="flex-1 h-[44px] rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-[14px] font-bold cursor-pointer"
              >
                {deleting ? '삭제 중...' : '영구 삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
