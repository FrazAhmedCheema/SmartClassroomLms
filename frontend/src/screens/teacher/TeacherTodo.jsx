import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTeacherAssignments } from '../../redux/actions/assignmentActions';
import { Calendar, CheckSquare, AlertCircle, Clock, Users, FileText, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const TeacherTodo = () => {
  // Debug: Always render something first to check if the component mounts
  console.log('TeacherTodo component is rendering...');
  
  const dispatch = useDispatch();
  const { teacherAssignments, loading, error } = useSelector((state) => state.assignments);
  const teacher = useSelector((state) => state.teacher);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  console.log('Loading state:', loading);
  console.log('Error state:', error);
  console.log('TeacherAssignments:', teacherAssignments);
  console.log('Teacher auth state:', teacher);

  useEffect(() => {
    console.log('TeacherTodo: Fetching assignments...');
    
    // Test basic connectivity first
    const testConnectivity = async () => {
      try {
        console.log('Testing backend connectivity...');
        const response = await fetch('http://localhost:8080/teacher/stats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Connectivity test response:', response.status, response.statusText);
        if (response.ok) {
          const data = await response.json();
          console.log('Connectivity test data:', data);
        }
      } catch (error) {
        console.error('Connectivity test failed:', error);
      }
    };
    
    testConnectivity();
    
    dispatch(fetchTeacherAssignments())
      .then((result) => {
        console.log('TeacherTodo: Assignments fetched successfully', result);
      })
      .catch((error) => {
        console.error('TeacherTodo: Error fetching assignments:', error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (teacherAssignments) {
      console.log('Processing teacher assignments:', teacherAssignments);
      
      // Filter assignments that have pending submissions
      const needsReview = teacherAssignments
        .map(assignment => {
          const pendingSubmissions = (assignment.submissions || []).filter(sub => 
            sub.status === 'submitted' && !sub.gradedAt
          );
          const pendingCount = pendingSubmissions.length;
          console.log(`Assignment "${assignment.title}": ${pendingCount} pending submissions`);
          
          // Return a new object with pendingCount instead of mutating the original
          return {
            ...assignment,
            pendingCount
          };
        })
        .filter(assignment => assignment.pendingCount > 0);

      const totalPendingSubmissions = needsReview.reduce((total, a) => total + a.pendingCount, 0);
      console.log('Total pending submissions in todo:', totalPendingSubmissions);
      
      setPendingReviews(needsReview);
      
      // If we have stats and counts don't match significantly, consider refetching
      if (stats && Math.abs(totalPendingSubmissions - stats.assignments) > 2) {
        console.log('Significant count mismatch, refetching data...');
        dispatch(fetchTeacherAssignments());
        fetchStats();
      }

      // Filter assignments with upcoming deadlines
      const upcoming = teacherAssignments.filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7; // Due within a week
      });

      // Sort by due date
      upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      setPendingReviews(needsReview);
      setUpcomingDeadlines(upcoming);
    }
  }, [teacherAssignments, stats, dispatch]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      console.log('Fetching teacher stats...');
      const response = await fetch('http://localhost:8080/teacher/stats', {
        method: 'GET',
        credentials: 'include',  // This is the correct way to send cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Stats response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Stats response data:', result);
      
      if (result.success) {
        setStats(result.data);
        console.log('Stats data in todo:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch stats when component mounts or when assignments change
  useEffect(() => {
    fetchStats();
  }, [teacherAssignments]);

  const getDueStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return { text: 'Due today', color: 'text-red-500', icon: AlertCircle };
    } else if (diffDays <= 3) {
      return { text: 'Due soon', color: 'text-green-500', icon: Clock };
    } else {
      return { text: 'Due in ' + diffDays + ' days', color: 'text-green-500', icon: Calendar };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Standard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 bg-blue-600 rounded-xl p-6 shadow-lg">
            <style> backgroundColor: #1d62d1ff;</style>
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2">To-do Work</h1>
              <p className="text-blue-100 text-lg font-medium">Manage your pending assignments and reviews</p>
            </div>
            <div className="flex items-center space-x-4">
              {stats && (
                <div className="bg-white/20 rounded-xl p-4 shadow-md border border-white/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    <span className="text-lg text-white font-bold flex items-center">
                      <span className="mr-1">{stats.assignments}</span> 
                      <span>pending reviews</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        {loading || statsLoading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md border border-blue-200">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg text-gray-800 font-bold">Loading your todo work...</p>
            <p className="mt-2 text-sm text-gray-600">Fetching assignments and pending reviews</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-8 shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-600 rounded-full shadow">
                <AlertCircle className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-800">Error Loading Todo</h2>
                <p className="text-red-700 mt-1">Failed to load your assignments. Please try refreshing the page.</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-200">
              <p className="text-red-800 font-mono">Error: {error}</p>
            </div>
            <button 
              onClick={() => {
                console.log('Retrying assignment fetch...');
                dispatch(fetchTeacherAssignments());
              }}
              className="mt-5 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-bold shadow-md flex items-center gap-2 mx-auto"
            >
              <AlertCircle size={18} />
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Standard Pending Reviews Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-600 rounded-lg shadow">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pending Reviews</h2>
                  <p className="text-gray-500 font-medium">Assignments waiting for your feedback</p>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-300 mx-auto"></div>
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1b68b3] border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  <p className="text-gray-800 mt-4 font-bold">Loading submissions...</p>
                </div>
              ) : !pendingReviews.length ? (
                <div className="text-center py-12 bg-green-50 rounded-xl border border-dashed border-green-300 shadow">
                  <div className="p-4 bg-green-500 rounded-full w-fit mx-auto mb-4 shadow">
                    <CheckSquare className="text-white" size={32} />
                  </div>
                  <h3 className="font-bold text-green-800 mb-2 text-xl">All caught up!</h3>
                  <p className="text-green-700 font-medium">No submissions waiting for review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((assignment) => {                    
                    return (
                      <div key={assignment._id} className="group border border-blue-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-white">
                        <div className="flex flex-wrap md:flex-nowrap items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors text-lg md:mr-4">{assignment.title}</h3>
                          <div className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow flex items-center gap-2">
                            <span>{assignment.pendingCount} pending</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3 flex items-center gap-2 font-medium px-2 py-1 rounded-md w-fit">
                          <BookOpen size={16} className="text-blue-700" />
                          <span className="font-semibold text-blue-700">{assignment.class.className} • {assignment.class.section}</span>
                        </p>
                        
                        <div className="flex items-center gap-3 text-red-800 bg-red-50 rounded-lg p-3 border border-red-200 mb-4">
                          <Users size={18} className="text-red-700" />
                          <span className="font-bold">{assignment.pendingCount} submissions waiting for review</span>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                          <Link 
                            to={`/assignment/${assignment._id}`}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-bold shadow flex items-center gap-2"
                          >
                            <FileText size={16} />
                            Review Work
                          </Link>
                          <span className="text-sm text-gray-600 font-bold bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                            Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Standard Upcoming Deadlines Section - Same style as Pending Reviews */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-600 rounded-lg shadow">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
                  <p className="text-gray-500 font-medium">Assignments due this week</p>
                </div>
              </div>
              
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-12 bg-green-50 rounded-xl border border-dashed border-green-300 shadow">
                  <div className="p-4 bg-green-500 rounded-full w-fit mx-auto mb-4 shadow">
                    <Calendar className="text-white" size={32} />
                  </div>
                  <h3 className="font-bold text-green-800 mb-2 text-xl">No urgent deadlines</h3>
                  <p className="text-green-700 font-medium">No upcoming deadlines this week</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.map((assignment) => {
                    const dueStatus = getDueStatus(assignment.dueDate);
                    const DueIcon = dueStatus.icon;
                    
                    return (
                      <div key={assignment._id} className="group border border-blue-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-white">
                        <div className="flex flex-wrap md:flex-nowrap items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors text-lg md:mr-4">{assignment.title}</h3>
                          <div className={`px-3 py-1.5 text-white rounded-full text-sm font-bold shadow flex items-center gap-1 ${
                            dueStatus.color.includes('red') ? 'bg-red-500' :
                            dueStatus.color.includes('amber') ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}>
                            <span>{dueStatus.text}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3 flex items-center gap-2 font-medium px-2 py-1 rounded-md w-fit">
                          <BookOpen size={16} className="text-blue-700" />
                          <span className="font-semibold text-blue-700">{assignment.class.className} • {assignment.class.section}</span>
                        </p>
                        
                        <div className="flex items-center gap-3 text-red-800 bg-red-50 rounded-lg p-3 border border-red-200 mb-4">
                          <DueIcon size={18} className="text-red-700" />
                          <span className="font-bold">
                            Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        
                        <div className="mt-3">
                          <Link 
                            to={`/assignment/${assignment._id}`}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-bold shadow flex items-center gap-2 w-fit"
                          >
                            <Calendar size={16} />
                            View Assignment
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TeacherTodo;
