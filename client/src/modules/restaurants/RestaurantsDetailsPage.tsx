import { Button, Center, GridItem, Heading, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import { useAuth } from '../../services/Auth';
import { isError } from '../../services/fetch';
import ReviewsCreateModal from '../reviews/ReviewCreateModal';
import ReviewsCard from '../reviews/ReviewsCard';
import ReviewsStars from '../reviews/ReviewsStars';
import * as api from './../../services/api';

const RestaurantsDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { user } = useAuth();

  const { data, error, status } = useQuery(['restaurants', `restaurants.${id}`], () => api.restaurantsDetails(id));

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

  const amount_of_reviews = data.reviews.length;

  const average_review =
    amount_of_reviews > 0
      ? (
          data.reviews.reduce((sum, review) => {
            return sum + review.rating;
          }, 0) / amount_of_reviews
        ).toFixed(1)
      : 0;

  const highest_rated_review = data.reviews.reduce<typeof data.reviews[0] | null>((highestReview, review) => {
    if (!highestReview) return review;
    return review.rating > highestReview.rating ? review : highestReview;
  }, null);

  const lowest_rated_review = data.reviews.reduce<typeof data.reviews[0] | null>((lowestReview, review) => {
    if (!lowestReview) return review;
    return review.rating < lowestReview.rating ? review : lowestReview;
  }, null);

  const has_user_reviewed = data.reviews.find((review) => review.user.id === user?.id);
  const is_restaurant_owner = data.owner_user_id === user?.id;

  return (
    <Layout>
      <Stack spacing={5}>
        <Stack>
          <Link to="/">
            <Button size="sm" variant="ghost" leftIcon={<FaChevronLeft />} py={2} px={1} colorScheme="blue">
              Back to list
            </Button>
          </Link>
          <Stack direction="row" justify="space-between" align="center" w="100%">
            <Heading>{data.name}</Heading>
            {!has_user_reviewed && !is_restaurant_owner && (
              <ReviewsCreateModal restaurantId={data.id}>
                <Button colorScheme="blue" size="md">
                  Leave a review
                </Button>
              </ReviewsCreateModal>
            )}
          </Stack>
          <Stack direction="row" align="center">
            <ReviewsStars value={Number(average_review)} fontSize="lg" />
            <Text color="gray.600" fontSize="lg">
              {average_review} · {amount_of_reviews} review{amount_of_reviews !== 1 && 's'}
            </Text>
          </Stack>
        </Stack>
        <SimpleGrid columns={2} gap={5}>
          {highest_rated_review && (
            <GridItem>
              <Stack>
                <Text fontWeight="bold">Highest Rated Review</Text>

                <ReviewsCard item={highest_rated_review} canReply={is_restaurant_owner} />
              </Stack>
            </GridItem>
          )}
          {lowest_rated_review && (
            <GridItem>
              <Stack>
                <Text fontWeight="bold">Lowest Rated Review</Text>

                <ReviewsCard item={lowest_rated_review} canReply={is_restaurant_owner} />
              </Stack>
            </GridItem>
          )}
        </SimpleGrid>
        <Text fontWeight="bold">Latest Reviews</Text>
        {data.reviews.length > 0 ? (
          data.reviews.map((review) => (
            <ReviewsCard key={review.id} item={review} canReply={is_restaurant_owner} showReply />
          ))
        ) : (
          <Text color="gray.700">
            This restaurant has no reviews yet. {user?.role === 'USER' && 'Be the first one!'}
          </Text>
        )}
      </Stack>
    </Layout>
  );
};

export default RestaurantsDetailsPage;
