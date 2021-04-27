import { Box, Center, Icon, Spinner, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { useParams } from 'react-router';
import { Card } from '../../components/Card';
import Layout from '../../components/Layout';
import { useAuth } from '../../services/Auth';
import { isError } from '../../services/fetch';
import * as api from './../../services/api';
import ReviewsCard from './ReviewsCard';

const ReviewsPendingPage = () => {
  const { data, error, status } = useQuery(`reviews_pending`, () => api.pendingReviews());

  if (error) {
    return (
      <Layout>
        <Box maxW="sm" mx="auto">
          <Card>
            <Stack>
              <Stack direction="row" align="center">
                <Text fontWeight="bold" fontSize="xl">
                  Error
                </Text>{' '}
                <Icon as={FaExclamationTriangle} color="yellow.400" />
              </Stack>
              <Text color="gray.700">
                {isError(error) ? error.message : 'Error while fetching for this restaurant. Try again later.'}
              </Text>
            </Stack>
          </Card>
        </Box>
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
