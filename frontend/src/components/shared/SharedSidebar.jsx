import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bell, 
  BookOpen, 
  CheckSquare, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

const SharedSidebar = ({ isOpen, toggle, isMobile, userRole, classes = [] }) => {
  const location = useLocation();
  const baseRoute = userRole.toLowerCase();
  const [isClassesOpen, setIsClassesOpen] = useState(true);

  console.log('Classes in SharedSidebar:', classes);

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
    { icon: CheckSquare, title: 'To-do Work', path: `/${baseRoute}/todos` },
    { 
      icon: BookOpen, 
      title: userRole === 'Teacher' ? 'Teaching' : 'Enrolled Classes', 
      isDropdown: true,
      children: classes.map(cls => ({
        title: cls.className,
        path: `/class/${cls._id}`,
        initial: cls.className ? cls.className.charAt(0).toUpperCase() : '?'
      }))
    },
    { type: 'divider' },
    { icon: Settings, title: 'Settings', path: `/${baseRoute}/settings` }
  ];

  const CircleAvatar = ({ initial, isActive }) => (
    <div 
      className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
        ${isActive ? 'text-white' : 'bg-white'} shadow-md transition-all duration-300`}
      style={{ 
        minWidth: '2rem', 
        aspectRatio: '1/1',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'white',
        color: isActive ? 'white' : '#1b68b3',
        border: isActive ? '2px solid rgba(255, 255, 255, 0.2)' : 'none'
      }}
    >
      {initial}
    </div>
  );

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
            ) : item.isDropdown ? (
              <div key={index}>
                <div
                  onClick={() => setIsClassesOpen(!isClassesOpen)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer
                    hover:bg-white/10`}
                  style={{ color: 'white' }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${!isOpen && !isMobile ? 'mx-auto' : ''}`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`whitespace-nowrap ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>
                      {item.title}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="transform transition-transform duration-200">
                      {isClassesOpen ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                  )}
                </div>
                {/* Dropdown items */}
                <div className={`space-y-1 mt-1 transition-all duration-200 overflow-hidden
                  ${isClassesOpen ? 'max-h-96' : 'max-h-0'}`}>
                  {isOpen && item.children?.map((child, childIndex) => {
                    const isSelected = location.pathname === child.path;
                    
                    return (
                      <Link
                        key={childIndex}
                        to={child.path}
                        className={`flex items-center gap-3 p-3 pl-8 rounded-lg transition-all duration-300
                          ${isSelected
                            ? 'bg-white shadow-lg transform scale-[0.98]'
                            : 'text-white hover:bg-white/10'
                          }`}
                        style={{ 
                          color: isSelected ? '#1b68b3' : 'white'
                        }}
                      >
                        <CircleAvatar 
                          initial={child.initial} 
                          isActive={!isSelected}
                        />
                        <span className="truncate max-w-[140px]" title={child.title}>
                          {child.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
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
