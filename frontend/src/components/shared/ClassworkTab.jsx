import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Clock, CheckCircle, Circle, Calendar, 
  AlertCircle, ChevronRight, X, Edit, File, Paperclip, 
  MessageCircle, Folder, Download 
} from 'lucide-react';
import CreateClassworkModal from '../teacher/CreateClassworkModal';

const ClassworkTab = ({ classData, userRole }) => {
  const isTeacher = userRole === 'Teacher';
  const [expandedTopic, setExpandedTopic] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Sample assignments data
  const assignments = [
    {
      id: 1,
      title: 'Introduction to Programming',
      dueDate: '2023-09-15T23:59:00Z',
      topic: 'Foundations',
      points: 100,
      status: 'assigned',
      description: 'Complete the programming exercises in Chapter 1. Make sure to test your code with the provided test cases and submit your work as a single zip file.',
      attachments: [
        { name: 'Chapter1_Exercises.pdf', type: 'pdf' },
        { name: 'SampleCode.zip', type: 'zip' }
      ]
    },
    {
      id: 2,
      title: 'Data Structures Quiz',
      dueDate: '2023-09-20T23:59:00Z',
      topic: 'Data Structures',
      points: 50,
      status: 'submitted',
      description: 'Quiz covering basic data structures like arrays, linked lists, and stacks.',
    },
    {
      id: 3,
      title: 'Algorithm Analysis Assignment',
      dueDate: '2023-09-25T23:59:00Z',
      topic: 'Algorithms',
      points: 150,
      status: 'graded',
      description: 'Analyze the time and space complexity of given algorithms.',
      attachments: [
        { name: 'Complexity_Analysis_Template.docx', type: 'word' }
      ]
    },
  ];
  
  const topics = ['All', 'Foundations', 'Data Structures', 'Algorithms', 'Advanced Topics'];
  
  // Filter assignments based on selected topic
  const filteredAssignments = expandedTopic === 'all' 
    ? assignments 
    : assignments.filter(a => a.topic.toLowerCase() === expandedTopic.toLowerCase());

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  // Get status information for display
  const getStatusInfo = (status) => {
    const statusMap = {
      assigned: { icon: <Circle size={16} />, text: 'Assigned', color: 'text-amber-500 bg-amber-50' },
      submitted: { icon: <CheckCircle size={16} />, text: 'Submitted', color: 'text-green-500 bg-green-50' },
      graded: { icon: <CheckCircle size={16} />, text: 'Graded', color: 'text-blue-500 bg-blue-50' },
      late: { icon: <AlertCircle size={16} />, text: 'Late', color: 'text-red-500 bg-red-50' },
    };
    return statusMap[status] || statusMap.assigned;
  };

  // Create options for teacher
  const createOptions = [
    { id: 'assignment', label: 'Assignment', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: CheckCircle },
    { id: 'material', label: 'Material', icon: File },
    { id: 'question', label: 'Question', icon: MessageCircle },
    { id: 'topic', label: 'Topic', icon: Folder }
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setCreateMenuOpen(false);
    setCreateModalOpen(true);
  };

  // Teacher controls component with improved styling
  const TeacherControls = () => (
    <div style={{
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      backgroundColor: 'white',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(229, 231, 235, 0.8)'
    }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setCreateMenuOpen(!createMenuOpen)}
          style={{
            padding: '0.625rem 1.25rem',
            background: 'linear-gradient(to right, #2563eb, #1e40af)',
            color: 'white',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
            border: 'none',
            outline: 'none',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #1e3a8a)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.35)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #1e40af)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(37, 99, 235, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={16} />
          Create
        </button>
        
        {/* Dropdown Menu */}
        <AnimatePresence>
          {createMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.5rem',
                width: '200px',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                padding: '0.25rem 0',
                zIndex: 50
              }}
            >
              {createOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'white',
                    border: 'none',
                    borderBottom: '1px solid #f3f4f6',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#374151';
                  }}
                >
                  <option.icon size={18} style={{ color: '#2563eb' }} />
                  <span style={{ fontWeight: '500', fontSize: '0.875rem', color: '#374151' }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <select 
        value={expandedTopic}
        onChange={(e) => setExpandedTopic(e.target.value)}
        style={{
          maxWidth: '240px',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          padding: '0.625rem 2.5rem 0.625rem 1rem',
          backgroundColor: 'white',
          appearance: 'none',
          backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")", 
          backgroundPosition: "right 0.5rem center", 
          backgroundSize: "1.5em 1.5em",
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#4b5563',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease'
        }}
      >
        <option value="all">All Topics</option>
        {topics.slice(1).map((topic) => (
          <option key={topic} value={topic.toLowerCase()}>
            {topic}
          </option>
        ))}
      </select>
    </div>
  );

  // Format date for display
  const formatDueDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="py-6 px-4 sm:px-6 bg-gray-50"
    >
      {/* Assignment Detail Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{selectedAssignment.title}</h3>
                  <div className="flex flex-wrap items-center mt-2 gap-x-4 gap-y-2 text-sm text-blue-100">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1.5" />
                      Due {formatDueDate(selectedAssignment.dueDate)}
                    </span>
                    <span className="flex items-center">
                      <FileText size={16} className="mr-1.5" />
                      {selectedAssignment.points} points
                    </span>
                    {!isTeacher && (
                      <span className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusInfo(selectedAssignment.status).color}`}>
                        {getStatusInfo(selectedAssignment.status).icon}
                        <span className="ml-1.5">{getStatusInfo(selectedAssignment.status).text}</span>
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="text-white/80 hover:text-white rounded-full p-1 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Assignment Details</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedAssignment.description}
                    </p>
                  </div>
                  
                  {selectedAssignment.attachments?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Attachments ({selectedAssignment.attachments.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedAssignment.attachments.map((attachment, i) => (
                          <div 
                            key={i}
                            className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                          >
                            <div className="p-2 bg-blue-100 rounded-lg mr-3 flex-shrink-0">
                              <File className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-800 font-medium truncate">{attachment.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {attachment.type.toUpperCase()} file • Click to download
                              </p>
                            </div>
                            <button className="text-gray-400 hover:text-blue-600 p-2">
                              <Download size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                {!isTeacher ? (
                  <div className="flex justify-end">
                    <button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all shadow-md hover:shadow-lg">
                      <span>Turn In Assignment</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button className="order-2 sm:order-1 border border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all hover:bg-gray-50">
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button className="order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                      View Submissions
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher controls */}
      {isTeacher && <TeacherControls />}
      
      {/* Create Classwork Modal */}
      {createModalOpen && (
        <CreateClassworkModal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setSelectedOption(null);
          }}
          option={selectedOption}
          classData={classData}
        />
      )}

      {/* Topics navigation with improved styling */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setExpandedTopic(topic.toLowerCase())}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                expandedTopic === topic.toLowerCase() 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200'
              }`}
              style={{
                boxShadow: expandedTopic === topic.toLowerCase() ? 
                  '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)' : 
                  '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      
      {/* Assignments list with improved styling */}
      <div className="space-y-5">
        {filteredAssignments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, #f9fafb 0%, #ffffff 100%)'
            }}
          >
            <div className="text-gray-300 mb-4">
              <FileText size={56} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No assignments found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {expandedTopic === 'all' 
                ? "There are no assignments in this class yet." 
                : `There are no assignments in the ${expandedTopic} topic yet.`}
            </p>
            {isTeacher && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-medium inline-flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Plus size={16} />
                Create Assignment
              </button>
            )}
          </motion.div>
        ) : (
          filteredAssignments.map((assignment, index) => {
            const statusInfo = getStatusInfo(assignment.status);
            
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
                onClick={() => handleAssignmentClick(assignment)}
                style={{ 
                  borderLeft: '4px solid #1d4ed8',
                  transform: 'translateY(0)',
                  transition: 'all 0.2s ease'
                }}
                whileHover={{
                  y: -3,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-start p-5">
                  <div className="mr-4 p-3 rounded-lg group-hover:bg-blue-100 transition-colors" 
                       style={{ backgroundColor: 'rgba(239, 246, 255, 0.8)' }}>
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                          {assignment.points} pts
                        </div>
                        {!isTeacher && (
                          <span className={`px-2.5 py-1 rounded-full text-xs flex items-center ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="ml-1.5">{statusInfo.text}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 flex items-center">
                      <Clock size={14} className="mr-1.5 flex-shrink-0" />
                      <span>Due {formatDueDate(assignment.dueDate)}</span>
                    </div>
                    <p className="text-gray-700 mt-3 text-sm line-clamp-2 leading-relaxed">
                      {assignment.description}
                    </p>
                    
                    {assignment.attachments?.length > 0 && (
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <Paperclip size={14} className="mr-1.5 flex-shrink-0" />
                        <span>{assignment.attachments.length} attachment{assignment.attachments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default ClassworkTab;