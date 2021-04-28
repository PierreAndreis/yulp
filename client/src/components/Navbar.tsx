import { Button, ButtonGroup, IconButton } from '@chakra-ui/button';
import { Box, Stack } from '@chakra-ui/layout';
import React from 'react';
import { BiFoodMenu, BiPaperclip, BiStar } from 'react-icons/bi';
import { IoMdExit } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/Auth';
import { Logo } from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <Box bg={'blue.400'} h="50px" position="relative">
      <Box maxW="4xl" mx="auto" h="100%">
        <Stack direction="row" align="center" h="100%">
          <Link to="/">
            <Logo color="white" mr={5} />
          </Link>
          <ButtonGroup size="sm">
            <Button
              as={Link}
              to={'/'}
              bg="transparent"
              color="white"
              _hover={{ bg: 'blue.300' }}
              leftIcon={<BiFoodMenu />}
            >
              Restaurants
            </Button>
            {user?.role === 'OWNER' ? (
              <Button
                as={Link}
                to={'/reviews-pending'}
                bg="transparent"
                color="white"
                _hover={{ bg: 'blue.300' }}
                leftIcon={<BiPaperclip />}
              >
                Reviews Pending
              </Button>
            ) : null}
            {user?.role === 'ADMIN' ? (
              <Button
                as={Link}
                to={'/admin'}
                bg="transparent"
                variant="solid"
                color="white"
                _hover={{ bg: 'blue.300' }}
                leftIcon={<BiStar />}
              >
                Admin
              </Button>
            ) : null}
          </ButtonGroup>
          <IconButton
            style={{ marginLeft: 'auto' }}
            color="white"
            icon={<IoMdExit style={{ color: 'white' }} />}
            size="sm"
            colorScheme="blue"
            onClick={() => logout()}
            aria-label="Logout"
          />
        </Stack>
      </Box>
    </Box>
  );
}
