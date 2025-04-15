import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Clock, User, Paperclip, X, Upload, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const AssignmentDetail = ({ assignment, isTeacher, onClose, onSubmit }) => {
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(files);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return format(new Date(date), 'PPP p');
  };

  if (!assignment) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">{assignment.title}</h2>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <span>{assignment.points} points</span>
                {assignment.dueDate && (
                  <>
                    <span>•</span>
                    <span>Due {format(new Date(assignment.dueDate), 'PPp')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-700">{assignment.instructions}</p>
              </div>

              {/* Attachments */}
              {assignment.attachments?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Attachments</h3>
                  <div className="space-y-2">
                    {assignment.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <Paperclip className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{file.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {!isTeacher && (
                  <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                      Add or create
                    </button>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Due</h3>
                  <p className="text-sm text-gray-900 mt-1">
                    {assignment.dueDate
                      ? format(new Date(assignment.dueDate), 'PPp')
                      : 'No due date'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Points</h3>
                  <p className="text-sm text-gray-900 mt-1">{assignment.points}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssignmentDetail;
