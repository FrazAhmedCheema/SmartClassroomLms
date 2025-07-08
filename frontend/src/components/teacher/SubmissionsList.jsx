import React, { useState, useEffect } from 'react';
import { Loader2, User, Clock } from 'lucide-react';
import axios from 'axios';
import StudentSubmissionDetail from './StudentSubmissionDetail';

const SubmissionsList = ({ assignment, classId, submissionType = 'assignment' }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const endpoint = submissionType === 'quiz'
          ? `/submission/all/quiz/${assignment._id}`
          : `/submission/all/${assignment._id}`;

        const submissionsResponse = await axios.get(
          `http://localhost:8080${endpoint}`,
          { withCredentials: true }
        );

        if (submissionsResponse.data.success) {
          setSubmissions(submissionsResponse.data.submissions);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError('Failed to load submissions data');
        setLoading(false);
      }
    };

    if (assignment._id) {
      fetchData();
    }
  }, [assignment._id, submissionType]);

  const handleStudentClick = (studentSub) => {
    setSelectedStudent(studentSub);
  };

  const handleBack = () => {
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <StudentSubmissionDetail
        student={selectedStudent.student}
        submission={selectedStudent.submission}
        assignment={assignment}
        onBack={handleBack}
        submissionType={submissionType} // Pass submission type
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 overflow-hidden">
      <div className="p-6 bg-blue-50 border-b border-blue-200">
        <h2 className="text-xl font-bold text-gray-800">Student Submissions</h2>
        <p className="text-gray-600 mt-1">
          {submissions.filter(s => s.submission).length} of {submissions.length} students have submitted
        </p>
      </div>

      <div className="divide-y divide-blue-100">
        {submissions.map((studentSub) => (
          <div
            key={studentSub.student._id}
            onClick={() => handleStudentClick(studentSub)}
            className={`p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors ${
              studentSub.submission?.status === 'graded'
                ? 'border-l-4 border-l-green-500'
                : studentSub.submission
                ? 'border-l-4 border-l-blue-500'
                : 'border-l-4 border-l-red-500'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {studentSub.student.profilePicture ? (
                    <img
                      src={studentSub.student.profilePicture}
                      alt={studentSub.student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{studentSub.student.name}</h3>
                <div className="flex items-center space-x-2 text-sm">
                  {studentSub.submission ? (
                    <>
                      {studentSub.submission.status === 'graded' ? (
                        <span className="text-green-600 font-medium">
                          Grade: {studentSub.submission.grade}/{assignment?.points || 100}
                        </span>
                      ) : (
                        <div className="flex items-center text-green-800 font-medium">
                          <Clock className="w-4 h-4 mr-1" />
                          Submitted
                        </div>
                      )}
                      {/* Late submission label */}
                      {studentSub.submission.isLate && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Late
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-red-500 font-medium">Missing</span>
                  )}
                </div>
              </div>
            </div>

            {studentSub.submission && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {studentSub.submission.files?.length || 0} files
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionsList;
