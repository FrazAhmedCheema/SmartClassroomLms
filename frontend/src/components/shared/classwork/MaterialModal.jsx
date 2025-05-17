import React from 'react';
import { motion } from 'framer-motion';
import { File, Download, X } from 'lucide-react';

const MaterialModal = ({ material, onClose }) => {
  const handleCreateMaterial = async () => {
    const formData = new FormData();
    formData.append('type', 'material'); // Ensure type is sent as 'material'
    formData.append('title', material.title);
    formData.append('description', material.description || ''); // Ensure description is sent

    if (material.attachments) {
      material.attachments.forEach((attachment) => {
        formData.append('attachments', attachment);
      });
    }

    // Call the createClassworkItem action
    // Dispatch logic here...
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
        {/* Modal Header */}
        <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{material.title}</h3>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-gray-700">{material.description || 'No description provided.'}</p>
          {material.attachments?.map((attachment, index) => (
            <div key={index} className="mt-4 flex items-center">
              <File size={16} className="mr-2" />
              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                {attachment.name}
              </a>
              <Download size={16} className="ml-2 text-gray-500" />
            </div>
          ))}
        </div>

        <button onClick={handleCreateMaterial} className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Material
        </button>
      </motion.div>
    </motion.div>
  );
};

export default MaterialModal;
