import { Icon, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Card } from './Card';

const ErrorComponent = (props: { message?: string | null }) => {
  return (
    <Card>
      <Stack>
        <Stack direction="row" align="center">
          <Text fontWeight="bold" fontSize="xl">
            Error
          </Text>{' '}
          <Icon as={FaExclamationTriangle} color="yellow.400" />
        </Stack>
        <Text color="gray.700">{props.message ? props.message : 'Unknown error. Please, try again later.'}</Text>
      </Stack>
    </Card>
  );
};

export default ErrorComponent;
