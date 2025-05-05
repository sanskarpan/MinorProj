import { Navigate, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import useAuthStore from './store/authStore';

// Layout
import MainLayout from './components/Navigation/MainLayout';
import { Loader2 } from 'lucide-react'; // Use Loader icon

// Pages - Ensure correct paths if using aliases
const Dashboard = lazy(() => import('@/pages/DashboardPage'));
const Transactions = lazy(() => import('@/pages/TransactionPage'));
const Analytics = lazy(() => import('@/pages/AnalyticsPage'));
const Login = lazy(() => import('@/pages/LoginPage'));
const Signup = lazy(() => import('@/pages/SignupPage'));
const NotFound = lazy(() => import('@/pages/NotFoundPage'));

// Enhanced Loading component
const Loading = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

// Auth guard component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Store intended location for redirect after login
    // const location = useLocation(); // You might need this if using React Router v6 features directly
    return <Navigate to="/login" replace />; // Use replace to prevent back button issues
  }

  return children;
};

// Guest guard component (for login/signup pages)
const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
      // Wrap all protected children in Suspense
      children: [
        { path: '/', element: <Navigate to="/dashboard" replace /> },
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
         // Add placeholders for future routes
         // { path: 'budgets', element: <Suspense fallback={<Loading />}><BudgetsPage /></Suspense> },
         // { path: 'profile', element: <Suspense fallback={<Loading />}><ProfilePage /></Suspense> },
         // { path: 'settings', element: <Suspense fallback={<Loading />}><SettingsPage /></Suspense> },
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
    // Separate layout for NotFound or keep it simple
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