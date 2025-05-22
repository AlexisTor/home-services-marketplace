// frontend/web/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import store from './store';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobsList from './pages/JobsList';
import JobDetails from './pages/JobDetails';
import CreateJob from './pages/CreateJob';
import ProfessionalsList from './pages/ProfessionalsList';
import ProfessionalProfile from './pages/ProfessionalProfile';
import CreateProfessionalProfile from './pages/CreateProfessionalProfile';
import UserProfile from './pages/UserProfile';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <PrivateRoute path="/jobs/create" component={CreateJob} />
              <PrivateRoute path="/jobs/:id" component={JobDetails} />
              <PrivateRoute path="/jobs" component={JobsList} />
              <PrivateRoute path="/professionals/:id" component={ProfessionalProfile} />
              <PrivateRoute path="/professionals" component={ProfessionalsList} />
              <PrivateRoute path="/profile/professional/create" component={CreateProfessionalProfile} />
              <PrivateRoute path="/profile" component={UserProfile} />
              <PrivateRoute path="/payment/:jobId" component={PaymentPage} />
              <PrivateRoute path="/payments/success" component={PaymentSuccess} />
            </Switch>
          </main>
          <Footer />
        </Router>
      </I18nextProvider>
    </Provider>
  );
}

export default App;
