import { Button, ButtonGroup, Spinner } from '@chakra-ui/react';
import React from 'react';
import { useQuery } from 'react-query';
import { Column } from 'react-table';
import { Card } from '../../components/Card';
import ErrorComponent from '../../components/ErrorComponent';
import { DataTable } from '../../components/Table';
import * as api from '../../services/api';
import { isError } from '../../services/fetch';
import UsersDeleteAlert from './UsersDeleteAlert';
import UsersEditModal from './UsersEditModal';
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const columns: Array<Column<ThenArg<ReturnType<typeof api.listUsers>>['users'][0]>> = [
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Role',
    accessor: 'role',
  },
  {
    Header: 'Actions',
    accessor: 'id',
    Cell: ({ cell }) => (
      <ButtonGroup size="sm" colorScheme="gray">
        <UsersEditModal user={cell.row.original}>
          <Button>Edit</Button>
        </UsersEditModal>
        <UsersDeleteAlert user={cell.row.original}>
          <Button>Delete</Button>
        </UsersDeleteAlert>
      </ButtonGroup>
    ),
  },
];

const UsersList = () => {
  const { data, error, status } = useQuery(['users', `users.list`], api.listUsers);

  if (error) {
    return <ErrorComponent message={isError(error) ? error.message : null} />;
  }

  return (
    <Card>
      {data?.users && <DataTable data={data?.users} columns={columns} />}
      {status === 'loading' && <Spinner />}
    </Card>
  );
};

export default UsersList;
