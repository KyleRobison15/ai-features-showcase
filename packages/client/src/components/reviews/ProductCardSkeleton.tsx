import Skeleton from 'react-loading-skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="relative flex flex-col min-h-42 border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Image placeholder skeleton */}
      <div className="h-32">
        <Skeleton height={128} />
      </div>

      {/* Content skeleton */}
      <div className="p-5 flex flex-col grow">
        {/* Product name skeleton */}
        <div className="mb-4">
          <Skeleton height={24} width="80%" />
        </div>

        {/* Price and action text skeleton */}
        <div className="flex flex-col gap-3 mt-auto">
          <Skeleton height={32} width="60%" />
          <Skeleton height={16} width="50%" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
