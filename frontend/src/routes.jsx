import { Navigate, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import useAuthStore from './store/authStore';

// Layout
import MainLayout from './components/Navigation/MainLayout';

// Pages
const Dashboard = lazy(() => import('./pages/DashboardPage'));
const Transactions = lazy(() => import('./pages/TransactionPage'));
const Analytics = lazy(() => import('./pages/AnalyticsPage'));
const Login = lazy(() => import('./pages/LoginPage'));
const Signup = lazy(() => import('./pages/SignupPage'));
const NotFound = lazy(() => import('./pages/NotFoundPage'));

// Loading component
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
  </div>
);

// Auth guard component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Guest guard component (for login/signup pages)
const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Routes configuration
const Router = () => {
  return useRoutes([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: '/', element: <Navigate to="/dashboard" /> },
        { 
          path: 'dashboard', 
          element: (
            <Suspense fallback={<Loading />}>
              <Dashboard />
            </Suspense>
          )
        },
        { 
          path: 'transactions', 
          element: (
            <Suspense fallback={<Loading />}>
              <Transactions />
            </Suspense>
          )
        },
        { 
          path: 'analytics', 
          element: (
            <Suspense fallback={<Loading />}>
              <Analytics />
            </Suspense>
          )
        },
      ],
    },
    {
      path: 'login',
      element: (
        <GuestRoute>
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        </GuestRoute>
      ),
    },
    {
      path: 'signup',
      element: (
        <GuestRoute>
          <Suspense fallback={<Loading />}>
            <Signup />
          </Suspense>
        </GuestRoute>
      ),
    },
    {
      path: '404',
      element: (
        <Suspense fallback={<Loading />}>
          <NotFound />
        </Suspense>
      ),
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
};

export default Router;