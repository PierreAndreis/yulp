import { Button, ButtonGroup, Spinner, Text } from '@chakra-ui/react';
import React from 'react';
import { isError, useQuery } from 'react-query';
import { Column } from 'react-table';
import { Card } from '../../components/Card';
import ErrorComponent from '../../components/ErrorComponent';
import { DataTable } from '../../components/Table';
import * as api from '../../services/api';
import ReviewsDeleteAlert from './ReviewsDeleteAlert';
import ReviewsEditModal from './ReviewsEditModal';
import ReviewsStars from './ReviewsStars';

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
const columns: Array<Column<ThenArg<ReturnType<typeof api.reviews>>['reviews'][0]>> = [
  {
    Header: 'Username',
    accessor: (row) => row.user.name,
  },
  {
    Header: 'Restaurant',
    accessor: (row) => row.restaurant.name,
  },
  {
    Header: 'Rating',
    accessor: 'rating',
    Cell: ({ value }) => <ReviewsStars value={value} />,
  },
  {
    Header: 'Message',
    accessor: 'message',
    Cell: ({ value }) => (
      <Text fontSize="sm" whiteSpace="pre-wrap" noOfLines={2}>
        {value}
      </Text>
    ),
  },
  {
    Header: 'Actions',
    accessor: 'id',
    Cell: ({ cell }) => (
      <ButtonGroup size="sm" colorScheme="gray">
        <ReviewsEditModal review={cell.row.original}>
          <Button>Edit</Button>
        </ReviewsEditModal>
        <ReviewsDeleteAlert review={cell.row.original}>
          <Button>Delete</Button>
        </ReviewsDeleteAlert>
      </ButtonGroup>
    ),
  },
];

const ReviewsEditList = () => {
  const { data, status, error } = useQuery(['reviews', 'reviews.list'], () => api.reviews({ showOnlyOwned: false }));

  if (error) {
    return <ErrorComponent message={isError(error) ? error.message : null} />;
  }

  return (
    <Card>
      {data?.reviews && <DataTable data={data?.reviews} columns={columns} />}
      {status === 'loading' && <Spinner />}
    </Card>
  );
};

export default ReviewsEditList;
