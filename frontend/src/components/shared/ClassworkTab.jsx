import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Clock, CheckCircle, Circle, Calendar, AlertCircle, ChevronRight, X, Edit, File, Paperclip } from 'lucide-react';

const ClassworkTab = ({ classData, userRole }) => {
  const isTeacher = userRole === 'Teacher';
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const assignments = [
    {
      id: 1,
      title: 'Introduction to Programming',
      dueDate: '2023-09-15T23:59:00Z',
      topic: 'Foundations',
      points: 100,
      status: 'assigned', // for students: assigned, submitted, graded
      description: 'Complete the programming exercises in Chapter 1. Make sure to test your code with the provided test cases and submit your work as a single zip file.',
      attachments: [
        { name: 'Chapter1_Exercises.pdf', type: 'pdf' }
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
      status: 'assigned',
      description: 'Analyze the time and space complexity of given algorithms.',
      attachments: [
        { name: 'Complexity_Analysis_Template.docx', type: 'word' }
      ]
    },
  ];
  
  const topics = ['All', 'Foundations', 'Data Structures', 'Algorithms', 'Advanced Topics'];
  
  const filteredAssignments = expandedTopic === 'all' 
    ? assignments 
    : assignments.filter(a => a.topic.toLowerCase() === expandedTopic.toLowerCase());

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'assigned':
        return { icon: <Circle size={16} />, text: 'Assigned', color: 'text-amber-600' };
      case 'submitted':
        return { icon: <CheckCircle size={16} />, text: 'Submitted', color: 'text-green-600' };
      case 'graded':
        return { icon: <CheckCircle size={16} />, text: 'Graded', color: 'text-blue-600' };
      case 'late':
        return { icon: <AlertCircle size={16} />, text: 'Late', color: 'text-red-600' };
      default:
        return { icon: <Circle size={16} />, text: 'Assigned', color: 'text-gray-600' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      {/* Assignment Detail Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-[#1b68b3] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedAssignment.title}</h3>
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="text-white hover:bg-white/20 rounded-full p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar size={18} />
                    <span>
                      Due {new Date(selectedAssignment.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">{selectedAssignment.points} pts</div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">{selectedAssignment.description}</p>
                
                {selectedAssignment.attachments?.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
                    {selectedAssignment.attachments.map((attachment, i) => (
                      <div 
                        key={i}
                        className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                      >
                        <div className="p-2 bg-blue-100 rounded-md mr-3">
                          <File className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-blue-600 text-sm font-medium flex-1">{attachment.name}</span>
                        <button className="text-gray-400 hover:text-blue-600">
                          <FileText size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isTeacher && (
                  <div className="mt-6 flex justify-end">
                    <button className="bg-[#1b68b3] hover:bg-[#145091] text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all">
                      <span>Turn In Assignment</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
                
                {isTeacher && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all">
                      <Edit size={18} />
                      <span>Edit</span>
                    </button>
                    <button className="bg-[#1b68b3] hover:bg-[#145091] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow">
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
      {isTeacher && (
        <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setIsCreatingAssignment(true)}
            className="px-4 py-2.5 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow"
          >
            <Plus size={18} />
            Create Assignment
          </button>
          
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent appearance-none bg-white pl-4 pr-10 bg-no-repeat"
            style={{ backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")", 
                     backgroundPosition: "right 0.5rem center", 
                     backgroundSize: "1.5em 1.5em" }}
          >
            <option value="all">Filter by topic</option>
            {topics.slice(1).map((topic) => (
              <option key={topic} value={topic.toLowerCase()}>
                {topic}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Topics navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setExpandedTopic(topic.toLowerCase())}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                expandedTopic === topic.toLowerCase() 
                  ? 'bg-[#1b68b3] text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      
      {/* Assignments list */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 mb-3">
              <FileText size={36} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No assignments in this topic yet</h3>
            <p className="text-gray-500">Check back later or select another topic</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const statusInfo = getStatusInfo(assignment.status);
            
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => handleAssignmentClick(assignment)}
                style={{ borderLeft: '4px solid #1b68b3' }}
              >
                <div className="flex items-start p-5">
                  <div className="mr-4 p-2 rounded-lg" style={{ backgroundColor: 'rgba(27,104,179,0.1)' }}>
                    <FileText size={24} style={{ color: '#1b68b3' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {assignment.title}
                      </h3>
                      <div className="text-sm font-semibold ml-4" style={{ color: '#1b68b3' }}>
                        {assignment.points} pts
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 flex items-center">
                      <Clock size={14} className="mr-1.5" />
                      Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                    <p className="text-gray-700 mt-3 text-sm line-clamp-2 leading-relaxed">
                      {assignment.description}
                    </p>
                    
                    {assignment.attachments?.length > 0 && (
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <Paperclip className="w-4 h-4 mr-1" />
                        <span>{assignment.attachments.length} attachment{assignment.attachments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  {!isTeacher && (
                    <div className="ml-4 text-sm">
                      <div className="flex items-center" style={{ color: statusInfo.color.includes('amber') ? '#d97706' : 
                                                                      statusInfo.color.includes('green') ? '#059669' : 
                                                                      statusInfo.color.includes('blue') ? '#2563eb' : 
                                                                      statusInfo.color.includes('red') ? '#dc2626' : '#6b7280' }}>
                        {statusInfo.icon}
                        <span className="ml-1.5">{statusInfo.text}</span>
                      </div>
                    </div>
                  )}
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
