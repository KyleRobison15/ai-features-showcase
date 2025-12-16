/* eslint-disable react-hooks/set-state-in-effect */
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
  const productsQuery = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => reviewsApi.fetchProducts(),
  });

  // The useMutation hook from tanstack is for CREATING/UPDATING data and allows us to
  const summaryMutation = useMutation<SummarizeResponse>({
    // The mutationFn property is the function that tanstack will use to mutate/update data
    mutationFn: () => reviewsApi.summarizeReviews(productId),
  });

  // The useQuery hook from tanstack is for GETTING data and allows us to:
  // 1. Easily manage our state variables
  // 2. Cache results to avoid unecessary API calls
  // 3. Automatically handle retries when there is an error calling the API
  const reviewsQuery = useQuery<GetReviewsResponse>({
    // The queryKey property is what tanstack uses to lookup data in its built in cache
    // With this setup, the unique combo of reviews and productId will be used for looking up data in the cache
    queryKey: ['reviews', productId],

    // The queryFn property is the function that tanstack will use to retrieve the data from the backend when it needs to
    queryFn: () => reviewsApi.fetchReviews(productId),
  });

  if (reviewsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((p) => (
          <ReviewSkeleton key={p} />
        ))}
      </div>
    );
  }

  if (reviewsQuery.isError) {
    return <p className="text-red-500">Could not fetch reviews. Try again.</p>;
  }

  if (!reviewsQuery.data?.reviews.length) {
    return null;
  }

  const currentSummary =
    reviewsQuery.data.summary || summaryMutation.data?.summary;

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Our Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsQuery.data?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Customer Reviews
      </h2>
      <div className="mb-5">
        {currentSummary ? (
          <p>{currentSummary}</p>
        ) : (
          <div>
            <Button
              onClick={() => summaryMutation.mutate()}
              className="cursor-pointer"
              disabled={summaryMutation.isPending}
            >
              <HiSparkles />
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
      <div className="flex flex-col gap-5">
        {reviewsQuery.data?.reviews.map((review) => (
          <div key={review.id}>
            <div className="font-semibold">{review.author}</div>
            <div>
              <StarRating value={review.rating} />
            </div>
            <p className="py-2">{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
