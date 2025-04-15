import React from 'react';
import { FileText, Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AssignmentList = ({ assignments, onAssignmentClick }) => {
  const getSubmissionStatus = (assignment) => {
    // TODO: Add real submission status logic
    return {
      submitted: false,
      late: false
    };
  };

  const formatDueDate = (date) => {
    if (!date) return 'No due date';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const status = getSubmissionStatus(assignment);
        
        return (
          <div
            key={assignment._id}
            onClick={() => onAssignmentClick(assignment)}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer p-4 border border-gray-200"
          >
            <div className="flex items-start gap-4">
              {/* Left Icon */}
              <div className="p-2 bg-blue-50 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                    {/* Description removed */}
                  </div>
                  
                  {/* Status & Points */}
                  <div className="flex flex-col items-end">
                    {status.submitted ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle size={16} className="mr-1" />
                        Turned in
                      </span>
                    ) : status.late ? (
                      <span className="flex items-center text-red-600 text-sm">
                        <XCircle size={16} className="mr-1" />
                        Missing
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-600 text-sm">
                        <Clock size={16} className="mr-1" />
                        Assigned
                      </span>
                    )}
                    {assignment.points > 0 && (
                      <span className="text-sm text-gray-600 mt-1">
                        {assignment.points} points
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  {assignment.dueDate && (
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Due {formatDueDate(assignment.dueDate)}
                    </span>
                  )}
                  <span className="flex items-center">
                    <User size={14} className="mr-1" />
                    {assignment.createdBy?.name || 'Teacher'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssignmentList;
