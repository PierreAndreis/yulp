import { useColorModeValue } from '@chakra-ui/color-mode';
import { Box } from '@chakra-ui/layout';
import React from 'react';

export default function Layout(props: { children: React.ReactNode; header?: React.ReactNode }) {
  return (
    <Box bg={useColorModeValue('gray.50', 'inherit')} minH="100vh">
      {props.header}

      <Box maxW="4xl" mx="auto" pt={props.header ? 5 : 0}>
        {props.children}
      </Box>
    </Box>
  );
}
