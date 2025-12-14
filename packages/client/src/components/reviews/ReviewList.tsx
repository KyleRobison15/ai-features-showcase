/* eslint-disable react-hooks/set-state-in-effect */
import axios from 'axios';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import StarRating from './StarRating';

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

const ReviewList = ({ productId }: Props) => {
  const [reviewData, setReviewData] = useState<GetReviewsResponse>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    const { data } = await axios.get<GetReviewsResponse>(
      `/api/products/${productId}/reviews`
    );
    setReviewData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((p) => (
          <div key={p}>
            <Skeleton width={100} />
            <Skeleton width={125} />
            <Skeleton count={2} />
          </div>
        ))}
      </div>
    );
  }

  return (
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
  );
};

export default ReviewList;
