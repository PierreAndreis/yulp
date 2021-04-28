import { Button, ButtonGroup, Spinner } from '@chakra-ui/react';
import React from 'react';
import { isError, useQuery } from 'react-query';
import { Column } from 'react-table';
import { Card } from '../../components/Card';
import ErrorComponent from '../../components/ErrorComponent';
import { DataTable } from '../../components/Table';
import * as api from '../../services/api';
import ReviewsStars from '../reviews/ReviewsStars';
import RestaurantsDeleteAlert from './RestaurantsDeleteAlert';
import RestaurantsEditModal from './RestaurantsEditModal';
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const columns: Array<Column<ThenArg<ReturnType<typeof api.restaurants>>['restaurants'][0]>> = [
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Rating Average',
    accessor: 'reviews_rating_avg',
    Cell: ({ value }) => <ReviewsStars value={value} />,
  },
  {
    Header: 'Rating Count',
    accessor: 'reviews_rating_count',
  },
  {
    Header: 'Actions',
    accessor: 'id',
    Cell: ({ cell }) => (
      <ButtonGroup size="sm" colorScheme="gray">
        <RestaurantsEditModal restaurant={cell.row.original}>
          <Button>Edit</Button>
        </RestaurantsEditModal>
        <RestaurantsDeleteAlert restaurant={cell.row.original}>
          <Button>Delete</Button>
        </RestaurantsDeleteAlert>
      </ButtonGroup>
    ),
  },
];

const RestarantsEditList = () => {
  const { data, status, error } = useQuery(['restaurants', 'list'], () => api.restaurants());
  if (error) {
    return <ErrorComponent message={isError(error) ? error.message : null} />;
  }

  return (
    <Card>
      {data?.restaurants && <DataTable data={data?.restaurants} columns={columns} />}
      {status === 'loading' && <Spinner />}
    </Card>
  );
};

export default RestarantsEditList;
