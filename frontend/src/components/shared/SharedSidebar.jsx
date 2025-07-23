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
import { useSelector, useDispatch } from 'react-redux';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';
import { fetchTeacherUnreadCount } from '../../redux/slices/teacherNotificationSlice';

const SharedSidebar = ({ isOpen, toggle, isMobile, userRole, classes = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const baseRoute = userRole.toLowerCase();
  const [isClassesOpen, setIsClassesOpen] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Get notification data from Redux store
  const notificationState = useSelector((state) => 
    userRole === 'Student' 
      ? state.notifications
      : state.teacherNotifications
  );
  
  const { notifications = [], unreadCount = 0 } = notificationState || {};
  
  useEffect(() => {
    // Fetch unread count when component mounts and when userRole changes
    if (userRole === 'Student') {
      dispatch(fetchUnreadCount());
    } else if (userRole === 'Teacher') {
      dispatch(fetchTeacherUnreadCount());
    }
  }, [dispatch, userRole]);
  
  // Set up interval to refresh unread count for real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (userRole === 'Student') {
        dispatch(fetchUnreadCount());
      } else if (userRole === 'Teacher') {
        dispatch(fetchTeacherUnreadCount());
      }
    }, 10000); // Every 10 seconds for real-time sync
    
    return () => clearInterval(interval);
  }, [dispatch, userRole]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log(`Fetching stats for ${userRole}...`);
        const response = await fetch(`http://localhost:8080/${userRole.toLowerCase()}/stats`, {
          method: 'GET',
          credentials: 'include',  // Ensure cookies are sent
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Stats response status for ${userRole}:`, response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`Stats response data for ${userRole}:`, result);
        
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

    // Initial fetch
    fetchStats();
    
    // Set up interval to refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [userRole]); // Removed assignments dependency to avoid too frequent refetches

  console.log(`SharedSidebar: userRole=${userRole}, baseRoute=${baseRoute}`);
  console.log(`SharedSidebar: Todo path=/${baseRoute}/todos, Settings path=/${baseRoute}/settings`);
  console.log('Notification state in sidebar:', { unreadCount, totalNotifications: notifications.length });
  
  // Get pending assignments count for students or pending reviews for teachers
  const assignments = useSelector((state) => state.assignments);
  
  // Calculate pending work based on user role
  const pendingWork = userRole === 'Student'
    ? (stats?.todos || 0) // Use stats API data for consistency
    : (() => {
        // For teachers, use teacherAssignments from redux and calculate pending reviews
        const teacherAssignments = assignments?.teacherAssignments || [];
        console.log('TeacherAssignments in sidebar:', teacherAssignments);
        
        const pendingReviews = teacherAssignments.reduce((total, assignment) => {
          // Filter submissions that are submitted but not graded
          const pendingSubmissions = (assignment.submissions || []).filter(sub => 
            sub.status === 'submitted' && !sub.gradedAt
          );
          console.log(`Assignment ${assignment.title}: ${pendingSubmissions.length} pending submissions`);
          return total + pendingSubmissions.length;
        }, 0);
        
        console.log('Total pending reviews calculated:', pendingReviews);
        
        // Use calculated pending reviews, or fallback to stats if no teacherAssignments loaded
        return teacherAssignments.length > 0 ? pendingReviews : (stats?.assignments || 0);
      })();

  console.log('Classes in SharedSidebar:', classes);
  console.log('Current pathname:', location.pathname);
  console.log('Base route:', baseRoute);
  console.log('Assignments data:', assignments);
  console.log('Stats data:', stats);
  console.log('Pending work count:', pendingWork);
  console.log('User role:', userRole);

  const menuItems = [
    { icon: Home, title: 'Home', path: `/${baseRoute}/home` },
    { 
      icon: Bell, 
      title: 'Notifications', 
      path: `/${baseRoute}/notifications`,
      badge: unreadCount // Use unreadCount from Redux for immediate sync
    },
    { type: 'divider' },
    { 
      icon: CheckSquare, 
      title: 'To-do Work', 
      path: `/${baseRoute}/todos`,
      badge: typeof pendingWork === 'number' ? pendingWork : (Array.isArray(pendingWork) ? pendingWork.length : 0)
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
      path: `/${baseRoute}/settings`
    }
  ];

  // Enhanced Badge component with better styling and animations - inspired by plagiarism report styling
  const Badge = ({ count }) => {
    if (!count || count <= 0) return null;
    
    return (
      <div className="flex items-center justify-center min-w-[24px] h-7 rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-xs font-bold px-2.5 shadow-xl animate-pulse relative border-2 border-white/40">
        <span className="drop-shadow-lg relative z-10">
          {count > 99 ? '99+' : count}
        </span>
        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
      </div>
    );
  };

  const CircleAvatar = ({ initial, isActive }) => (
    <div 
      className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold
        ${isActive ? 'text-white' : 'bg-white'} shadow-lg transition-all duration-300 transform hover:scale-105`}
      style={{ 
        minWidth: '2.25rem', 
        aspectRatio: '1/1',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'white',
        color: isActive ? 'white' : '#1b68b3',
        border: isActive ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid transparent',
        backdropFilter: isActive ? 'blur(10px)' : 'none'
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
        background: 'linear-gradient(180deg, #1b68b3 0%, #164a87 100%)',
        top: '4rem',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="p-6">
        <nav className="space-y-3">
          {menuItems.map((item, index) => (
            item.type === 'divider' ? (
              <hr key={index} className="my-6 border-white/30 border-t-2" />
            ) : item.isDropdown ? (
              <div key={index}>
                <div
                  onClick={() => setIsClassesOpen(!isClassesOpen)}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer
                    hover:bg-white/20 hover:backdrop-blur-sm group`}
                  style={{ color: 'white' }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${!isOpen && !isMobile ? 'mx-auto' : ''} transition-transform duration-200 group-hover:scale-110`}>
                      <item.icon size={22} />
                    </div>
                    <span className={`whitespace-nowrap font-medium ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>
                      {item.title}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="transform transition-transform duration-300 group-hover:rotate-180">
                      {isClassesOpen ? (
                        <ChevronDown size={22} />
                      ) : (
                        <ChevronRight size={22} />
                      )}
                    </div>
                  )}
                </div>
                {/* Enhanced Dropdown items with better animations */}
                <div className={`space-y-2 mt-3 transition-all duration-300 overflow-hidden
                  ${isClassesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {isOpen && item.children?.map((child, childIndex) => {
                    const isSelected = location.pathname === child.path;
                    // Check for any route that includes the class ID (like classwork, discussions, etc.)
                    const isActive = location.pathname.includes(child.path.split('/').pop());
                    
                    return (
                      <Link
                        key={childIndex}
                        to={child.path}
                        className={`flex items-center gap-4 p-3 pl-10 rounded-xl transition-all duration-300 group
                          ${isSelected
                            ? 'bg-white shadow-xl transform scale-[0.98] border-l-4 border-blue-500'
                            : isActive
                              ? 'bg-white/20 text-white backdrop-blur-sm border-l-4 border-white/50'
                              : 'text-white hover:bg-white/15 hover:backdrop-blur-sm hover:border-l-4 hover:border-white/30 border-l-4 border-transparent'
                          }`}
                        style={{ 
                          color: isSelected ? '#1b68b3' : 'white'
                        }}
                      >
                        <CircleAvatar 
                          initial={child.initial} 
                          isActive={!isSelected}
                        />
                        <span className="truncate max-w-[140px] font-medium group-hover:font-semibold transition-all duration-200" title={child.title}>
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
                className={`flex items-center p-4 rounded-xl transition-all duration-300 cursor-pointer group
                  ${location.pathname === item.path
                    ? 'bg-white shadow-xl transform scale-[0.98] border-l-4 border-blue-500'
                    : 'hover:bg-white/20 hover:backdrop-blur-sm border-l-4 border-transparent hover:border-white/30'
                  }`}
                style={{ 
                  color: location.pathname === item.path ? '#1b68b3' : 'white',
                }}
              >
                <Link to={item.path} className="flex items-center justify-between w-full" style={{ color: 'inherit' }}>
                  <div className="flex items-center space-x-4">
                    <div className={`${!isOpen && !isMobile ? 'mx-auto' : ''} transition-transform duration-200 group-hover:scale-110`}>
                      <item.icon size={22} />
                    </div>
                    <span className={`whitespace-nowrap font-medium ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>
                      {item.title}
                    </span>
                  </div>
                  
                  {/* Enhanced badge styling with better positioning */}
                  {isOpen && item.badge > 0 && (
                    <Badge count={item.badge} />
                  )}
                  
                  {/* Enhanced collapsed sidebar indicator */}
                  {!isOpen && !isMobile && item.badge > 0 && (
                    <div className="absolute top-1 right-1 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 shadow-lg animate-pulse z-10"></div>
                      <div className="absolute w-6 h-6 rounded-full bg-red-400/30 animate-ping"></div>
                    </div>
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
