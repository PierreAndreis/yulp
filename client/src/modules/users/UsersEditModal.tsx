import type { Role } from '.prisma/client';
import { useDisclosure } from '@chakra-ui/hooks';
import { Stack, Text } from '@chakra-ui/layout';
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
  Select,
} from '@chakra-ui/react';
import { chakra, ChakraProps } from '@chakra-ui/system';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { PasswordField } from '../../components/PasswordField';
import * as api from '../../services/api';
import queryClient from '../../services/queryClient';

type Props = {
  children: React.ReactNode;
  user: api.User;
} & ChakraProps;
const UsersEditModal = (props: Props) => {
  const { isOpen, onClose: onCloseModal, getButtonProps } = useDisclosure();
  const initialRef = React.useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState<string | undefined>(void 0);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | undefined>(void 0);

  const user = props.user;
  const lastOpenedUserId = useRef<string | null>(null);
  useEffect(() => {
    if (isOpen && lastOpenedUserId.current !== user.id) {
      lastOpenedUserId.current = user.id;
      setName(user.name);
      setPassword(void 0);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [isOpen, user]);

  function onClose() {
    lastOpenedUserId.current = null;
    setName('');
    setPassword(void 0);
    setEmail('');
    setRole(void 0);
    onCloseModal();
  }

  const { mutate: updateUser, status } = useMutation(
    (data: Parameters<typeof api.editUser>[1]) => api.editUser(props.user.id, data),
    {
      onSuccess: () => {
        queryClient.refetchQueries('users');
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
              updateUser({ name, password, email, role });
            }}
          >
            <ModalHeader>Update User</ModalHeader>
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
                <FormControl id="email">
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </FormControl>
                <FormControl id="role">
                  <FormLabel>Role</FormLabel>
                  <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                    <option value={'ADMIN'}>Admin</option>
                    <option value={'OWNER'}>Restaurant Owner</option>
                    <option value={'USER'}>Customer</option>
                  </Select>
                </FormControl>
                <PasswordField
                  minLength={8}
                  maxLength={30}
                  onChange={(e) => setPassword(e.target.value || void 0)}
                  value={password}
                  isRequired={false}
                />
                <Text style={{ marginTop: 0 }} color="gray.500">
                  Leave blank if you don{"'"}t want to change.
                </Text>
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

export default UsersEditModal;
