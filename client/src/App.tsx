import { Button, Center, Spinner } from '@chakra-ui/react';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './modules/LoginPage';
import RestaurantsPage from './modules/restaurants/RestaurantsPage';
import RestaurantsDetailsPage from './modules/restaurants/RestaurantsDetailsPage';
import SignupPage from './modules/SignupPage';
import { useAuth } from './services/Auth';
import Navbar from './components/Navbar';
import ReviewsPendingPage from './modules/reviews/ReviewsPendingPage';

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
        <Route path="/">
          <RestaurantsPage />
        </Route>
        <Route path="*">hi</Route>
      </Switch>
    </Layout>
  );
}

export default App;
