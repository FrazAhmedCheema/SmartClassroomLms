import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const QuestionModal = ({ question, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{question.title}</h3>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p>{question.content || 'No question content provided.'}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionModal;
