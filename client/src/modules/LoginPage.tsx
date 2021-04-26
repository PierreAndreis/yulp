import { Box, Button, chakra, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import * as api from '../services/api';
import { useTokenStorage } from '../services/Auth';
import { isError } from '../services/fetch';

const LoginPage = () => {
  const setToken = useTokenStorage((state) => state.setToken);
  const toast = useToast();

  const { mutate: login, status } = useMutation(api.login, {
    onSuccess: (data) => {
      toast.closeAll();
      setToken(data.token);
    },
    onError: (error) => {
      if (isError(error)) {
        toast({
          status: 'error',
          title: error.message,
        });
        return;
      }

      toast({
        status: 'error',
        title: 'Unknown Error. Please try again later.',
      });
    },
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <Box maxW="md" mx="auto" pt={10}>
      <Logo mx="auto" h="8" mb={{ base: '10', md: '20' }} />
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Sign in to your account
      </Heading>
      <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Don&apos;t have an account?</Text>
        <Link to="/signup">Create one</Link>
      </Text>
      <Card>
        <chakra.form
          onSubmit={(e) => {
            e.preventDefault();
            login({ username, password });
          }}
        >
          <Stack spacing="6">
            <FormControl id="email">
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                type="text"
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                required
              />
            </FormControl>
            <PasswordField onChange={(e) => setPassword(e.target.value)} value={password} />
            <Button type="submit" colorScheme="blue" size="lg" fontSize="md" isLoading={status === 'loading'}>
              Sign in
            </Button>
          </Stack>
        </chakra.form>
      </Card>
    </Box>
  );
};

export default LoginPage;
