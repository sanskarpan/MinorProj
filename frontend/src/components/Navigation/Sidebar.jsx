// frontend/src/components/Navigation/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Import Sheet components
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Wallet, // Example new icon
  Target,
  X // Close icon
} from "lucide-react";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const { user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Transactions', icon: ArrowLeftRight, path: '/transactions' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Budgets', icon: Target, path: '/budgets' },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <Wallet className="h-6 w-6 text-primary" /> {/* Use an icon */}
          <span className="">Finance Tracker</span>
        </NavLink>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
       {/* Optional: User info at the bottom */}
       <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-2">
              {/* Small avatar */}
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className='text-xs'>
                  <p className="font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
              </div>
          </div>
      </div>
    </div>
  );

  // Mobile uses ShadCN Sheet, Desktop uses conditional width
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        {/* Trigger is handled by Navbar now, so no SheetTrigger needed here */}
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0"> {/* Adjust width */}
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop Sidebar
  return (
    <div className={cn(
      "hidden border-r bg-card text-card-foreground lg:block transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-0 overflow-hidden" // Adjust width as needed
    )}>
      <SidebarContent />
    </div>
  );
};

export default Sidebar;