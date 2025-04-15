import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, MessageCircle, File, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasswork, fetchBasicInfo, fetchTopics } from '../../redux/actions/classActions';
import { fetchQuizzes } from '../../redux/actions/quizActions';
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
import AssignmentDetail from './classwork/AssignmentDetail';

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
      dispatch(fetchBasicInfo(classId));
      dispatch(fetchTopics(classId));
      dispatch(fetchClasswork(classId));
      dispatch(fetchQuizzes(classId));
    }
  }, [dispatch, classId]);

  useEffect(() => {
    if (classData?._id) {
      dispatch(fetchClasswork(classData._id, expandedTopic !== 'all' ? expandedTopic : null));
      dispatch(fetchQuizzes(classData._id));
    }
  }, [dispatch, classData, expandedTopic]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setCreateMenuOpen(false);
    if (option.id === 'topic') {
      setIsCreateTopicModalOpen(true);
    } else {
      setCreateModalOpen(true);
    }
  };

  const handleClassworkClick = (classwork) => {
    if (classwork.type === 'quiz') {
      navigate(`/quiz/${classwork._id}`);
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

  // Memoize derived data to avoid unnecessary re-renders
  const allAssignments = useMemo(() => classworks.filter(item => item.type !== 'quiz'), [classworks]);
  const allQuizzes = useMemo(() => quizzes, [quizzes]);

  const ClassworkItem = ({ classwork, onClick }) => {
    const formatDate = (date) => {
      if (!date) return 'No due date';
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div
        onClick={() => onClick(classwork)}
        className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-all shadow-sm hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">{classwork.title}</h3>
            </div>
          </div>
          <div className="text-right">
            {classwork.points > 0 && (
              <span className="text-sm font-medium text-gray-600">
                {classwork.points} points
              </span>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Due {formatDate(classwork.dueDate)}
            </p>
          </div>
        </div>
      </div>
    );
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
              {allAssignments && allAssignments.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Assignments</h2>
                  <div className="space-y-4">
                    {allAssignments.map((classwork) => (
                      <ClassworkItem
                        key={classwork._id}
                        classwork={classwork}
                        onClick={() => handleClassworkClick(classwork)}
                      />
                    ))}
                  </div>
                </>
              )}
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

      {/* Create Modals */}
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