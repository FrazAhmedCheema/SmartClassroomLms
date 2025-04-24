import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, MessageCircle, File, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasswork, fetchBasicInfo, fetchTopics, deleteAssignment, deleteMaterial, deleteQuestion } from '../../redux/actions/classActions';
import { fetchQuizzes, deleteQuiz } from '../../redux/actions/quizActions';
import { removeClasswork } from '../../redux/slices/classSlice';
import CreateClassworkModal from '../teacher/CreateClassworkModal';
import CreateTopicModal from '../teacher/CreateTopicModal';
import { useNavigate } from 'react-router-dom';

// Import modal components
import AssignmentModal from './classwork/AssignmentModal';
import MaterialModal from './classwork/MaterialModal';
import QuizModal from './classwork/QuizModal';
import QuestionModal from './classwork/QuestionModal';

// Import TeacherControls
import TeacherControls from './classwork/TeacherControls';
import AssignmentDetail from './classwork/AssignmentDetailScreen';

const ClassworkTab = ({ classId, userRole }) => {
  const dispatch = useDispatch();
  const isTeacher = userRole === 'Teacher';
  const [expandedTopic, setExpandedTopic] = useState('all');
  const [selectedClasswork, setSelectedClasswork] = useState(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [topicsMenuOpen, setTopicsMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  // Memoize selectors to avoid unnecessary re-renders
  const classworks = useSelector(state => state.class?.classwork?.data || []);
  const classworkLoading = useSelector(state => state.class?.classwork?.loading);
  const classData = useSelector(state => state.class?.basicInfo?.data);
  const topics = useSelector(state => state.class?.topics?.data || []);
  const quizzes = useSelector(state => state.quiz?.data || []);
  const quizLoading = useSelector(state => state.quiz?.loading);
  const quizError = useSelector(state => state.quiz?.error);

  useEffect(() => {
    if (classId) {
      console.log("Fetching classwork and quizzes for class ID:", classId);
      dispatch(fetchBasicInfo(classId));
      dispatch(fetchTopics(classId));
      dispatch(fetchClasswork(classId));
      dispatch(fetchQuizzes(classId)); // Ensure quizzes are fetched
    }
  }, [dispatch, classId]);

  useEffect(() => {
    if (classData?._id) {
      console.log("Fetching classwork and quizzes for expanded topic:", expandedTopic);
      dispatch(fetchClasswork(classData._id, expandedTopic !== 'all' ? expandedTopic : null));
      dispatch(fetchQuizzes(classData._id)); // Ensure quizzes are fetched for the class
    }
  }, [dispatch, classData, expandedTopic]);

  // Debug logs for quizzes
  useEffect(() => {
    console.log("Quizzes from Redux state:", quizzes);
  }, [quizzes]);

  // Debug logs for Redux state
  const reduxState = useSelector((state) => state);
  useEffect(() => {
    console.log("Complete Redux state:", reduxState);
  }, [reduxState]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setCreateMenuOpen(false);
    if (option.id === 'topic') {
      setIsCreateTopicModalOpen(true);
    } else {
      setCreateModalOpen(true);
    }
  };

  // Add logging to handleClassworkClick
  const handleClassworkClick = (classwork) => {
    console.log('Clicked classwork:', classwork);
    console.log('Classwork type:', classwork.type);
    if (classwork.type === 'quiz') {
      navigate(`/quiz/${classwork._id}`);
    } else if (classwork.type === 'material') {
      console.log('Navigating to material:', classwork._id);
      navigate(`/material/${classwork._id}`);
    } else if (classwork.type === 'question') {
      console.log('Navigating to question:', classwork._id);
      navigate(`/question/${classwork._id}`);
    } else {
      navigate(`/assignment/${classwork._id}`);
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCreateButtonLabel = () => {
    const topic = topics?.find(t => t._id === expandedTopic);
    if (!topic) return 'Create Assignment';

    switch (topic.category) {
      case 'assignment':
        return 'Create Assignment';
      case 'quiz':
        return 'Create Quiz';
      case 'question':
        return 'Create Question';
      case 'material':
        return 'Create Material';
      default:
        return 'Create Assignment';
    }
  };

  const handleCreateButtonClick = () => {
    const topic = topics?.find(t => t._id === expandedTopic);
    if (!topic) {
      setSelectedOption({ id: 'assignment', label: 'Assignment', icon: FileText });
    } else {
      setSelectedOption({ id: topic.category, label: getCreateButtonLabel(), icon: FileText });
    }
    setCreateModalOpen(true);
  };

  const handleDeleteClasswork = async (classworkId, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'quiz') {
          const result = await dispatch(deleteQuiz(classworkId));
          if (result.payload?.success) {
            dispatch(removeClasswork(classworkId));
          } else {
            console.error('Failed to delete quiz:', result.error);
          }
        } else if (type === 'material') {
          const result = await dispatch(deleteMaterial(classworkId));
          if (result.success) {
            console.log('Material deleted successfully');
          } else {
            console.error('Failed to delete material:', result.error);
          }
        } else if (type === 'question') {
          const result = await dispatch(deleteQuestion(classworkId));
          if (result.success) {
            console.log('Question deleted successfully');
          } else {
            console.error('Failed to delete question:', result.error);
          }
        } else {
          const result = await dispatch(deleteAssignment(classworkId));
          if (result.success) {
            console.log('Assignment deleted successfully');
          } else {
            console.error('Failed to delete assignment:', result.error);
          }
        }
      } catch (error) {
        console.error('Error deleting classwork:', error);
      }
    }
  };

  // Memoize derived data
  const allMaterials = useMemo(() => {
    const materials = classworks.filter(item => item.type === 'material');
    console.log('Filtered materials:', materials);
    return materials;
  }, [classworks]);

  const allAssignments = useMemo(() => {
    const assignments = classworks.filter(item => item.type === 'assignment');
    console.log('Filtered assignments:', assignments);
    return assignments;
  }, [classworks]);

  const allQuizzes = useMemo(() => {
    const quizzes = classworks.filter(item => item.type === 'quiz');
    console.log('Filtered quizzes:', quizzes);
    return quizzes;
  }, [classworks]);
  
  const allQuestions = useMemo(() => {
    const questions = classworks.filter(item => item.type === 'question');
    console.log('Filtered questions:', questions);
    return questions;
  }, [classworks]);

  // Add logging to ClassworkItem
  const ClassworkItem = ({ classwork, onClick }) => {
    console.log('Rendering ClassworkItem:', classwork);
    
    const handleOptionClick = (e, action) => {
      e.stopPropagation();
      setActiveDropdown(null);
      
      if (action === 'delete') {
        handleDeleteClasswork(classwork._id, classwork.type);
      } else if (action === 'edit') {
        // TODO: Implement edit functionality
        console.log('Edit clicked for:', classwork._id);
      }
    };

    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-md relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 cursor-pointer" onClick={() => onClick(classwork)}>
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">{classwork.title}</h3>
                <p className="text-sm text-gray-500">
                  Due {formatDueDate(classwork.dueDate)}
                </p>
              </div>
            </div>
          </div>
          
          {isTeacher && (
            <div className="relative ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === classwork._id ? null : classwork._id);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>

              {activeDropdown === classwork._id && (
                <div 
                  className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 min-w-[120px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleOptionClick(e, 'edit')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleOptionClick(e, 'delete')}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleAssignmentSubmit = async (files, privateComment) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      if (privateComment) {
        formData.append('privateComment', privateComment);
      }

      const response = await axios.post(
        `http://localhost:8080/submission/${selectedClasswork._id}/submit`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        alert('Assignment submitted successfully!');
        return response.data;
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit assignment');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 px-4 sm:px-6 bg-gray-50">
      {/* Modals */}
      <AnimatePresence>
        {selectedClasswork && (
          <AssignmentDetail
            assignment={selectedClasswork}
            onClose={() => setSelectedClasswork(null)}
            isTeacher={isTeacher}
            onSubmit={handleAssignmentSubmit}
          />
        )}
      </AnimatePresence>

      {/* Teacher Controls */}
      {isTeacher && (
        <TeacherControls
          createMenuOpen={createMenuOpen}
          setCreateMenuOpen={setCreateMenuOpen}
          topicsMenuOpen={topicsMenuOpen}
          setTopicsMenuOpen={setTopicsMenuOpen}
          createOptions={[
            { id: 'assignment', label: 'Assignment', icon: FileText },
            { id: 'quiz', label: 'Quiz', icon: CheckCircle },
            { id: 'material', label: 'Material', icon: File },
            { id: 'question', label: 'Question', icon: MessageCircle },
            { id: 'topic', label: 'Topic', icon: File }
          ]}
          handleOptionSelect={handleOptionSelect}
          expandedTopic={expandedTopic}
          topics={topics}
          handleTopicSelect={setExpandedTopic}
        />
      )}

      {/* Centered Container */}
      <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-4xl mx-auto relative min-h-[800px]">
        <div className="pb-24 h-full">
          {(classworkLoading || quizLoading) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading classwork...</p>
            </div>
          ) : quizError ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">Error loading quizzes: {quizError}</p>
            </div>
          ) : classworks.length === 0 && quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-2xl font-semibold text-gray-800">No classwork found</h2>
              <p className="text-gray-600 mt-2">There is no classwork in this topic yet.</p>
            </div>
          ) : expandedTopic === 'all' ? (
            <div className="space-y-8 h-full overflow-y-auto">
              {/* Materials Section */}
              {allMaterials && allMaterials.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Lecture Material</h2>
                  <div className="space-y-4">
                    {console.log('Rendering materials section, count:', allMaterials.length)}
                    {allMaterials.map((material) => {
                      console.log('Rendering material item:', material);
                      return (
                        <ClassworkItem
                          key={material._id}
                          classwork={material}
                          onClick={() => handleClassworkClick(material)}
                        />
                      );
                    })}
                  </div>
                </>
              )}

              {/* Assignments Section */}
              {allAssignments && allAssignments.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Assignments</h2>
                  <div className="space-y-4">
                    {allAssignments.map((assignment) => (
                      <ClassworkItem
                        key={assignment._id}
                        classwork={assignment}
                        onClick={() => handleClassworkClick(assignment)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Quizzes Section */}
              {allQuizzes && allQuizzes.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Quizzes</h2>
                  <div className="space-y-4">
                    {allQuizzes.map((quiz) => (
                      <ClassworkItem
                        key={quiz._id}
                        classwork={quiz}
                        onClick={() => handleClassworkClick(quiz)}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Questions Section */}
              {allQuestions && allQuestions.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Questions</h2>
                  <div className="space-y-4">
                    {allQuestions.map((question) => (
                      <ClassworkItem
                        key={question._id}
                        classwork={question}
                        onClick={() => handleClassworkClick(question)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4 h-full overflow-y-auto">
              {classworks.map((classwork) => (
                <ClassworkItem
                  key={classwork._id}
                  classwork={classwork}
                  onClick={() => handleClassworkClick(classwork)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Button */}
        {isTeacher && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleCreateButtonClick}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              {getCreateButtonLabel()}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {createModalOpen && (
        <CreateClassworkModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          option={selectedOption}
          classData={classData}
        />
      )}
      {isCreateTopicModalOpen && (
        <CreateTopicModal
          isOpen={isCreateTopicModalOpen}
          onClose={() => setIsCreateTopicModalOpen(false)}
          classId={classData?._id}
        />
      )}
    </motion.div>
  );
};

export default ClassworkTab;