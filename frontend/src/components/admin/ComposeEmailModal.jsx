import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send } from 'lucide-react';

const ComposeEmailModal = ({ isOpen, onClose, onSend, recipientEmail, recipientName }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSubject('');
      setBody('');
      setIsSending(false);
      setError('');
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body cannot be empty.');
      return;
    }
    setIsSending(true);
    await onSend({ subject, body });
    setIsSending(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Loading Overlay */}
            <AnimatePresence>
              {isSending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg z-50 flex flex-col items-center justify-center"
                >
                  <div className="flex flex-col items-center space-y-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Mail className="w-12 h-12 text-blue-500" />
                    </motion.div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        className="w-3 h-3 bg-blue-500 rounded-full"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ 
                          duration: 0.6, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          delay: 0 
                        }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-blue-500 rounded-full"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ 
                          duration: 0.6, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          delay: 0.2 
                        }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-blue-500 rounded-full"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ 
                          duration: 0.6, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          delay: 0.4 
                        }}
                      />
                    </div>
                    <span className="text-blue-500 font-medium text-lg">Sending your email...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-xl font-semibold text-black">Compose Email</h2>
              <button onClick={onClose} className="text-gray-600 hover:text-black">
                <X size={20} />
              </button>
            </div>

            {/* Recipient */}
            <div className="mb-4">
              <label className="text-sm font-medium text-black">To:</label>
              <input
                type="email"
                value={recipientName}
                disabled
                className="w-full px-4 py-2 mt-1 bg-gray-100 text-black rounded-md border border-gray-300 outline-none"
              />
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="text-sm font-medium text-black">Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject..."
                className="w-full px-4 py-2 mt-1 rounded-md border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="text-sm font-medium text-black">Message:</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message..."
                rows="6"
                className="w-full px-4 py-2 mt-1 rounded-md border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 rounded-md bg-gray-200 text-black hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !subject.trim() || !body.trim()}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComposeEmailModal;
