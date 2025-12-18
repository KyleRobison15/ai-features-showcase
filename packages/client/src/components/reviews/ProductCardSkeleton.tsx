const ProductCardSkeleton = () => {
  return (
    <div className="relative flex flex-col min-h-42 border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Image placeholder skeleton */}
      <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 animate-pulse" />

      {/* Content skeleton */}
      <div className="p-5 flex flex-col grow">
        {/* Product name skeleton - two lines */}
        <div className="mb-4 space-y-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse" />
        </div>

        {/* Price and action text skeleton */}
        <div className="flex flex-col gap-3 mt-auto w-64">
          {/* Price skeleton */}
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse" />
          {/* Action text skeleton */}
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
