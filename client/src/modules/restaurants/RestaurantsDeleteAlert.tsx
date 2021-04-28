import { useDisclosure } from '@chakra-ui/hooks';
import { Text } from '@chakra-ui/layout';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { chakra, ChakraProps } from '@chakra-ui/system';
import React from 'react';
import { useMutation } from 'react-query';
import * as api from '../../services/api';
import queryClient from '../../services/queryClient';

type Props = {
  children: React.ReactNode;
  restaurant: api.Restaurant;
} & ChakraProps;
const RestaurantsDeleteAlert = (props: Props) => {
  const { isOpen, onClose, getButtonProps } = useDisclosure();

  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const { mutate: deleteRestaurant, status } = useMutation(() => api.deleteRestaurant(props.restaurant.id), {
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: `restaurants` });
      onClose();
    },
  });

  return (
    <>
      <chakra.div {...getButtonProps()}>{props.children}</chakra.div>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        motionPreset="slideInBottom"
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete {props.restaurant.name}
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text fontWeight="600" mb={1}>
                Are you sure? You can{"'"}t undo this action afterwards.
              </Text>
              <Text>Everything associate to this restaurant, like its reviews and replies, will also be deleted.</Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={() => deleteRestaurant()} ml={3} isLoading={status === 'loading'}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default RestaurantsDeleteAlert;
