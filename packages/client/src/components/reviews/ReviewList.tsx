import { useState, useRef, useEffect } from 'react';
import StarRating from './StarRating';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { HiSparkles } from 'react-icons/hi2';
import ReviewSkeleton from './ReviewSkeleton';
import {
  type SummarizeResponse,
  type GetReviewsResponse,
  reviewsApi,
  type Product,
} from './reviewsApi';
import ProductCard from './ProductCard';

type Props = {
  productId: number;
};

const ReviewList = ({ productId }: Props) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProduct && reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedProduct]);

  const productsQuery = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => reviewsApi.fetchProducts(),
  });

  // The useMutation hook from tanstack is for CREATING/UPDATING data and allows us to
  const summaryMutation = useMutation<SummarizeResponse>({
    // The mutationFn property is the function that tanstack will use to mutate/update data
    mutationFn: () =>
      reviewsApi.summarizeReviews(selectedProduct?.id || productId),
  });

  // The useQuery hook from tanstack is for GETTING data and allows us to:
  // 1. Easily manage our state variables
  // 2. Cache results to avoid unecessary API calls
  // 3. Automatically handle retries when there is an error calling the API
  const reviewsQuery = useQuery<GetReviewsResponse>({
    // The queryKey property is what tanstack uses to lookup data in its built in cache
    // With this setup, the unique combo of reviews and productId will be used for looking up data in the cache
    queryKey: ['reviews', selectedProduct?.id || productId],

    // The queryFn property is the function that tanstack will use to retrieve the data from the backend when it needs to
    queryFn: () => reviewsApi.fetchReviews(selectedProduct?.id || productId),
    enabled: !!selectedProduct,
  });

  const currentSummary =
    reviewsQuery.data?.summary || summaryMutation.data?.summary;

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Our Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsQuery.data?.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isSelected={selectedProduct?.id === p.id}
              onClick={() => setSelectedProduct(p)}
            />
          ))}
        </div>
      </div>

      <div ref={reviewsSectionRef}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {selectedProduct
            ? `${selectedProduct.name} Reviews`
            : 'Customer Reviews'}
        </h2>

        {selectedProduct ? (
          <>
            {reviewsQuery.isLoading ? (
              <div className="flex flex-col gap-5">
                {[1, 2, 3].map((p) => (
                  <ReviewSkeleton key={p} />
                ))}
              </div>
            ) : reviewsQuery.isError ? (
              <p className="text-red-500">
                Could not fetch reviews. Try again.
              </p>
            ) : reviewsQuery.data?.reviews.length ? (
              <>
                <div className="mb-8">
                  {currentSummary ? (
                    <div className="bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <HiSparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                          AI Summary
                        </h3>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {currentSummary}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Button
                        onClick={() => summaryMutation.mutate()}
                        className="cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-md px-6 py-3 text-base"
                        disabled={summaryMutation.isPending}
                      >
                        <HiSparkles className="w-5 h-5" />
                        Summarize with AI
                      </Button>
                      {summaryMutation.isPending && (
                        <div className="py-3">
                          <ReviewSkeleton />
                        </div>
                      )}
                      {summaryMutation.isError && (
                        <p className="text-red-500">
                          {'Could not summarize the reviews. Try again.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  {reviewsQuery.data?.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {review.author}
                          </div>
                          <div className="mt-1">
                            <StarRating value={review.rating} />
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No reviews available for this product.
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Select a product above to see the reviews.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
