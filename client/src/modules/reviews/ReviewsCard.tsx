import { Box, Stack, Text } from '@chakra-ui/layout';
import React from 'react';
import { Card } from '../../components/Card';
import { Review } from './../../services/api';
import ReviewsStars from './ReviewsStars';

type Props = {
  item: Review;
};
const ReviewsCard = (props: Props) => {
  return (
    <Card px={5} py={3}>
      <Stack spacing={1}>
        <Text as="cite" fontWeight="500" fontStyle="normal">
          {props.item.user.username}
        </Text>
        <Text fontSize={'md'} fontWeight="normal">
          {props.item.message}
        </Text>
        <Stack spacing={0}>
          <Stack direction="row" align="center">
            <ReviewsStars value={props.item.rating} fontSize="sm" />
            <Text color="gray.500" fontSize="sm">
              {props.item.rating} star{props.item.rating !== 1 && 's'}
            </Text>
          </Stack>
          <Text fontSize="sm" color="gray.500">
            Visited on {new Date(props.item.visit_at).toLocaleDateString()}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ReviewsCard;
