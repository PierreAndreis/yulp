import { chakra, HTMLChakraProps, useColorModeValue } from '@chakra-ui/system';
import * as React from 'react';
import { Link as LinkRouter } from 'react-router-dom';

export const Link = (props: HTMLChakraProps<'a'> & { to: string }) => (
  <chakra.a
    as={LinkRouter}
    marginStart="1"
    color={useColorModeValue('blue.500', 'blue.200')}
    _hover={{ color: useColorModeValue('blue.600', 'blue.300') }}
    display={{ base: 'block', sm: 'inline' }}
    {...props}
  />
);
