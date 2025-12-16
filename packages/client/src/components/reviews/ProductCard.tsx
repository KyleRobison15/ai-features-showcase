import type { Product } from './reviewsApi';

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const { name, price } = product;

  return (
    <div className="group relative flex flex-col min-h-42 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gray-100 dark:bg-gray-800">
      {/* Content */}
      <div className="p-5 flex flex-col grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {name}
        </h3>
        <div className="flex flex-col gap-3 mt-auto">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${Math.round(price).toLocaleString()}
          </span>
          <a
            href="#"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            Customer Reviews
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
