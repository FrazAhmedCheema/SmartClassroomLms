import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, Calendar, Paperclip, X, User, Check, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchClasswork } from '../../../redux/actions/classActions';
import axios from 'axios';

const QuestionDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const question = useSelector((state) =>
    state.class?.classwork?.data?.find((q) => q._id === id && q.type === 'question')
  );
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state for initial fetch
  const studentAuth = useSelector(state => state.student);
  const isStudent = studentAuth.isAuthenticated;
  const isTeacher = useSelector(state => state.teacher.isAuthenticated);
  const [allAnswers, setAllAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true
  });

  // Fetch question data if not found in Redux store
  useEffect(() => {
    if (!question && id) {
      // Try to fetch the class data if the question is not found
      const classId = localStorage.getItem('currentClassId');
      if (classId) {
        dispatch(fetchClasswork(classId));
      }
    }
  }, [id, question, dispatch]);

  // Fetch student's previous answer if any
  useEffect(() => {
    const checkPreviousAnswer = async () => {
      if (!isStudent || !question?._id || !studentAuth.studentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log(`Checking for previous answers for question ${question._id}`);
        const response = await api.get(`/question/item/${question._id}/answers`);
        console.log("Response.data ||||||||||||||||||||||||||  : " , response.data);
        if (response.data.success) {
          const myAnswer = response.data.answers.find(a => 
            a.studentId._id === studentAuth.studentId
          );
          
          if (myAnswer) {
            console.log("Found existing answer:", myAnswer);
            setSubmittedAnswer(myAnswer.answer);
            
            // Set the appropriate UI state based on question type
            if (question.questionType === 'poll') {
              setSelectedOption(parseInt(myAnswer.answer));
              // Fetch poll results for poll questions
              fetchPollResults();
            } else {
              setAnswer(myAnswer.answer);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching previous answers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkPreviousAnswer();
  }, [question, studentAuth.studentId, isStudent]);

  // Function to fetch poll results
  const fetchPollResults = async () => {
    if (!question || question?.questionType !== 'poll') return;
    
    try {
      console.log(`Fetching poll results for question ${question._id}`);
      const response = await api.get(`/question/item/${question._id}/results`);
      if (response.data.success) {
        console.log("Poll results fetched:", response.data);
        setPollResults(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };

  // Fetch poll results for teachers
  useEffect(() => {
    if (isTeacher && question?.questionType === 'poll') {
      fetchPollResults();
    }
  }, [question, isTeacher]);

  // Update useEffect to fetch poll results when needed
  useEffect(() => {
    if (question?.questionType === 'poll' && (submittedAnswer !== null || isTeacher)) {
      fetchPollResults();
    }
  }, [question, submittedAnswer, isTeacher]);

  // Add a new useEffect to fetch all student answers when viewed by a teacher
  useEffect(() => {
    const fetchAllStudentAnswers = async () => {
      if (!isTeacher || !question?._id) return;
      
      setLoadingAnswers(true);
      try {
        const response = await api.get(`/question/item/${question._id}/answers`);
        if (response.data.success) {
          console.log("All student answers:", response.data.answers);
          setAllAnswers(response.data.answers);
        }
      } catch (error) {
        console.error('Error fetching student answers:', error);
      } finally {
        setLoadingAnswers(false);
      }
    };
    
    fetchAllStudentAnswers();
  }, [question?._id, isTeacher]);

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading question...</p>
      </div>
    );
  }

  const renderPreview = (file) => {
    if (file.fileType.startsWith('image/')) {
      return <img src={file.url} alt={file.fileName} className="max-w-full max-h-full" />;
    } else if (file.fileType === 'application/pdf') {
      return (
        <iframe
          src={file.url}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    } else {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    }
  };

  const renderQuestionOptions = () => {
    // Show loading indicator while checking for previous answers
    if (loading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          <p className="ml-2 text-gray-600">Loading your response...</p>
        </div>
      );
    }

    if (question.questionType === 'short_answer') {
      // Teacher view for short answer questions
      if (isTeacher) {
        return (
          <div className="space-y-6">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Students will provide a text answer to this question
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Responses ({allAnswers.length})</h3>
              
              {loadingAnswers ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                  <p className="ml-2 text-gray-600">Loading student answers...</p>
                </div>
              ) : allAnswers.length > 0 ? (
                <div className="space-y-4">
                  {allAnswers.map((answer, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{answer.studentName || 'Anonymous Student'}</span>
                        <span className="text-xs text-gray-500">
                          • {format(new Date(answer.submittedAt), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200" style={{color:"black"}}>
                        {answer.answer}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No responses yet</p>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      // Student view for short answer questions
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg mt-2">
          <p className="text-sm text-gray-500 italic">Students will provide a text answer.</p>
          
          {submittedAnswer ? (
            // When student has already submitted an answer
            <div className="mt-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                <p className="text-green-700 flex items-center font-medium">
                  <span className="mr-2">✓</span>
                  Your answer has been submitted successfully and cannot be changed.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Your answer:</h3>
                <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {submittedAnswer}
                </p>
              </div>
            </div>
          ) : (
            // When student hasn't submitted an answer yet
            <div className="mt-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                rows={4}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || submitLoading}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {submitLoading ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          )}
        </div>
      );
    }

    // For poll type questions
    const validOptions = question.options.filter(option => option.trim() !== '');
    
    return (
      <div className="mt-4 space-y-4">
        {submittedAnswer !== null && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 flex items-center font-medium">
              <span className="mr-2">✓</span>
              Your vote has been submitted successfully! Your selection cannot be changed.
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          {validOptions.map((option, index) => (
            <div key={index}>
              <div 
                onClick={() => !submittedAnswer && setSelectedOption(index)}
                className={`flex items-center p-3 border rounded-lg ${
                  submittedAnswer ? 'cursor-default' : 'cursor-pointer'
                } transition-colors ${
                  selectedOption === index 
                    ? 'bg-purple-50 border-purple-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`w-5 h-5 mr-3 rounded-full flex items-center justify-center ${
                  selectedOption === index 
                    ? 'bg-purple-500 text-white' 
                    : 'border border-gray-300'
                }`}>
                  {selectedOption === index && '✓'}
                </div>
                <span className="text-gray-900">{option}</span>

                {/* Only show poll results after voting or for teachers */}
                {(submittedAnswer || isTeacher) && pollResults && (
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500" 
                        style={{ 
                          width: `${
                            pollResults.find(r => Number(r.optionIndex) === index)?.percentage || 0
                          }%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {pollResults.find(r => Number(r.optionIndex) === index)?.votes || 0} votes
                      ({Math.round(pollResults.find(r => Number(r.optionIndex) === index)?.percentage || 0)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {isStudent && !submittedAnswer && (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null || submitLoading}
            className={`w-full px-6 py-2 bg-purple-600 text-white rounded-lg transition-colors ${
              selectedOption === null || submitLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-purple-700'
            }`}
          >
            {submitLoading ? 'Submitting...' : 'Submit Vote'}
          </button>
        )}

        {isTeacher && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900">Poll Summary</h3>
            <p className="text-sm text-blue-700 mt-1">
              Total Responses: {pollResults?.reduce((sum, opt) => sum + (opt?.votes || 0), 0) || 0}
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleSubmitAnswer = async () => {
    if (!isStudent || submitLoading || submittedAnswer !== null) return;
    
    setSubmitLoading(true);
    try {
      const answerText = question.questionType === 'poll' ? 
        selectedOption.toString() : 
        answer.trim();

      const studentName = studentAuth.name;

      const response = await api.post(`/question/item/${question._id}/answer`, {
        answer: answerText,
        studentName
      });

      if (response.data.success) {
        setSubmittedAnswer(answerText);
        
        // Fetch updated poll results immediately after submitting an answer
        if (question.questionType === 'poll') {
          fetchPollResults();
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      if (error.response?.status === 400 && error.response.data.message?.includes('already submitted')) {
        setSubmittedAnswer(error.response.data.submittedAnswer || answer);
        if (question.questionType === 'poll') {
          fetchPollResults();
        }
      } else {
        alert('Failed to submit answer');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{question.title}</h1>
              <p className="text-sm text-gray-500">
                {question.points > 0 ? `${question.points} points • ` : ''}
                {question.dueDate
                  ? `Due ${format(new Date(question.dueDate), 'PPp')}`
                  : 'No due date'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Description */}
        {question.description && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Description</h2>
            <p className="text-gray-700 mt-2">{question.description}</p>
          </div>
        )}

        {/* Question */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Question</h2>
          <p className="text-gray-700 mt-2 font-medium">{question.questionText}</p>
          
          {renderQuestionOptions()}
        </div>

        {/* Attachments */}
        {question.attachments?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
            <div className="mt-2 space-y-2">
              {question.attachments.map((file, index) => (
                <div
                  key={index}
                  onClick={() => setPreviewAttachment(file)}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  <Paperclip className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{file.fileName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Attachment Modal */}
      <AnimatePresence>
        {previewAttachment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-4 max-w-4xl w-full relative flex flex-col"
              style={{ height: '90vh' }}
            >
              <button
                onClick={() => setPreviewAttachment(null)}
                className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <h3 className="text-xl font-semibold mb-4">{previewAttachment.fileName}</h3>
              <div className="flex-1 flex justify-center items-center overflow-auto">
                {renderPreview(previewAttachment)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionDetailScreen;
