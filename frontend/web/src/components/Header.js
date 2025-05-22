import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector(state => state.auth || {});

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          {t('Freelance Marketplace')}
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:underline">
                {t('Home')}
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:underline">
                {t('Jobs')}
              </Link>
            </li>
            <li>
              <Link to="/professionals" className="hover:underline">
                {t('Professionals')}
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard" className="hover:underline">
                    {t('Dashboard')}
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:underline">
                    {t('Profile')}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:underline">
                    {t('Login')}
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:underline">
                    {t('Register')}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
