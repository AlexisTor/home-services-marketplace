import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
/**
import Login from '../../../scrap/Login';
import Register from '../../../scrap/Register';
import Dashboard from './pages/Dashboard';
import JobsList from '../../../scrap/JobsList';
import JobDetails from '../../../scrap/JobDetails';
import CreateJob from './pages/CreateJob';
import ProfessionalsList from '../../../scrap/ProfessionalsList';
import ProfessionalProfile from '../../../scrap/ProfessionalProfile';
import CreateProfessionalProfile from './pages/CreateProfessionalProfile';
import UserProfile from '../../../scrap/UserProfile';
import PaymentPage from '../../../scrap/PaymentPage';
import PaymentSuccess from '../../../scrap/PaymentSuccess';
*/

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </I18nextProvider>
    </Provider>
  );
}

export default App;
