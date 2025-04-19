import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Paperclip, File, Plus, Calendar, Clock, FileText, CheckCircle, MessageCircle, Folder, Trash2 } from 'lucide-react';
import { createClassworkItem } from '../../redux/actions/classActions';

const CreateClassworkModal = ({ isOpen, onClose, option, classData }) => {
  const dispatch = useDispatch();
  const teacherId = useSelector(state => state.teacher.teacherId);
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    points: '100',
    dueDate: '',
    dueTime: '',
    topic: '',
    questionType: 'short_answer',
    attachments: [],
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    allowMultipleAnswers: false
  });
  const [errors, setErrors] = useState({});

  const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
      <div className="text-red-500 text-sm mt-1 flex items-center">
        <span className="mr-1">•</span>
        <span>{message}</span>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});
    
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    if (!teacherId) {
      setErrors({ submit: 'Teacher not authenticated. Please log in again.' });
      return;
    }

    const payload = {
      title: formData.title.trim(),
      instructions: formData.instructions?.trim() || '',
      description: formData.instructions?.trim() || '',
      type: option.id,
      points: Number(formData.points) || 0,
      createdBy: teacherId
    };

    if (option.id === 'question') {
      payload.questionText = formData.questionText;
      payload.questionType = formData.questionType;
      
      if (formData.questionType !== 'short_answer') {
        payload.options = formData.options.filter(opt => opt.trim() !== '');
        payload.correctAnswer = formData.correctAnswer;
        payload.allowMultipleAnswers = formData.allowMultipleAnswers;
      }
    }

    if (formData.dueDate && formData.dueTime) {
      try {
        payload.dueDate = new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString();
      } catch (error) {
        setErrors({ dueDate: 'Invalid date format' });
        return;
      }
    }

    if (formData.topic) {
      payload.topicId = formData.topic;
    }

    const formDataPayload = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formDataPayload.append(`${key}[${index}]`, item);
          });
        } else if (typeof value === 'object' && value !== null) {
          formDataPayload.append(key, JSON.stringify(value));
        } else {
          formDataPayload.append(key, value);
        }
      }
    });

    formData.attachments.forEach((file) => {
      formDataPayload.append('attachments', file);
    });

    try {
      const result = await dispatch(createClassworkItem(classData._id, formDataPayload));
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setErrors({ submit: error.message });
    }
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

  const handleAddOption = () => {
    if (formData.options.length < 8) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      });
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const handleCorrectAnswerChange = (index) => {
    if (formData.questionType === 'multiple_choice' && !formData.allowMultipleAnswers) {
      setFormData({
        ...formData,
        correctAnswer: index.toString()
      });
    } else if (formData.questionType === 'multiple_choice' && formData.allowMultipleAnswers) {
      const currentAnswers = formData.correctAnswer ? formData.correctAnswer.split(',') : [];
      const isSelected = currentAnswers.includes(index.toString());
      
      const newAnswers = isSelected
        ? currentAnswers.filter(a => a !== index.toString())
        : [...currentAnswers, index.toString()];
      
      setFormData({
        ...formData,
        correctAnswer: newAnswers.join(',')
      });
    }
  };

  const isOptionCorrect = (index) => {
    if (formData.questionType === 'multiple_choice' && !formData.allowMultipleAnswers) {
      return formData.correctAnswer === index.toString();
    } else if (formData.questionType === 'multiple_choice' && formData.allowMultipleAnswers) {
      const currentAnswers = formData.correctAnswer ? formData.correctAnswer.split(',') : [];
      return currentAnswers.includes(index.toString());
    }
    return false;
  };

  const getFormFields = () => {
    const commonFields = (
      <>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:ring-2 focus:border-blue-500 bg-white text-gray-900 transition-all`}
            placeholder={`Enter ${option.label.toLowerCase()} title`}
            required
          />
          <ErrorMessage message={errors.title} />
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
              min={new Date().toISOString().split('T')[0]}
              onClick={(e) => e.target.showPicker()}
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
              onClick={(e) => e.target.showPicker()}
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
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Question Text</label>
          <textarea
            value={formData.questionText}
            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="Enter your question here..."
          />
        </div>

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

        {formData.questionType === 'short_answer' ? (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-500 italic">Students will provide a text answer.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Answer Options</label>
              {formData.questionType === 'multiple_choice' && (
                <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border border-gray-100">
                  <input
                    type="checkbox"
                    id="allowMultipleAnswers"
                    checked={formData.allowMultipleAnswers}
                    onChange={(e) => setFormData({...formData, allowMultipleAnswers: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500 bg-white"
                  />
                  <label htmlFor="allowMultipleAnswers" className="text-xs text-gray-600">
                    Allow multiple answers
                  </label>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {formData.questionType === 'multiple_choice' && (
                    <div 
                      onClick={() => handleCorrectAnswerChange(index)}
                      className={`w-5 h-5 flex-shrink-0 rounded-full border cursor-pointer flex items-center justify-center ${
                        isOptionCorrect(index) 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {isOptionCorrect(index) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  )}
                  {formData.questionType === 'checkbox' && (
                    <div className="w-5 h-5 flex-shrink-0 border border-gray-300 rounded"></div>
                  )}
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {formData.options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center space-x-1 text-blue-600 text-sm bg-white px-2 py-1 rounded"
              >
                <Plus size={16} />
                <span>Add option</span>
              </button>
            )}
            
            <p className="text-xs text-gray-500">
              {formData.questionType === 'multiple_choice' ? (
                formData.allowMultipleAnswers
                  ? 'Click on circles to select the correct answers.'
                  : 'Click on a circle to select the correct answer.'
              ) : formData.questionType === 'checkbox' ? (
                'Students can select multiple options.'
              ) : 'Students will select one option from a dropdown.'
              }
            </p>
          </div>
        )}
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

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                {getFormFields()}
              </form>
            </div>

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