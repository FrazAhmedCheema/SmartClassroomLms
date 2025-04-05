import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Paperclip, File, Plus, Calendar, Clock, FileText, CheckCircle, MessageCircle, Folder } from 'lucide-react';

const CreateClassworkModal = ({ isOpen, onClose, option, classData }) => {
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    points: '100',
    dueDate: '',
    dueTime: '',
    topic: '',
    questionType: 'short_answer',
    attachments: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onClose();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files]
    });
  };

  const removeAttachment = (index) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments.splice(index, 1);
    setFormData({ ...formData, attachments: updatedAttachments });
  };

  const getFormFields = () => {
    const commonFields = (
      <>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all"
            placeholder={`Enter ${option.label.toLowerCase()} title`}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Instructions</label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all"
            placeholder="Add instructions for students..."
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Attachments</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
              <div className="p-3 bg-blue-50 rounded-full">
                <Paperclip className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Click to upload files</p>
                <p className="text-xs text-gray-500">or drag and drop</p>
              </div>
            </label>
          </div>

          {formData.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <File className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );

    const gradingFields = (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Points</label>
        <div className="relative">
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none"
            min="0"
            max="1000"
            placeholder="100"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">pts</span>
        </div>
      </div>
    );

    const deadlineFields = (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Due Date & Time</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-lg overflow-hidden shadow-sm border border-gray-300 group hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 bg-white text-gray-900 cursor-pointer"
              min={new Date().toISOString().split('T')[0]} // Disallow past dates
              onClick={(e) => e.target.showPicker()} // Show date picker on click
            />
          </div>
          <div className="relative rounded-lg overflow-hidden shadow-sm border border-gray-300 group hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 bg-white text-gray-900 cursor-pointer"
              onClick={(e) => e.target.showPicker()} // Show time picker on click
            />
          </div>
        </div>
        <div className="text-xs text-blue-600 flex items-center">
          <Clock size={14} className="mr-1" />
          {formData.dueDate && formData.dueTime ? (
            <span>Assignment will be due on {new Date(`${formData.dueDate}T${formData.dueTime}`).toLocaleString()}</span>
          ) : (
            <span>Select a date and time for the deadline</span>
          )}
        </div>
      </div>
    );

    const questionFields = (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Question Type</label>
        <select
          value={formData.questionType}
          onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
        >
          <option value="short_answer">Short answer</option>
          <option value="multiple_choice">Multiple choice</option>
          <option value="checkbox">Checkbox</option>
          <option value="dropdown">Dropdown</option>
        </select>
      </div>
    );

    const topicFields = (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Topic Name</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          placeholder="Enter topic name"
          required
        />
      </div>
    );

    const getIcon = () => {
      switch(option.id) {
        case 'assignment': return <FileText className="w-5 h-5" />;
        case 'quiz': return <CheckCircle className="w-5 h-5" />;
        case 'material': return <File className="w-5 h-5" />;
        case 'question': return <MessageCircle className="w-5 h-5" />;
        case 'topic': return <Folder className="w-5 h-5" />;
        default: return <Plus className="w-5 h-5" />;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Creating {option.label}</h3>
            <p className="text-xs text-gray-500">For {classData?.className || 'this class'}</p>
          </div>
        </div>

        {option.id === 'assignment' || option.id === 'quiz' ? (
          <>
            {commonFields}
            {gradingFields}
            {deadlineFields}
          </>
        ) : option.id === 'material' ? (
          commonFields
        ) : option.id === 'question' ? (
          <>
            {commonFields}
            {questionFields}
            {gradingFields}
            {deadlineFields}
          </>
        ) : option.id === 'topic' ? (
          topicFields
        ) : null}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 64px)' }}
          >
            {/* Modal Header - Fixed position */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold">Create {option?.label}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 bg-white hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={22} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Scrollable content */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                {getFormFields()}
              </form>
            </div>

            {/* Modal Footer - Fixed position */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-sm hover:shadow-md"
                >
                  Create {option?.label}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateClassworkModal;