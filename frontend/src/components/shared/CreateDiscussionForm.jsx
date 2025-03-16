import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const CreateDiscussionForm = ({ 
  newTopic, 
  setNewTopic, 
  newMessage, 
  setNewMessage, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white p-4 rounded-xl mb-6"
    >
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Enter topic title"
          className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
          required
        />
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write your first message"
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent resize-none bg-gray-50 text-gray-900 placeholder-gray-500"
          rows={4}
          required
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors"
          >
            Create Topic
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateDiscussionForm;
