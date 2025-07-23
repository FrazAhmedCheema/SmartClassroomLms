import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAssignments } from '../../redux/actions/assignmentActions';
import { Calendar, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const                 {pendingWork.length === 0 && !loading ? (
                  <div className="text-center py-12 bg-blue-50 rounded-xl border border-dashed border-blue-300 shadow">
                    <div className="p-4 bg-blue-500 rounded-full w-fit mx-auto mb-4 shadow">
                      <CheckSquare className="text-white" size={32} />
                    </div>
                    <h3 className="font-bold text-blue-800 mb-2 text-xl">Generating test data...</h3>
                    <p className="text-blue-700 font-medium">
                      No assignments found. Showing test data for development purposes.
                    </p>
                    <button 
                      onClick={generateTestData}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      Refresh Test Data
                    </button>
                  </div>
                ) : (do = () => {
  const dispatch = useDispatch();
  const { assignments, loading, error } = useSelector((state) => state.assignments);
  const [pendingWork, setPendingWork] = useState([]);

  // Debug logging
  console.log('StudentTodo component is rendering...');
  console.log('Loading state:', loading);
  console.log('Error state:', error);
  console.log('Assignments:', assignments);

  useEffect(() => {
    console.log('StudentTodo: Fetching assignments...');
    dispatch(fetchAssignments())
      .then(() => {
        console.log('StudentTodo: Assignments fetched successfully');
      })
      .catch((error) => {
        console.error('StudentTodo: Error fetching assignments:', error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (assignments) {
      console.log('StudentTodo: Processing assignments:', assignments);
      // Filter assignments that are not submitted and not past due date
      const pendingAssignments = assignments.filter(assignment => {
        const isSubmitted = assignment.submission && assignment.submission.status === 'submitted';
        const isDueDate = new Date(assignment.dueDate) > new Date();
        return !isSubmitted && isDueDate;
      });

      // Sort by due date - closest first
      pendingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      console.log('StudentTodo: Pending assignments count:', pendingAssignments.length);
      setPendingWork(pendingAssignments);
    }
  }, [assignments]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Debug info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800">Debug Info:</h3>
          <p>Loading: {loading ? 'true' : 'false'}</p>
          <p>Error: {error || 'none'}</p>
          <p>Assignments: {assignments ? assignments.length : 'null'}</p>
          <p>Pending Work: {pendingWork.length}</p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">To-do Work</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1b68b3]"></div>
            <p className="ml-4">Loading assignments...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-red-500" size={24} />
              <h2 className="text-xl font-semibold text-red-700">Error Loading Todo</h2>
            </div>
            <p className="text-red-600">Failed to load your assignments. Please try refreshing the page.</p>
            <p className="text-red-600 text-sm mt-2">Error: {error}</p>
            <button 
              onClick={() => {
                console.log('Retrying assignment fetch...');
                dispatch(fetchAssignments());
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckSquare className="text-[#1b68b3]" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Pending Assignments</h2>
              </div>
              
              {pendingWork.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <CheckSquare className="mx-auto text-gray-400 mb-4" size={40} />
                  <p className="text-gray-500 text-lg">You're all caught up! No pending assignments.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingWork.map((work) => {
                    const dueStatus = getDueStatus(work.dueDate);
                    const DueIcon = dueStatus.icon;
                    
                    return (
                      <div key={work._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">{work.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{work.class.className} • {work.class.section}</p>
                            <div className="flex items-center gap-1">
                              <DueIcon className={`${dueStatus.color}`} size={14} />
                              <span className={`text-xs ${dueStatus.color}`}>
                                {dueStatus.text} - Due {format(new Date(work.dueDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </div>
                          <Link 
                            to={`/assignment/${work._id}`}
                            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors text-sm font-medium"
                          >
                            View Work
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentTodo;
