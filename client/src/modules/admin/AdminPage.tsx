import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import { useAuth } from '../../services/Auth';
import RestarantsEditList from '../restaurants/RestaurantsEditList';
import ReviewsEditList from '../reviews/ReviewsEditList';
import UsersEditList from '../users/UsersEditList';
const AdminPage = () => {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return (
      <Layout>
        <ErrorComponent message="You don't have enough permission to see this page." />
      </Layout>
    );
  }

  return (
    <Layout>
      <Tabs isLazy lazyBehavior="keepMounted" variant="soft-rounded">
        <TabList>
          <Tab>Users</Tab>
          <Tab>Restaurants</Tab>
          <Tab>Reviews</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <UsersEditList />
          </TabPanel>
          <TabPanel>
            <RestarantsEditList />
          </TabPanel>
          <TabPanel>
            <ReviewsEditList />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

export default AdminPage;
