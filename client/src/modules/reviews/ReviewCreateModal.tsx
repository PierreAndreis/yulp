import { useDisclosure } from '@chakra-ui/hooks';
import { Box, Stack, Text } from '@chakra-ui/layout';
import { chakra, ChakraComponent, ChakraProps } from '@chakra-ui/system';
import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Review } from './../../services/api';
import ReviewsStars from './ReviewsStars';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  ButtonGroup,
  Textarea,
  FormHelperText,
} from '@chakra-ui/react';
import { useMutation } from 'react-query';
import * as api from '../../services/api';
import queryClient from '../../services/queryClient';

type Props = {
  children: React.ReactNode;
  restaurantId: string;
} & ChakraProps;
const ReviewsCreateModal = (props: Props) => {
  const { isOpen, onClose: onCloseModal, getButtonProps } = useDisclosure();
  const initialRef = React.useRef<HTMLTextAreaElement>(null);

  const [message, setMessage] = useState('');
  const [visit_at, setVisitAt] = useState('');
  const [rating, setRating] = useState(5);

  function onClose() {
    setMessage('');
    setVisitAt('');
    setRating(5);
    onCloseModal();
  }

  const { mutate: sendReview, status } = useMutation(
    (data: Parameters<typeof api.createReview>[1]) => api.createReview(props.restaurantId, data),
    {
      onSuccess: () => {
        queryClient.refetchQueries({ queryKey: `restaurants.${props.restaurantId}` });
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendReview({ message, rating, visit_at });
            }}
          >
            <ModalHeader>Leave a Review</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    ref={initialRef}
                    placeholder="Your review..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    maxLength={255}
                  />
                  <FormHelperText>Max characters: 255</FormHelperText>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Rating</FormLabel>
                  <ReviewsStars fontSize="2xl" onChange={(value) => setRating(value)} value={rating} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Date of last visit</FormLabel>
                  <Input
                    type="date"
                    required
                    placeholder=""
                    value={visit_at}
                    onChange={(e) => setVisitAt(e.target.value)}
                  />
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
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReviewsCreateModal;
