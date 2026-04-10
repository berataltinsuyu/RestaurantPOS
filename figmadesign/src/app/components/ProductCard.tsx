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
      className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-[#d4a017] hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-sm text-gray-900">{name}</div>
        <div className="w-7 h-7 bg-gray-100 group-hover:bg-[#d4a017] rounded-full flex items-center justify-center transition-colors">
          <Plus className="w-4 h-4 text-gray-600 group-hover:text-white" />
        </div>
      </div>
      <div className="text-base font-semibold text-gray-900">{price.toFixed(2)} ₺</div>
    </button>
  );
}
