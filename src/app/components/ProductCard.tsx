import { Plus } from 'lucide-react';

interface ProductCardProps {
  name: string;
  price: number;
  onAdd: () => void;
}

export function ProductCard({ name, price, onAdd }: ProductCardProps) {
  return (
    <button
      onClick={onAdd}
      className="group min-h-[102px] rounded-2xl border border-[#d9dee7] bg-white px-4 py-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#d4a017]/60 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="text-[1.05rem] font-semibold tracking-[-0.01em] text-[#232833]">{name}</div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f4f7] transition-colors group-hover:bg-[#d4a017]">
          <Plus className="h-4 w-4 text-[#6b7280] group-hover:text-white" />
        </div>
      </div>
      <div className="text-[1.15rem] font-bold text-[#1f2937]">{price.toFixed(2)} ₺</div>
    </button>
  );
}
