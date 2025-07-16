import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherAssignments } from '../../redux/actions/assignmentActions';
import { Calendar, CheckSquare, AlertCircle, Clock, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';

const TeacherTodo = () => {
  const dispatch = useDispatch();
  const { teacherAssignments, loading } = useSelector((state) => state.assignments);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    console.log('Fetching teacher assignments...');
    dispatch(fetchTeacherAssignments())
      .then((result) => {
        console.log('Teacher assignments fetched:', result);
      })
      .catch((error) => {
        console.error('Error fetching assignments:', error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (teacherAssignments) {
      console.log('Processing teacher assignments:', teacherAssignments);
      
      // Filter assignments that have pending submissions
      const needsReview = teacherAssignments.filter(assignment => {
        const pendingSubmissions = assignment.submissions?.filter(sub => 
          sub.status === 'submitted' && !sub.gradedAt
        ) || [];
        assignment.pendingCount = pendingSubmissions.length;
        return pendingSubmissions.length > 0;
      });

      const totalPendingSubmissions = needsReview.reduce((total, a) => total + a.pendingCount, 0);
      console.log('Total pending submissions in todo:', totalPendingSubmissions);
      
      setPendingReviews(needsReview);
      
      // If we have stats and counts don't match, refetch both stats and assignments
      if (stats && totalPendingSubmissions !== stats.assignments) {
        console.log('Counts mismatch, refetching data...');
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
      const response = await fetch('http://localhost:8080/teacher/stats', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        console.log('Stats data in todo:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      return { text: 'Due soon', color: 'text-amber-500', icon: Clock };
    } else {
      return { text: 'Due in ' + diffDays + ' days', color: 'text-green-500', icon: Calendar };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">To-do Work</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1b68b3]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Reviews */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-[#1b68b3]" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Pending Reviews</h2>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1b68b3] mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading submissions...</p>
                </div>
              ) : !pendingReviews.length ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <CheckSquare className="mx-auto text-gray-400 mb-4" size={32} />
                  <p className="text-gray-500">No submissions waiting for review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((assignment) => {                    
                    return (
                      <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-800 mb-1">{assignment.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{assignment.class.className} • {assignment.class.section}</p>
                        <div className="flex items-center gap-2 text-amber-500">
                          <Users size={16} />
                          <span className="text-sm">{assignment.pendingCount} submissions waiting for review</span>
                        </div>
                        <div className="mt-3">
                          <a 
                            href={`/assignment/${assignment._id}`}
                            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors text-sm font-medium"
                          >
                            Review Work
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-[#1b68b3]" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Deadlines</h2>
              </div>
              
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={32} />
                  <p className="text-gray-500">No upcoming deadlines this week</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.map((assignment) => {
                    const dueStatus = getDueStatus(assignment.dueDate);
                    const DueIcon = dueStatus.icon;
                    
                    return (
                      <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-800 mb-1">{assignment.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{assignment.class.className} • {assignment.class.section}</p>
                        <div className="flex items-center gap-1">
                          <DueIcon className={`${dueStatus.color}`} size={14} />
                          <span className={`text-xs ${dueStatus.color}`}>
                            {dueStatus.text} - {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="mt-3">
                          <a 
                            href={`/assignment/${assignment._id}`}
                            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors text-sm font-medium"
                          >
                            View Assignment
                          </a>
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
  );
};

export default TeacherTodo;
