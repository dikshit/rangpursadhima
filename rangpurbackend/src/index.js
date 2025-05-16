import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import { AuthProvider } from './screens/Authcontext';
import Mudatmarked from './screens/Mudatmarked';
import UserDataPage from './screens/UserDataPage';
import PrintPage from './screens/PrintPage';
import { UserProvider } from './screens/UserContext';
import ProtectedRoute from './screens/ProtectedRoute';

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mudatmarked',
    element: (
      <ProtectedRoute>
        <Mudatmarked />
      </ProtectedRoute>
    ),
  },
  {
    path: '/user-data',
    element: (
      <ProtectedRoute>
        <UserDataPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/print-page',
    element: (
      <ProtectedRoute>
        <PrintPage />
      </ProtectedRoute>
    ),
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <UserProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
