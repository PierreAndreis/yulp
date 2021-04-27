import { useDisclosure } from '@chakra-ui/hooks';
import { Box } from '@chakra-ui/layout';
import { Button, ButtonGroup, Collapse, FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import { chakra, ChakraProps } from '@chakra-ui/system';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import * as api from '../../services/api';
import queryClient from '../../services/queryClient';

type Props = {
  children: React.ReactNode;
  reviewId: string;
} & ChakraProps;
const ReviewReply = (props: Props) => {
  const { isOpen, onClose: onCloseModal, getButtonProps } = useDisclosure();
  const initialRef = React.useRef<HTMLTextAreaElement>(null);

  const [message, setMessage] = useState('');

  function onClose() {
    setMessage('');
    onCloseModal();
  }

  const { mutate: sendReview, status } = useMutation(
    (data: Parameters<typeof api.replyReview>[1]) => api.replyReview(props.reviewId, data),
    {
      onSuccess: (data) => {
        queryClient.refetchQueries({ queryKey: `restaurants` });
        queryClient.refetchQueries({ queryKey: `restaurants.${data.restaurant_id}` });
        queryClient.refetchQueries({ queryKey: `reviews_pending` });
        onClose();
      },
    },
  );

  return (
    <>
      <chakra.div {...getButtonProps()}>{props.children}</chakra.div>
      <Collapse in={isOpen} animateOpacity>
        <chakra.form
          p={5}
          onSubmit={(e) => {
            e.preventDefault();
            sendReview({ message });
          }}
        >
          <FormControl isRequired>
            <FormLabel>Message</FormLabel>
            <Textarea
              ref={initialRef}
              placeholder="Your reply..."
              value={message}
              isRequired
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormControl>
          <ButtonGroup size="sm">
            <Button colorScheme="blue" type="submit" isLoading={status === 'loading'}>
              Reply
            </Button>
            <Button onClick={onClose} type="reset">
              Cancel
            </Button>
          </ButtonGroup>
        </chakra.form>
      </Collapse>
    </>
  );
};

export default ReviewReply;
