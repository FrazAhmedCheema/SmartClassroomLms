import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, Calendar, Clock, User, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const AssignmentDetailScreen = () => {
  const { id } = useParams();
  const assignments = useSelector((state) => state.class.classwork.data);
  const assignment = assignments.find((a) => a._id === id);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Assignment not found.</p>
      </div>
    );
  }

  // Helper to render preview based on fileType
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
    } else if (
      file.fileType === 'application/msword' ||
      file.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.fileType === 'text/csv' ||
      file.fileType === 'application/vnd.ms-powerpoint' ||
      file.fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      // Use Google Docs Viewer to embed the file
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    } else {
      return <p className="text-gray-700">Preview not available for this file type.</p>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{assignment.title}</h1>
              <p className="text-sm text-gray-500">
                {assignment.points} points •{' '}
                {assignment.dueDate
                  ? `Due ${format(new Date(assignment.dueDate), 'PPp')}`
                  : 'No due date'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
          <p className="text-gray-700 mt-2">{assignment.instructions || 'No instructions provided.'}</p>
        </div>

        {/* Attachments */}
        {assignment.attachments?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
            <div className="mt-2 space-y-2">
              {assignment.attachments.map((file, index) => (
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

        {/* Additional Content */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Additional Features</h2>
          <p className="text-gray-500 mt-2">You can add more features here later.</p>
        </div>
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
              // Updated: set fixed height, flex-col and flex-1 for preview area
              className="bg-white rounded-lg p-4 max-w-4xl w-full relative flex flex-col"
              style={{ height: '90vh' }}  // Force 90% viewport height
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

export default AssignmentDetailScreen;
