import type { Product } from './reviewsApi';
import { HiShoppingBag } from 'react-icons/hi2';

type Props = {
  product: Product;
  isSelected: boolean;
  onClick: () => void;
};

const ProductCard = ({ product, isSelected, onClick }: Props) => {
  const { name, price } = product;

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col min-h-42 border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
      }`}
    >
      {/* Image placeholder */}
      <div className="h-48 bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
        <HiShoppingBag className="w-16 h-16 text-blue-400 dark:text-blue-600" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col grow">
        <h3
          className={`text-lg font-semibold mb-4 transition-colors ${
            isSelected
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
          }`}
        >
          {name}
        </h3>
        <div className="flex flex-col gap-3 mt-auto">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${Math.round(price).toLocaleString()}
          </span>
          <span
            className={`text-sm transition-colors ${
              isSelected
                ? 'text-blue-700 dark:text-blue-300 font-medium'
                : 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
            }`}
          >
            {isSelected ? 'Viewing Reviews' : 'View Reviews'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
