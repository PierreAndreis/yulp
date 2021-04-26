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
  });

  const [email, setEmail] = useState('');
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
            login({ email, password });
          }}
        >
          <Stack spacing="6">
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
