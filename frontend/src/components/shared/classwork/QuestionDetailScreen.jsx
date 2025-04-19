import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, Calendar, Clock, MessageCircle, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const question = useSelector((state) =>
    state.class?.classwork?.data?.find((q) => q._id === id && q.type === 'question')
  );

  const [previewAttachment, setPreviewAttachment] = useState(null);

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Question not found.</p>
      </div>
    );
  }

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

  const renderQuestionOptions = () => {
    if (question.questionType === 'short_answer') {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg mt-2">
          <p className="text-sm text-gray-500 italic">Students will provide a text answer.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-2">
        {question.options.map((option, index) => (
          <div key={index} className={`flex items-center p-3 ${
            question.correctAnswer.includes(index.toString()) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          } border rounded-lg`}>
            {question.questionType === 'multiple_choice' && (
              <div className={`w-5 h-5 mr-3 rounded-full flex items-center justify-center ${
                question.correctAnswer.includes(index.toString()) ? 'bg-green-500 text-white' : 'border border-gray-300'
              }`}>
                {question.correctAnswer.includes(index.toString()) && '✓'}
              </div>
            )}
            {question.questionType === 'checkbox' && (
              <div className={`w-5 h-5 mr-3 rounded flex items-center justify-center ${
                question.correctAnswer.includes(index.toString()) ? 'bg-green-500 text-white' : 'border border-gray-300'
              }`}>
                {question.correctAnswer.includes(index.toString()) && '✓'}
              </div>
            )}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{question.title}</h1>
              <p className="text-sm text-gray-500">
                {question.points > 0 ? `${question.points} points • ` : ''}
                {question.dueDate
                  ? `Due ${format(new Date(question.dueDate), 'PPp')}`
                  : 'No due date'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Description */}
        {question.description && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Description</h2>
            <p className="text-gray-700 mt-2">{question.description}</p>
          </div>
        )}

        {/* Question */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Question</h2>
          <p className="text-gray-700 mt-2 font-medium">{question.questionText}</p>
          
          {renderQuestionOptions()}
        </div>

        {/* Attachments */}
        {question.attachments?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
            <div className="mt-2 space-y-2">
              {question.attachments.map((file, index) => (
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
              className="bg-white rounded-lg p-4 max-w-4xl w-full relative flex flex-col"
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

export default QuestionDetailScreen;
