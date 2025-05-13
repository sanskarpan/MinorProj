import { BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import Router from './routes';
import './index.css';
import { Toaster } from "@/components/ui/toaster";

// Loading component
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Router />
        <Toaster /> 
      </Suspense>
    </BrowserRouter>
  );
}

export default App;