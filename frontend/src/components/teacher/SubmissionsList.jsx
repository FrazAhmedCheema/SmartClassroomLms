import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, FileText, Clock } from 'lucide-react';
import axios from 'axios';
import StudentSubmissionDetail from './StudentSubmissionDetail';

const SubmissionsList = ({ assignment, classId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showSubmissionDetail, setShowSubmissionDetail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const submissionsResponse = await axios.get(
          `http://localhost:8080/submission/all/${assignment._id}`,
          { withCredentials: true }
        );

        if (submissionsResponse.data.success) {
          const fetchedSubmissions = submissionsResponse.data.submissions;
          setSubmissions(fetchedSubmissions);

          const uniqueStudents = [];
          const studentMap = {};

          fetchedSubmissions.forEach(sub => {
            if (sub.studentId && !studentMap[sub.studentId._id]) {
              studentMap[sub.studentId._id] = true;
              uniqueStudents.push(sub.studentId);
            }
          });

          setStudents(uniqueStudents);

          const processedSubmissions = fetchedSubmissions.map(submission => ({
            student: submission.studentId,
            submission: submission,
            status: submission.status || 'submitted'
          }));

          setStudentSubmissions(processedSubmissions);
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
  }, [assignment._id]);

  const handleStudentClick = (studentSub) => {
    console.log('Student clicked:', studentSub);
    setSelectedStudent(studentSub);
  };

  const handleBack = () => {
    setSelectedStudent(null);
  };

  const handleGraded = (updatedSubmission) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.student._id === selectedStudent.student._id
          ? { ...sub, submission: updatedSubmission }
          : sub
      )
    );
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
        onGraded={handleGraded}
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
                {/* Status Dot */}
                {studentSub.submission ? (
                  <div 
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      studentSub.submission.status === 'graded' 
                        ? 'bg-green-500' 
                        : 'bg-green-500'
                    }`}
                  />
                ) : (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">{studentSub.student.name}</h3>
                <div className="flex items-center text-sm">
                  {studentSub.submission ? (
                    studentSub.submission.status === 'graded' ? (
                      <span className="text-green-600 font-medium">
                        Grade: {studentSub.submission.grade}/100
                      </span>
                    ) : (
                      <div className="flex items-center text-green-800 font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        Submitted
                      </div>
                    )
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
