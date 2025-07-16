import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments } from '../../redux/actions/assignmentActions';
import { Calendar, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const StudentTodo = () => {
  const dispatch = useDispatch();
  const { assignments, loading } = useSelector((state) => state.assignments);
  const [pendingWork, setPendingWork] = useState([]);

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  useEffect(() => {
    if (assignments) {
      // Filter assignments that are not submitted and not past due date
      const pendingAssignments = assignments.filter(assignment => {
        const isSubmitted = assignment.submission && assignment.submission.status === 'submitted';
        const isDueDate = new Date(assignment.dueDate) > new Date();
        return !isSubmitted && isDueDate;
      });

      // Sort by due date - closest first
      pendingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">To-do Work</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1b68b3]"></div>
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
                          <a 
                            href={`/assignment/${work._id}`}
                            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors text-sm font-medium"
                          >
                            View Work
                          </a>
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
