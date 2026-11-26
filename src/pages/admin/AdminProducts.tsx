import React, { useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/storeContextValue';
import { GNB_CATEGORIES, PICKER_TABS } from '../../data/seedData';
import type { GnbCategoryId, PickerTabId, PrepType, Product } from '../../types/store';
import { SafeImage } from '../../components/common/BrandAssets';
import { formatKRW } from '../../utils/format';

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Product form
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<GnbCategoryId>('crab');
  const [pickerTab, setPickerTab] = useState<PickerTabId>('대게');
  const [prepType, setPrepType] = useState<PrepType>('둘다');
  const [price, setPrice] = useState(54200);
  const [originalPrice, setOriginalPrice] = useState(60000);
  const [stock, setStock] = useState(30);
  const [origin, setOrigin] = useState('러시아');

  const filtered = products.filter((p) => {
    const mCat = catFilter === 'all' || p.category === catFilter;
    const mSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortName.toLowerCase().includes(search.toLowerCase());
    return mCat && mSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const discountRate =
      originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;
    addProduct({
      name: name.trim(),
      shortName: shortName.trim() || name.trim(),
      subtitle: subtitle.trim() || '당일 직송 신선 수산물',
      category,
      pickerTab,
      prepType,
      price,
      originalPrice,
      discountRate,
      image: '/images/hero-crab-whole.jpg',
      badge: '신상품',
      rating: 5.0,
      reviewCount: 0,
      stock,
      soldOut: stock === 0,
      origin,
      weight: '1kg 내외',
      shippingFee: 4000,
      supportsPrepOption: prepType === '둘다',
      steamingFee: 3000,
      description: subtitle.trim() || '크랩마스터 특A급 수산물',
    });
    setModalOpen(false);
    setName('');
    setShortName('');
    setSubtitle('');
  };

  const handleQuickPriceEdit = (p: Product, nextPrice: number) => {
    const safePrice = Math.max(1000, nextPrice);
    const discountRate =
      p.originalPrice > safePrice
        ? Math.round(((p.originalPrice - safePrice) / p.originalPrice) * 100)
        : 0;
    updateProduct(p.id, { price: safePrice, discountRate });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">상품 · 시세 관리</h1>
          <p className="text-[14px] text-[#6e6e73]">
            가격·품절·재고를 변경하면 회원용 PC 및 모바일 페이지에 즉시 반영됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="h-[44px] px-5 rounded-full bg-[#0d5c63] text-white text-[14px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>신규 상품 등록</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-[18px] bg-white border border-[#d2d2d7]/60 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCatFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer ${
              catFilter === 'all' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7]'
            }`}
          >
            전체 ({products.length})
          </button>
          {GNB_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCatFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer ${
                catFilter === c.id ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-full h-[38px] px-4 w-full sm:w-[260px]">
          <Search className="w-4 h-4 text-[#6e6e73]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="상품명 검색"
            className="bg-transparent text-[13.5px] outline-none flex-1"
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-[20px] bg-white border border-[#d2d2d7]/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-[#f5f5f7] text-left text-[#6e6e73]">
              <tr>
                <th className="p-4">상품</th>
                <th className="p-4">분류</th>
                <th className="p-4">당일 시세(판매가)</th>
                <th className="p-4">할인율</th>
                <th className="p-4">재고</th>
                <th className="p-4">품절 상태</th>
                <th className="p-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#f5f5f7]/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={p.image}
                        alt={p.shortName}
                        className="w-12 h-12 rounded-[10px] object-cover bg-[#f5f5f7] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#1d1d1f] truncate max-w-[260px]">
                          {p.name}
                        </p>
                        <p className="text-[12px] text-[#6e6e73]">
                          #{p.productNo} · {p.origin}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold">{p.pickerTab}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        id={`price-${p.id}`}
                        name={`price-${p.id}`}
                        aria-label={`${p.shortName} 당일 시세`}
                        type="number"
                        step={500}
                        value={p.price}
                        onChange={(e) => handleQuickPriceEdit(p, Number(e.target.value))}
                        className="w-[105px] h-[34px] px-2.5 rounded-[8px] border border-[#d2d2d7] font-bold text-[#1d1d1f]"
                      />
                      <span className="text-[12px] text-[#6e6e73]">원</span>
                    </div>
                    <p className="text-[11px] text-[#6e6e73] mt-0.5">
                      정가 {formatKRW(p.originalPrice)}
                    </p>
                  </td>
                  <td className="p-4 font-extrabold text-[#e05a47]">{p.discountRate}%</td>
                  <td className="p-4">
                    <input
                      id={`stock-${p.id}`}
                      name={`stock-${p.id}`}
                      aria-label={`${p.shortName} 재고 수량`}
                      type="number"
                      min={0}
                      value={p.stock}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        updateProduct(p.id, { stock: val, soldOut: val === 0 });
                      }}
                      className="w-[70px] h-[34px] px-2.5 rounded-[8px] border border-[#d2d2d7] font-bold"
                    />
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => updateProduct(p.id, { soldOut: !p.soldOut })}
                      className={`px-3 py-1 rounded-full text-[12px] font-bold cursor-pointer ${
                        p.soldOut
                          ? 'bg-[#0d5c63] text-white'
                          : 'bg-[#f5f5f7] text-[#1d1d1f]'
                      }`}
                    >
                      {p.soldOut ? '품절됨' : '판매중'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => deleteProduct(p.id)}
                      className="p-2 rounded-full hover:bg-[#f5f5f7] text-[#6e6e73] hover:text-[#0d5c63] cursor-pointer"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="w-full max-w-[500px] rounded-[24px] bg-white p-6 sm:p-7 space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f5f5f7] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-[20px] font-extrabold">신규 상품 등록</h2>

            <div className="space-y-3 text-[13.5px]">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="전체 상품명 (예: 러시아 활 블루 킹크랩 2.5kg)"
                className="w-full h-[42px] px-3.5 rounded-[12px] bg-[#f5f5f7] outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="요약 상품명"
                  className="h-[42px] px-3.5 rounded-[12px] bg-[#f5f5f7] outline-none"
                />
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="원산지"
                  className="h-[42px] px-3.5 rounded-[12px] bg-[#f5f5f7] outline-none"
                />
              </div>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="한 줄 설명"
                className="w-full h-[42px] px-3.5 rounded-[12px] bg-[#f5f5f7] outline-none"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GnbCategoryId)}
                  className="h-[42px] px-2 rounded-[12px] bg-[#f5f5f7]"
                >
                  {GNB_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <select
                  value={pickerTab}
                  onChange={(e) => setPickerTab(e.target.value as PickerTabId)}
                  className="h-[42px] px-2 rounded-[12px] bg-[#f5f5f7]"
                >
                  {PICKER_TABS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={prepType}
                  onChange={(e) => setPrepType(e.target.value as PrepType)}
                  className="h-[42px] px-2 rounded-[12px] bg-[#f5f5f7]"
                >
                  <option value="둘다">활/자숙 선택</option>
                  <option value="활">활</option>
                  <option value="자숙">자숙</option>
                  <option value="일반">일반</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#6e6e73]">판매가</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full h-[40px] px-3 rounded-[10px] bg-[#f5f5f7]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6e6e73]">정가</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full h-[40px] px-3 rounded-[10px] bg-[#f5f5f7]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6e6e73]">초기 재고</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full h-[40px] px-3 rounded-[10px] bg-[#f5f5f7]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[46px] rounded-full bg-[#0d5c63] text-white font-bold cursor-pointer"
            >
              상품 등록 완료
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
