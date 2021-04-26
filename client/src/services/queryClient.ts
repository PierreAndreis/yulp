import { createStandaloneToast } from '@chakra-ui/toast';
import { QueryClient } from 'react-query';
import { isError } from './fetch';

const toast = createStandaloneToast();

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        if (isError(error)) {
          toast({
            status: 'error',
            title: error.message,
            isClosable: true,
            duration: 2000,
          });
          return;
        }

        toast({
          status: 'error',
          title: 'Unknown Error. Please try again later.',
          isClosable: true,
          duration: 2000,
        });
      },
    },
  },
});

export default queryClient;
