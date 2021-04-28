import { Button } from '@chakra-ui/button';
import { Stack, Text } from '@chakra-ui/layout';
import React from 'react';
import { Card } from '../../components/Card';
import { useAuth } from '../../services/Auth';
import { Review } from './../../services/api';
import ReviewReply from './ReviewReply';
import ReviewsStars from './ReviewsStars';

type Props = {
  item: Review;
  canReply?: boolean;
  showReply?: boolean;
};
const ReviewsCard = (props: Props) => {
  const { user } = useAuth();

  return (
    <Card px={5} py={3}>
      <Stack spacing={1}>
        <Text
          as="cite"
          fontWeight="500"
          fontStyle="normal"
          color={user?.id === props.item.user.id ? 'blue.600' : 'inherit'}
        >
          {props.item.user.name}
        </Text>
        <Text fontSize={'md'} fontWeight="normal" whiteSpace="pre-wrap">
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
            Visited on {new Date(props.item.visit_at).toISOString().split('T')[0]}
          </Text>
        </Stack>
      </Stack>

      {props.showReply && props.item.reply && (
        <Stack p={2} pl={5} pt={3} spacing={1} borderLeft={'3px solid transparent'} borderLeftColor="gray.200">
          <Text whiteSpace="pre-line" fontSize="sm">
            {props.item.reply?.message}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Answered by the owner on {new Date(props.item.created_at).toISOString().split('T')[0]}
          </Text>
        </Stack>
      )}
      {!props.item.reply && props.canReply && (
        <ReviewReply reviewId={props.item.id}>
          <Button size="sm" variant="link">
            Reply
          </Button>
        </ReviewReply>
      )}
    </Card>
  );
};

export default ReviewsCard;
