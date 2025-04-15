import React from 'react';
import { FileText, Calendar, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const QuizList = ({ quizzes }) => {
  const navigate = useNavigate();

  const formatDueDate = (date) => {
    if (!date) return 'No due date';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          onClick={() => navigate(`/quiz/${quiz._id}`)}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">{quiz.title}</h3>
            </div>
            <div className="text-right">
              {quiz.points > 0 && (
                <span className="text-sm font-medium text-gray-600">
                  {quiz.points} points
                </span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Due {formatDueDate(quiz.dueDate)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizList;
