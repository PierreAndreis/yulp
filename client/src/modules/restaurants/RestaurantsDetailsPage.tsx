import { Box, Button, Center, GridItem, Heading, Icon, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { FaChevronLeft, FaExclamationTriangle } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { useParams } from 'react-router';
import { Card } from '../../components/Card';
import { isError } from '../../services/fetch';
import ReviewsStars from '../reviews/ReviewsStars';
import * as api from './../../services/api';
import Layout from '../../components/Layout';
import { Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup } from '@chakra-ui/react';
import ReviewsCard from '../reviews/ReviewsCard';
import { Link } from 'react-router-dom';

const RestaurantsDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, error, status } = useQuery(`restaurants.${id}`, () => api.restaurantsDetails(id));

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

  const amount_of_reviews = data.reviews.length;

  const average_review =
    amount_of_reviews > 0
      ? data.reviews.reduce((sum, review) => {
          return sum + review.rating;
        }, 0) / amount_of_reviews
      : 0;

  const highest_rated_review = data.reviews.reduce<typeof data.reviews[0] | null>((highestReview, review) => {
    if (!highestReview) return review;
    return Math.max(highestReview.rating, review.rating) ? review : highestReview;
  }, null);

  const lowest_rated_review = data.reviews.reduce<typeof data.reviews[0] | null>((lowestReview, review) => {
    if (!lowestReview) return review;
    return Math.min(lowestReview.rating, review.rating) ? review : lowestReview;
  }, null);

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
            <Button colorScheme="blue" size="md">
              Leave a review
            </Button>
          </Stack>
          <Stack direction="row" align="center">
            <ReviewsStars value={average_review} fontSize="lg" />
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

                <ReviewsCard item={highest_rated_review} />
              </Stack>
            </GridItem>
          )}
          {lowest_rated_review && (
            <GridItem>
              <Stack>
                <Text fontWeight="bold">Lowest Rated Review</Text>

                <ReviewsCard item={lowest_rated_review} />
              </Stack>
            </GridItem>
          )}
        </SimpleGrid>
        <Text fontWeight="bold">Latest Reviews</Text>
        {data.reviews.length > 0 ? (
          <SimpleGrid minChildWidth={120}>
            {data.reviews.map((review) => (
              <ReviewsCard key={review.id} item={review} />
            ))}
          </SimpleGrid>
        ) : (
          <Text color="gray.700">This restaurant has no reviews yet. Be the first one!</Text>
        )}
      </Stack>
    </Layout>
  );
};

export default RestaurantsDetailsPage;
