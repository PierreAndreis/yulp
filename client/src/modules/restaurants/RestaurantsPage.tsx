import { Box, Button, Stack, Text } from '@chakra-ui/react';
import React from 'react';
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
  const { data } = useQuery('restaurants.list', api.restaurants);

  return (
    <Layout>
      <Stack>
        {user.role === 'OWNER' && (
          <RestaurantsCreateModal>
            <Button>Create Restaurant</Button>
          </RestaurantsCreateModal>
        )}
      </Stack>
      <Stack>
        {data?.restaurants.map((item) => (
          <Link key={item.id} to={`/restaurants/${item.id}`}>
            <Card>
              <Text fontWeight="bold">{item.name}</Text>
              <Stack direction="row" align="center">
                <ReviewsStars value={item.reviews_rating_avg} fontSize="sm" />
                <Text color="gray.600" fontSize="sm">
                  {item.reviews_rating_count} review{item.reviews_rating_count !== 1 && 's'}
                </Text>
              </Stack>
            </Card>
          </Link>
        ))}
      </Stack>
    </Layout>
  );
};

export default RestaurantsPage;
