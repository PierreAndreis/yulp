import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { useQuery } from 'react-query';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import { useAuth } from '../../services/Auth';
import { isError } from '../../services/fetch';
import * as api from './../../services/api';
import ReviewsCard from './ReviewsCard';

const ReviewsPendingPage = () => {
  const { data, error, status } = useQuery(['reviews', 'reviews.pending'], () =>
    api.reviews({ replied: false, showOnlyOwned: true }),
  );

  const { user } = useAuth();

  if (user?.role === 'USER') {
    return (
      <Layout>
        <ErrorComponent message="You don't have enough permission to see this page." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorComponent message={isError(error) ? error.message : null} />
      </Layout>
    );
  }

  if ((!data && status === 'loading') || !data) {
    return (
      <Layout>
        <Center>
          <Spinner />
        </Center>
      </Layout>
    );
  }

  return (
    <Layout>
      <Stack spacing={2}>
        {data.reviews.map((review) => (
          <ReviewsCard key={review.id} item={review} canReply showReply />
        ))}
        {data.reviews.length === 0 && <Text color="gray.600">There are no reviews pending reply. Keep it up!</Text>}
      </Stack>
    </Layout>
  );
};

export default ReviewsPendingPage;
