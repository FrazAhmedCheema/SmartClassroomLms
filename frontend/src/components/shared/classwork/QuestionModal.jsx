import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const QuestionModal = ({ question, onClose }) => {
  const renderAnswerOptions = () => {
    if (question.questionType === 'short_answer') {
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 italic">This is a short answer question.</p>
        </div>
      );
    }

    // For poll type questions
    return (
      <div className="mt-4 space-y-3">
        {question.options?.map((option, index) => (
          <div
            key={index}
            className="flex items-center p-3 bg-white border border-gray-200 rounded-lg"
          >
            <span className="mr-3 text-gray-500">{index + 1}.</span>
            <span className="text-gray-900">{option}</span>
          </div>
        ))}
      </div>
    );
  };

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
        <div className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">{question.title}</h3>
          </div>
          <button onClick={onClose} className="text-white hover:bg-purple-700 p-1 rounded">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900">Question</h4>
            <p className="mt-2 text-gray-700">{question.questionText}</p>
          </div>

          {renderAnswerOptions()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionModal;
