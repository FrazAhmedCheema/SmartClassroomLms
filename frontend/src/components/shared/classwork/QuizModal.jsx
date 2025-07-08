import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

const QuizModal = ({ quiz, onClose }) => {
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
        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{quiz.title}</h3>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p>{quiz.instructions || 'No instructions provided.'}</p>
          <div className="mt-4 space-y-2">
            <p className="flex items-center">
              <CheckCircle size={16} className="inline-block mr-2 text-green-600" />
              {quiz.questions.length} Questions
            </p>
            {quiz.points > 0 && (
              <p className="flex items-center">
                <CheckCircle size={16} className="inline-block mr-2 text-green-600" />
                {quiz.points} Points
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizModal;
