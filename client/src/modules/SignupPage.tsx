import {
  Box,
  Button,
  chakra,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import type { Role } from '@prisma/client';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import * as api from '../services/api';
import { useTokenStorage } from '../services/Auth';

const SignupPage = () => {
  const setToken = useTokenStorage((state) => state.setToken);
  const toast = useToast();
  const history = useHistory();

  const { mutate: register, status } = useMutation(api.register, {
    onSuccess: async (data) => {
      toast.closeAll();
      setToken(data.token);
      history.push('/');
    },
  });

  const [name, setName] = useState('');

  const [role, setRole] = useState<Role>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <Box maxW="md" mx="auto" pt={10}>
      <Logo mx="auto" h="8" mb={{ base: '10', md: '20' }} />
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Create your account
      </Heading>
      <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Already have an account?</Text>
        <Link to="/">Login</Link>
      </Text>
      <Card>
        <chakra.form
          onSubmit={(e) => {
            e.preventDefault();
            register({ name, password, email, role });
          }}
        >
          <Stack spacing="6">
            <FormControl id="name">
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                type="text"
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
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
                required
              />
            </FormControl>
            <PasswordField
              minLength={8}
              maxLength={30}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              isRequired
            />

            <FormControl id="email">
              <FormLabel>Role</FormLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value={'OWNER'}>Restaurant Owner</option>
                <option value={'USER'}>Customer</option>
              </Select>
            </FormControl>

            <Button type="submit" colorScheme="blue" size="lg" fontSize="md" isLoading={status === 'loading'}>
              Create account
            </Button>
          </Stack>
        </chakra.form>
      </Card>
    </Box>
  );
};

export default SignupPage;
