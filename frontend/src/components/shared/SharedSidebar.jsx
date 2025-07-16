import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { useSelector } from 'react-redux';

const SharedSidebar = ({ isOpen, toggle, isMobile, userRole, classes = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const baseRoute = userRole.toLowerCase();
  const [isClassesOpen, setIsClassesOpen] = useState(true);
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:8080/${userRole.toLowerCase()}/stats`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
          console.log('Stats data in sidebar:', result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [userRole]);

  console.log(`SharedSidebar: userRole=${userRole}, baseRoute=${baseRoute}`);
  console.log(`SharedSidebar: Todo path=/${baseRoute}/todos, Settings path=/${baseRoute}/settings`);
  
  // Get notification count from redux store
  const notifications = useSelector((state) => 
    userRole === 'Student' 
      ? state.notifications?.notifications || []
      : state.teacherNotifications?.notifications || []
  );
  
  // Get pending assignments count for students or pending reviews for teachers
  const assignments = useSelector((state) => state.assignments);
  const pendingWork = userRole === 'Student'
    ? (assignments?.assignments || []).filter(a => 
        !(a.submission && a.submission.status === 'submitted') && 
        new Date(a.dueDate) > new Date()
      ).length
    : stats?.assignments || 0;  // Use the assignments count from stats

  console.log('Classes in SharedSidebar:', classes);
  console.log('Current pathname:', location.pathname);
  console.log('Base route:', baseRoute);

  const menuItems = [
    { icon: Home, title: 'Home', path: `/${baseRoute}/home` },
    { 
      icon: Bell, 
      title: 'Notifications', 
      path: `/${baseRoute}/notifications`,
      badge: notifications.filter(n => !n.read).length
    },
    { type: 'divider' },
    { 
      icon: CheckSquare, 
      title: 'To-do Work', 
      path: `/${baseRoute}/todos`,
      badge: typeof pendingWork === 'number' ? pendingWork : pendingWork.length,
      onClick: (e) => {
        console.log(`Navigating to To-do: /${baseRoute}/todos`);
        handleNavigation(`/${baseRoute}/todos`, e);
      }
    },
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
    { 
      icon: Settings, 
      title: 'Settings', 
      path: `/${baseRoute}/settings`,
      onClick: (e) => {
        console.log(`Navigating to Settings: /${baseRoute}/settings`);
        handleNavigation(`/${baseRoute}/settings`, e);
      }
    }
  ];

  // Badge component for notifications/todos count
  const Badge = ({ count }) => {
    if (!count || count <= 0) return null;
    
    return (
      <div className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs font-semibold px-1">
        {count > 99 ? '99+' : count}
      </div>
    );
  };

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

  const handleNavigation = (path, e) => {
    console.log('Navigating to:', path);
    if (e) e.preventDefault(); // Prevent default Link behavior
    
    // Force navigation with navigate function instead of relying on Link
    navigate(path);
  };

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
                    // Check for any route that includes the class ID (like classwork, discussions, etc.)
                    const isActive = location.pathname.includes(child.path.split('/').pop());
                    
                    return (
                      <Link
                        key={childIndex}
                        to={child.path}
                        className={`flex items-center gap-3 p-3 pl-8 rounded-lg transition-all duration-300
                          ${isSelected
                            ? 'bg-white shadow-lg transform scale-[0.98]'
                            : isActive
                              ? 'bg-white/10 text-white'
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
                className={`flex items-center p-3 rounded-lg transition-all duration-300 cursor-pointer
                  ${location.pathname === item.path
                    ? 'bg-white shadow-lg transform scale-[0.98]'
                    : 'hover:bg-white/10'
                  }`}
                style={{ 
                  color: location.pathname === item.path ? '#1b68b3' : 'white',
                }}
              >
                <Link to={item.path} className="flex items-center justify-between w-full" style={{ color: 'inherit' }}>
                  <div className="flex items-center space-x-3">
                    <div className={`${!isOpen && !isMobile ? 'mx-auto' : ''}`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`whitespace-nowrap ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>
                      {item.title}
                    </span>
                  </div>
                  
                  {/* Show badge for notifications and to-dos if count > 0 */}
                  {isOpen && item.badge > 0 && (
                    <Badge count={item.badge} />
                  )}
                  
                  {/* For collapsed sidebar, show badge without counter */}
                  {!isOpen && !isMobile && item.badge > 0 && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500" />
                  )}
                </Link>
              </div>
            )
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SharedSidebar;
