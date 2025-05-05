import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Use ShadCN button
import { Home, Frown } from 'lucide-react'; // Icons

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <Frown className="h-24 w-24 text-destructive mb-6" /> {/* Icon for error */}
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;