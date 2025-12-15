/* eslint-disable react-hooks/set-state-in-effect */
import axios from 'axios';
import StarRating from './StarRating';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { HiSparkles } from 'react-icons/hi2';
import ReviewSkeleton from './ReviewSkeleton';

type Props = {
  productId: number;
};

type Review = {
  id: number;
  author: string;
  content: string;
  rating: number;
  createdAt: string;
};

type GetReviewsResponse = {
  summary: string | null;
  reviews: Review[];
};

type SummarizeResponse = {
  summary: string;
};

const ReviewList = ({ productId }: Props) => {
  // The useMutation hook from tanstack is for CREATING/UPDATING data and allows us to:

  const {
    mutate: handleSummarize,
    isPending: isSummaryLoading,
    isError: isSummaryError,
    data: summarizeResponse,
  } = useMutation<SummarizeResponse>({
    // The mutationFn property is the function that tanstack will use to mutate/update data
    mutationFn: () => summarizeReviews(),
  });

  // The useQuery hook from tanstack is for GETTING data and allows us to:
  // 1. Easily manage our state variables
  // 2. Cache results to avoid unecessary API calls
  // 3. Automatically handle retries when there is an error calling the API
  const {
    data: reviewData,
    error,
    isLoading,
  } = useQuery<GetReviewsResponse>({
    // The queryKey property is what tanstack uses to lookup data in its built in cache
    // With this setup, the unique combo of reviews and productId will be used for looking up data in the cache
    queryKey: ['reviews', productId],

    // The queryFn property is the function that tanstack will use to retrieve the data from the backend when it needs to
    queryFn: () => fetchReviews(),
  });

  const summarizeReviews = async () => {
    const { data } = await axios.post<SummarizeResponse>(
      `/api/products/${productId}/reviews/summarize`
    );
    return data;
  };

  const fetchReviews = async () => {
    const { data } = await axios.get<GetReviewsResponse>(
      `/api/products/${productId}/reviews`
    );
    return data;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((p) => (
          <ReviewSkeleton key={p} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Could not fetch reviews. Try again.</p>;
  }

  if (!reviewData?.reviews.length) {
    return null;
  }

  const currentSummary = reviewData.summary || summarizeResponse?.summary;

  return (
    <div>
      <div className="mb-5">
        {currentSummary ? (
          <p>{currentSummary}</p>
        ) : (
          <div>
            <Button
              onClick={() => handleSummarize()}
              className="cursor-pointer"
              disabled={isSummaryLoading}
            >
              <HiSparkles />
              Summarize with AI
            </Button>
            {isSummaryLoading && (
              <div className="py-3">
                <ReviewSkeleton />
              </div>
            )}
            {isSummaryError && (
              <p className="text-red-500">
                {'Could not summarize the reviews. Try again.'}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5">
        {reviewData?.reviews.map((review) => (
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
