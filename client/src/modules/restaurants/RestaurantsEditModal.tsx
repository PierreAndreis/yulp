import { useDisclosure } from '@chakra-ui/hooks';
import { Stack } from '@chakra-ui/layout';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { chakra, ChakraProps } from '@chakra-ui/system';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import * as api from '../../services/api';
import queryClient from '../../services/queryClient';

type Props = {
  children: React.ReactNode;
  restaurant: api.Restaurant;
} & ChakraProps;
const RestaurantsEditModal = (props: Props) => {
  const { isOpen, onClose: onCloseModal, getButtonProps } = useDisclosure();
  const initialRef = React.useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState('');

  const restaurant = props.restaurant;
  const lastOpenedRestaurantId = useRef<string | null>(null);
  useEffect(() => {
    if (isOpen && lastOpenedRestaurantId.current !== restaurant.id) {
      lastOpenedRestaurantId.current = restaurant.id;
      setName(restaurant.name);
    }
  }, [isOpen, restaurant]);

  function onClose() {
    lastOpenedRestaurantId.current = null;
    setName('');
    onCloseModal();
  }

  const { mutate: updateRestaurant, status } = useMutation(
    (data: Parameters<typeof api.editRestaurant>[1]) => api.editRestaurant(props.restaurant.id, data),
    {
      onSuccess: () => {
        queryClient.refetchQueries('restaurants');
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
              updateRestaurant({ name });
            }}
          >
            <ModalHeader>Update Restaurant</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing="6">
                <FormControl id="name">
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    type="text"
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
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
          </chakra.form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RestaurantsEditModal;
