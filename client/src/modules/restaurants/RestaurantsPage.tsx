import { Box, LinkOverlay, Stack, Stat, StatHelpText, StatLabel, StatNumber, Text } from '@chakra-ui/react';
import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import ReviewsStars from '../reviews/ReviewsStars';
import * as api from './../../services/api';
import Layout from '../../components/Layout';

const RestaurantsPage = () => {
  const { data } = useQuery('restaurants.list', api.restaurants);

  return (
    <Layout>
      <Stack>
        {data?.restaurants.map((item) => (
          <Link key={item.id} to={`/restaurants/${item.id}`}>
            <Card>
              <Text fontWeight="bold">{item.name}</Text>
              <Stack direction="row" align="center">
                <ReviewsStars value={item.reviews_rating_avg} fontSize="sm" />
                <Text color="gray.600" fontSize="sm">
                  {item.reviews_rating_count} reviews
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
