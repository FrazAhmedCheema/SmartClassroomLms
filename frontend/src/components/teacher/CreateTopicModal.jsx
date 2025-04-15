import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createTopic } from '../../redux/actions/classActions';

const CreateTopicModal = ({ isOpen, onClose, classId }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('assignment');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !category || !classId) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(createTopic(classId, { name, category }));
      if (result.success) {
        alert('Topic created successfully');
        setName('');
        setCategory('assignment');
        onClose();
      } else {
        throw new Error(result.error || 'Failed to create topic');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      alert(error.message || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'assignment', label: 'Assignment' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'question', label: 'Question' },
    { value: 'material', label: 'Material' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto relative overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Folder className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Create New Topic</h3>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="space-y-2">
                <label htmlFor="topic-name" className="block text-sm font-medium text-gray-700">
                  Topic Name
                </label>
                <input
                  id="topic-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter topic name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="topic-category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="topic-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Topic'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateTopicModal;
