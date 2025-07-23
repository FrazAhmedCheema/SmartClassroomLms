import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAssignments } from '../../redux/actions/assignmentActions';
import { Calendar, CheckSquare, AlertCircle, Clock, Users, FileText, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const StudentTodo = () => {
  const dispatch = useDispatch();
  const { loading, error, assignments } = useSelector((state) => state.assignments);
  const student = useSelector((state) => state.student);
  const [pendingWork, setPendingWork] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  useEffect(() => {
    if (assignments) {
      // Filter assignments where student has not submitted yet
      const pendingAssignments = assignments.filter(assignment => {
        const hasSubmission = assignment.submission && assignment.submission._id;
        const isDueInFuture = new Date(assignment.dueDate) > new Date();
        
        // Show if no submission and due date hasn't passed
        return !hasSubmission && isDueInFuture;
      });

      // Sort by due date - closest first
      pendingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setPendingWork(pendingAssignments);

      // Filter assignments with upcoming deadlines (due within a week)
      const upcoming = assignments.filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const hasSubmission = assignment.submission && assignment.submission._id;
        
        return !hasSubmission && diffDays > 0 && diffDays <= 7; // Due within a week and not submitted
      });

      // Sort by due date
      upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setUpcomingDeadlines(upcoming);
    }
  }, [assignments]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('http://localhost:8080/student/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch stats when component mounts
  useEffect(() => {
    fetchStats();
  }, []);

  const getDueStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return { text: 'Due today', color: 'text-red-500', icon: AlertCircle };
    } else if (diffDays <= 3) {
      return { text: 'Due soon', color: 'text-amber-500', icon: Clock };
    } else {
      return { text: 'Upcoming', color: 'text-green-500', icon: Calendar };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Simple Elegant Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="text-blue-600" size={20} />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">To-do Work</h1>
                </div>
                <p className="text-gray-600 text-lg">Review pending assignments and student submissions</p>
              </div>
              
              {stats && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{stats.todos}</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Pending Reviews</div>
                      <div className="text-lg font-semibold text-gray-900">{stats.todos} assignments</div>
                    </div>
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
            <p className="mt-2 text-sm text-gray-600">Fetching assignments and pending tasks</p>
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
                dispatch(fetchAssignments());
              }}
              className="mt-5 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-bold shadow-md flex items-center gap-2 mx-auto"
            >
              <AlertCircle size={18} />
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Work Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-600 rounded-lg shadow">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pending Assignments</h2>
                  <p className="text-gray-500 font-medium">Assignments waiting for your submission</p>
                </div>
              </div>
              
              {!pendingWork.length ? (
                <div className="text-center py-16 relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_70%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.08),transparent_60%)]"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="relative mb-6">
                      <div className="p-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl w-fit mx-auto shadow-lg shadow-emerald-500/25">
                        <CheckSquare className="text-white" size={36} />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"></div>
                    </div>
                    <h3 className="font-bold text-emerald-800 mb-3 text-2xl">All caught up!</h3>
                    <p className="text-emerald-700 text-lg font-medium mb-4">No pending assignments to complete</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      You're all set for now!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingWork.map((work) => {
                    const dueStatus = getDueStatus(work.dueDate);
                    const DueIcon = dueStatus.icon;
                    
                    return (
                      <div key={work._id} className="group border border-blue-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-white">
                        <div className="flex flex-wrap md:flex-nowrap items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors text-lg md:mr-4">{work.title}</h3>
                          <div className={`px-4 py-2 text-white rounded-full text-sm font-bold shadow flex items-center gap-2 ${
                            dueStatus.color.includes('red') ? 'bg-red-500' :
                            dueStatus.color.includes('amber') ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}>
                            <span>{dueStatus.text}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3 flex items-center gap-2 font-medium px-2 py-1 rounded-md w-fit">
                          <BookOpen size={16} className="text-blue-700" />
                          <span className="font-semibold text-blue-700">{work.class?.className || work.classId?.className} • {work.class?.section || work.classId?.section}</span>
                        </p>
                        
                        <div className="flex items-center gap-3 text-blue-800 bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                          <DueIcon size={18} className="text-blue-700" />
                          <span className="font-bold">Due: {format(new Date(work.dueDate), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        <div className="mt-4">
                          <Link 
                            to={`/assignment/${work._id}`}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-bold shadow flex items-center gap-2 w-fit"
                          >
                            <FileText size={16} />
                            Start Work
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines Section */}
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
                <div className="text-center py-16 relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.1),transparent_70%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.08),transparent_60%)]"></div>
                  
                  {/* Floating icons */}
                  <div className="absolute top-8 left-8 w-6 h-6 bg-blue-200 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="absolute top-12 right-12 w-4 h-4 bg-indigo-300 rounded-full opacity-40 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-12 left-12 w-5 h-5 bg-purple-200 rounded-full opacity-50 animate-bounce" style={{animationDelay: '1s'}}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="relative mb-6">
                      <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl w-fit mx-auto shadow-lg shadow-blue-500/25">
                        <Calendar className="text-white" size={36} />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <CheckSquare className="text-white" size={12} />
                      </div>
                    </div>
                    <h3 className="font-bold text-blue-800 mb-3 text-2xl">No urgent deadlines</h3>
                    <p className="text-blue-700 text-lg font-medium mb-4">No upcoming deadlines this week</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Take your time and plan ahead
                    </div>
                  </div>
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
                          <span className="font-semibold text-blue-700">{assignment.class?.className || assignment.classId?.className} • {assignment.class?.section || assignment.classId?.section}</span>
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

export default StudentTodo;
