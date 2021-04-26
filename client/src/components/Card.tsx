import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';
import * as React from 'react';

export const Card = (props: BoxProps) => (
  <Box bg={useColorModeValue('white', 'gray.700')} py="4" px="8" shadow="base" rounded={{ sm: 'lg' }} {...props} />
);
