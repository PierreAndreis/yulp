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
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router';
import * as api from '../../services/api';
import queryClient from '../../services/queryClient';

type Props = {
  children: React.ReactNode;
} & ChakraProps;
const RestaurantCreatePage = (props: Props) => {
  const { isOpen, onClose: onCloseModal, getButtonProps } = useDisclosure();
  const initialRef = React.useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState('');
  const history = useHistory();

  function onClose() {
    setName('');
    onCloseModal();
  }

  const { mutate: createRestaurant, status } = useMutation(api.createRestaurant, {
    onSuccess: (data) => {
      queryClient.refetchQueries(['restaurants']);
      onClose();
      history.push(`/restaurants/${data.id}`);
    },
  });

  return (
    <>
      <chakra.div {...getButtonProps()}>{props.children}</chakra.div>
      <Modal closeOnOverlayClick={false} initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a Restaurant</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack as="form" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Restaurant Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup>
              <Button
                colorScheme="blue"
                type="submit"
                onClick={() => createRestaurant({ name })}
                isLoading={status === 'loading'}
              >
                Create
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RestaurantCreatePage;
