import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const FAQModal = ({ isOpen, onClose }) => {
  const faqs = [
    {
      question: "How do I get started with SmartClassroom?",
      answer: "Sign up for an account, verify your email, and you can immediately start exploring our platform's features."
    },
    {
      question: "How can I reset my password?",
      answer: "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email to reset your password."
    },
    {
      question: "How can I contact technical support?",
      answer: "You can reach our support team through the Support Center or email us at smartclassroom@gmail.com"
    },
    {
      question: "Is SmartClassroom available on mobile devices?",
      answer: "Yes, SmartClassroom is fully responsive and can be accessed through any modern web browser on your smartphone or tablet."
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-200 pb-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FAQModal;
