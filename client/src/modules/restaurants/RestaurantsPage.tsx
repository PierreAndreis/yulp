import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import Layout from '../../components/Layout';
import { useAuth } from '../../services/Auth';
import ReviewsStars from '../reviews/ReviewsStars';
import * as api from './../../services/api';
import RestaurantsCreateModal from './RestaurantsCreateModal';

const RestaurantsPage = () => {
  const { user } = useAuth();
  const [ratingLeast, setRatingLeast] = useState(0);
  const { data, status } = useQuery(`restaurants.list.ratingLeast[${ratingLeast}]`, () =>
    api.restaurants({
      ratingLeast,
    }),
  );
  const { data: reviews_pending } = useQuery(`reviews_pending`, api.pendingReviews, {
    enabled: user.role === 'OWNER',
  });

  const reviewsPendingReplyCount = reviews_pending?.reviews.length ?? 0;

  return (
    <Layout>
      {user.role === 'OWNER' && (
        <Flex align="flex-end" justify="flex-end" mb={3}>
          <RestaurantsCreateModal>
            <Button colorScheme="blue" marginLeft="auto">
              Add your restaurant
            </Button>
          </RestaurantsCreateModal>
        </Flex>
      )}

      {user.role === 'OWNER' && reviewsPendingReplyCount > 0 && (
        <Link to="/reviews-pending">
          <Alert status="info" variant="left-accent" mb={3}>
            <AlertIcon />
            You have {reviewsPendingReplyCount} review{reviewsPendingReplyCount ? 's' : null} waiting for your reply.{' '}
            <Button variant="link" colorScheme="blue" mx={1}>
              See more
            </Button>
          </Alert>
        </Link>
      )}
      <Stack direction="row" spacing={10} mt={10}>
        <FormControl id="rating-least" w={120}>
          <FormLabel>Rating at least</FormLabel>
          <RadioGroup name="rating-least" value={ratingLeast} onChange={(value) => setRatingLeast(Number(value))}>
            <Stack direction="column">
              {[5, 4, 3, 2, 1, 0].map((value) => (
                <Radio key={value} value={value} align="baseline" aria-label={`${value} rating and up`}>
                  <ReviewsStars value={value} />
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
        <Stack flexGrow={1} flexShrink={0}>
          {data?.restaurants.map((item) => (
            <Link key={item.id} to={`/restaurants/${item.id}`}>
              <Card>
                <Text fontWeight="bold">{item.name}</Text>
                <Stack direction="row" align="center">
                  <ReviewsStars value={item.reviews_rating_avg} fontSize="sm" />

                  <Text color="gray.600" fontSize="sm">
                    {item.reviews_rating_avg.toFixed(1)} ·
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    {item.reviews_rating_count} review{item.reviews_rating_count !== 1 && 's'}
                  </Text>
                </Stack>
              </Card>
            </Link>
          ))}
          {status !== 'loading' && data?.restaurants.length === 0 && (
            <Text color="gray.700">No restaurant found matching your criteria.</Text>
          )}
          {status === 'loading' && <Spinner />}
        </Stack>
      </Stack>
    </Layout>
  );
};

export default RestaurantsPage;
