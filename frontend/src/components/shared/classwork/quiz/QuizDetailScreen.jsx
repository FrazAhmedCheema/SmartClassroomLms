import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, Calendar, Clock, User, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const QuizDetailScreen = () => {
  const { id } = useParams();
  const quiz = useSelector((state) => state.quiz?.quizzes?.find(q => q._id === id));
  const [previewAttachment, setPreviewAttachment] = useState(null);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Quiz not found.</p>
      </div>
    );
  }

  // Helper to render preview based on file type
  const renderPreview = (file) => {
    if (file.fileType.startsWith('image/')) {
      return <img src={file.url} alt={file.fileName} className="max-w-full max-h-full" />;
    } else if (file.fileType === 'application/pdf') {
      return (
        <iframe
          src={file.url}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    } else {
      // Use Google Docs Viewer for Office files and others
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-500">
                {quiz.points} points •{' '}
                {quiz.dueDate
                  ? `Due ${format(new Date(quiz.dueDate), 'PPp')}`
                  : 'No due date'}
              </p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="p-2 hover:bg-green-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
          <p className="text-gray-700 mt-2">{quiz.instructions || 'No instructions provided.'}</p>
        </div>

        {/* Quiz Questions */}
        {quiz.questions?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Questions</h2>
            <ul className="mt-2 space-y-3">
              {quiz.questions.map((q, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{q.questionText}</p>
                  {q.options?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {q.options.map((opt, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Attachments */}
        {quiz.attachments?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
            <div className="mt-2 space-y-2">
              {quiz.attachments.map((file, index) => (
                <div
                  key={index}
                  onClick={() => setPreviewAttachment(file)}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  <Paperclip className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{file.fileName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Attachment Modal */}
      <AnimatePresence>
        {previewAttachment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-4 max-w-4xl w-full overflow-auto relative flex flex-col"
              style={{ height: '90vh' }}
            >
              <button
                onClick={() => setPreviewAttachment(null)}
                className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <h3 className="text-xl font-semibold mb-4">{previewAttachment.fileName}</h3>
              <div className="flex-1 flex justify-center items-center overflow-auto">
                {renderPreview(previewAttachment)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizDetailScreen;
