import { useDisclosure } from '@chakra-ui/hooks';
import { Stack } from '@chakra-ui/layout';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from '@chakra-ui/react';
import { chakra, ChakraProps } from '@chakra-ui/system';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import * as api from '../../services/api';
import queryClient from '../../services/queryClient';
import ReviewsStars from './ReviewsStars';

type Props = {
  children: React.ReactNode;
  review: api.Review;
} & ChakraProps;

const ReviewsEditModal = (props: Props) => {
  const { isOpen, onClose: onCloseModal, getButtonProps } = useDisclosure();
  const initialRef = React.useRef<HTMLTextAreaElement>(null);

  const [rating, setRating] = useState<number>(0);
  const [visit_at, setVisitAt] = useState<string>('');
  const [message, setMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState<string | null>(null);

  const review = props.review;
  const lastOpenedReviewId = useRef<string | null>(null);
  useEffect(() => {
    if (isOpen && lastOpenedReviewId.current !== review.id) {
      lastOpenedReviewId.current = review.id;
      setRating(review.rating);
      setVisitAt(review.visit_at.split('T')[0]);
      setMessage(review.message);
      setReplyMessage(review.reply?.message ?? null);
    }
  }, [isOpen, review]);

  function onClose() {
    lastOpenedReviewId.current = null;
    setRating(0);
    setVisitAt('');
    setMessage('');
    setReplyMessage(null);
    onCloseModal();
  }

  const { mutate: updateReviews, status } = useMutation(
    (data: Parameters<typeof api.editReview>[1]) => api.editReview(props.review.id, data),
    {
      onSuccess: () => {
        queryClient.refetchQueries('reviews');
        onClose();
      },
    },
  );

  return (
    <>
      <chakra.div {...getButtonProps()}>{props.children}</chakra.div>
      <Modal closeOnOverlayClick={false} initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <chakra.form
            onSubmit={(e) => {
              e.preventDefault();
              updateReviews({ rating, message, visit_at, replyMessage });
            }}
          >
            <ModalHeader>Update Review</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing="6">
                <FormControl id="message">
                  <FormLabel>Message</FormLabel>
                  <Textarea onChange={(e) => setMessage(e.target.value)} value={message} />
                </FormControl>
                <FormControl id="rating">
                  <FormLabel>Rating</FormLabel>
                  <ReviewsStars value={rating} onChange={(rating) => setRating(rating)} />
                </FormControl>
                <FormControl id="visit_at">
                  <FormLabel>Visit Date</FormLabel>
                  <Input type="date" value={visit_at} onChange={(e) => setVisitAt(e.target.value)} />
                </FormControl>
                <FormControl id="message">
                  <FormLabel>Reply Message</FormLabel>
                  <Textarea onChange={(e) => setReplyMessage(e.target.value || null)} value={replyMessage ?? ''} />
                  <FormHelperText>Leave blank to delete the reply.</FormHelperText>
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <ButtonGroup>
                <Button colorScheme="blue" type="submit" isLoading={status === 'loading'}>
                  Save
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ButtonGroup>
            </ModalFooter>
          </chakra.form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReviewsEditModal;
