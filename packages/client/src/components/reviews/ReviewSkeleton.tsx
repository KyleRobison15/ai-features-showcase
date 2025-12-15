import Skeleton from 'react-loading-skeleton';

const ReviewSkeleton = () => {
  return (
    <div>
      <Skeleton width={100} />
      <Skeleton width={125} />
      <Skeleton count={2} />
    </div>
  );
};

export default ReviewSkeleton;
