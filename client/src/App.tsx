import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import AdminPage from './modules/admin/AdminPage';
import LoginPage from './modules/LoginPage';
import RestaurantsDetailsPage from './modules/restaurants/RestaurantsDetailsPage';
import RestaurantsPage from './modules/restaurants/RestaurantsPage';
import ReviewsPendingPage from './modules/reviews/ReviewsPendingPage';
import SignupPage from './modules/SignupPage';
import { useAuth } from './services/Auth';

function App() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading)
    return (
      <Center mt={10}>
        <Spinner size="xl" />
      </Center>
    );

  if (!isLoggedIn)
    return (
      <Layout>
        <Switch>
          <Route path="/signup">
            <SignupPage />
          </Route>
          <Route>
            <LoginPage />
          </Route>
        </Switch>
      </Layout>
    );

  return (
    <Layout header={<Navbar />}>
      <Switch>
        <Route path="/restaurants/:id">
          <RestaurantsDetailsPage />
        </Route>
        <Route path="/reviews-pending">
          <ReviewsPendingPage />
        </Route>
        <Route path="/admin">
          <AdminPage />
        </Route>
        <Route path="/">
          <RestaurantsPage />
        </Route>
      </Switch>
    </Layout>
  );
}

export default App;
