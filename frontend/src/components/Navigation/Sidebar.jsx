import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const { user } = useAuthStore();

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/dashboard',
    },
    {
      name: 'Transactions',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      path: '/transactions',
    },
    {
      name: 'Analytics',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/analytics',
    },
  ];

  // Conditional styling for sidebar
  const sidebarClasses = isMobile
    ? `fixed inset-0 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:inset-auto`
    : `${isOpen ? 'w-64' : 'w-0 lg:w-0'} transition-all duration-300 ease-in-out overflow-hidden`;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`bg-white h-full ${sidebarClasses}`}>
        <div className="h-full flex flex-col">
          {/* Logo and close button */}
          <div className="border-b border-gray-200 py-6 px-4 flex items-center justify-between">
            <span className="font-bold text-xl text-primary-600">Finance Tracker</span>
            {isMobile && (
              <button
                type="button"
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={onClose}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* User info */}
          <div className="border-b border-gray-200 py-4 px-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-lg font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                onClick={isMobile ? onClose : undefined}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;