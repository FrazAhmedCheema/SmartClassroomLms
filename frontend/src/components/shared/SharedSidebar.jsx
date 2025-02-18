import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bell, 
  BookOpen, 
  CheckSquare, 
  Settings,
} from 'lucide-react';
import Swal from 'sweetalert2';

const SharedSidebar = ({ isOpen, toggle, isMobile, userRole, classes = [] }) => {
  const location = useLocation();
  const baseRoute = userRole.toLowerCase();

  // Only home route is implemented for now
  const implementedRoutes = [`/${baseRoute}/home`];

  const handleUnimplementedRoute = (e, title) => {
    e.preventDefault();
    Swal.fire({
      title: 'Coming Soon!',
      text: `The ${title} feature is under development.`,
      icon: 'info',
      confirmButtonColor: '#1b68b3',
    });
  };

  const menuItems = [
    { icon: Home, title: 'Home', path: `/${baseRoute}/home` },
    { icon: Bell, title: 'Notifications', path: `/${baseRoute}/notifications` },
    { type: 'divider' },
    { icon: BookOpen, title: 'Enrolled Classes', path: `/${baseRoute}/classes` },
    { icon: CheckSquare, title: 'To-do Work', path: `/${baseRoute}/todos` },
    ...classes.map(cls => ({
      icon: BookOpen,
      title: cls.name,
      path: `/${baseRoute}/classes/${cls.id}`
    })),
    { type: 'divider' },
    { icon: Settings, title: 'Settings', path: `/${baseRoute}/settings` }
  ];

  return (
    <div
      className={`fixed left-0 h-screen transition-all duration-300 overflow-hidden z-40
        ${isOpen ? 'w-64' : isMobile ? 'w-0' : 'w-20'}`}
      style={{ 
        backgroundColor: '#1b68b3',
        top: '4rem',
        boxShadow: '4px 0 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            item.type === 'divider' ? (
              <hr key={index} className="my-4 border-white/20" />
            ) : (
              <div
                key={index}
                onClick={(e) => !implementedRoutes.includes(item.path) && handleUnimplementedRoute(e, item.title)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 cursor-pointer
                  ${location.pathname === item.path
                    ? 'bg-white shadow-lg transform scale-[0.98]'
                    : 'hover:bg-white/10'
                  }`}
                style={{ 
                  color: location.pathname === item.path ? '#1b68b3' : 'white',
                }}
              >
                {implementedRoutes.includes(item.path) ? (
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 w-full"
                  >
                    <div className={`${!isOpen && !isMobile ? 'mx-auto' : ''}`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`whitespace-nowrap ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>
                      {item.title}
                    </span>
                  </Link>
                ) : (
                  <>
                    <div className={`${!isOpen && !isMobile ? 'mx-auto' : ''}`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`whitespace-nowrap ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>
                      {item.title}
                    </span>
                  </>
                )}
              </div>
            )
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SharedSidebar;
