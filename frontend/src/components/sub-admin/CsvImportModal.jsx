import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

const CsvImportModal = ({ isOpen, onClose, apiEndpoint, entityType, onImportSuccess }) => {
  const { isAuthenticated } = useSelector(state => state.subAdminAuth);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
  const [infoMessage, setInfoMessage] = useState('');
  const fileInputRef = useRef(null); // Ref for file input
  const [showSuccess, setShowSuccess] = useState(false);

  // Updated CSV validation function with domain and name checks
  const validateCSVContent = (csvText) => {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    if (!lines.length) return "CSV file is empty.";
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeader = ["name", "registrationid", "email"];
    if (header.length !== expectedHeader.length || !expectedHeader.every((col, idx) => col === header[idx])) {
      return "CSV header does not match expected format: name, registrationId, email.";
    }
    // Extract sub-admin domain from local storage
    const subAdminUsername = localStorage.getItem('subAdminUsername');
    let subAdminDomain = '';
    if (subAdminUsername && subAdminUsername.includes('@')) {
      subAdminDomain = subAdminUsername.split('@')[1].toLowerCase().trim();
    }
    const seenRegIds = new Set();
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      if (row.length !== expectedHeader.length) return `Row ${i+1} does not have the correct number of columns.`;
      const [name, regId, email] = row;
      if (!name || !regId || !email) {
        return `Row ${i+1} has empty fields.`;
      }
      // Validate name contains only alphabets (and spaces)
      if (!/^[A-Za-z\s]+$/.test(name)) {
        return `Row ${i+1} has invalid name. Only alphabets are allowed.`;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return `Row ${i+1} contains an invalid email address.`;
      }
      const emailDomain = email.split('@')[1].toLowerCase().trim();
      if (subAdminDomain && emailDomain !== subAdminDomain) {
        return `Row ${i+1} email domain (${emailDomain}) does not match allowed domain (${subAdminDomain}).`;
      }
      if (seenRegIds.has(regId)) {
        return `Duplicate registration ID "${regId}" found in row ${i+1}.`;
      }
      seenRegIds.add(regId);
    }
    return null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    // Validate file extension
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Invalid file format. Please select a CSV file.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError('');
    setUploadProgress(0); // Reset progress when a new file is selected
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setUploadProgress(0); // Reset progress
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  // Add this helper function
  const csvToTableHTML = (csvText) => {
    const lines = csvText.trim().split(/\r?\n/);
    let tableHTML = `<table style="width:100%; border-collapse: collapse;">`;
    lines.forEach((line, index) => {
      const cells = line.split(',');
      const rowTag = index === 0 ? 'th' : 'td';
      tableHTML += `<tr>`;
      cells.forEach((cell) => {
        tableHTML += `<${rowTag} style="border: 1px solid #ccc; padding: 8px; text-align: left;">${cell.trim()}</${rowTag}>`;
      });
      tableHTML += `</tr>`;
    });
    tableHTML += `</table>`;
    return tableHTML;
  };

  const handlePreviewClick = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target.result;
        const tableHTML = csvToTableHTML(content);
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              ${tableHTML}
            </body>
          </html>
        `);
        newWindow.document.close();
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(10); // Start progress
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const content = evt.target.result;
        setUploadProgress(30); // Update progress after file read
        
        const subAdminUsername = localStorage.getItem('subAdminUsername');
        const subAdminDomain = subAdminUsername ? subAdminUsername.split('@')[1] : '';
        
        setUploadProgress(50); // Update progress before API call
        const response = await fetch(`${apiEndpoint}/import-${entityType.toLowerCase()}s`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            data: content,
            role: entityType.toLowerCase(),
            domain: subAdminDomain
          }),
        });

        setUploadProgress(80); // Update progress after API call

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Import failed');
        }

        setUploadProgress(100); // Complete progress
        setShowSuccess(true); // Show success animation
        
        // Show success message
        setInfoMessage(`Successfully imported ${entityType}s`);
        
        // Call the success callback
        if (onImportSuccess) {
          await onImportSuccess(result.data);
        }

        // Reset states after longer delay to show success animation
        setTimeout(() => {
          setFile(null);
          setIsSubmitting(false);
          setUploadProgress(0);
          setInfoMessage('');
          setShowSuccess(false);
          onClose();
        }, 2500); // Increased delay to show success animation

      } catch (error) {
        console.error('Import error:', error);
        setError(error.message || 'Failed to import data');
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setIsSubmitting(false);
      setUploadProgress(0);
    };

    reader.readAsText(file);
  };

  // Add this effect to clear file state when modal is closed
  useEffect(() => {
    if (!isAuthenticated) {
      onClose();
      return;
    }

    if (!isOpen) {
      setFile(null);
      setUploadProgress(0);
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, isAuthenticated, onClose]);

  if (!isOpen) return null;

  // Add Success Overlay component
  const SuccessOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 10 }}
          className="relative"
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 bg-green-500 rounded-full opacity-20"
          />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Complete!</h3>
          <p className="text-green-600">
            Successfully imported {entityType}s
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-70">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Import CSV</h2>
          <button 
            onClick={onClose} 
            aria-label="Close modal" 
            disabled={isSubmitting}
            className={`focus:outline-none ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-800'}`}
          >
            <X className="w-6 h-6 text-gray-200" />
          </button>
        </div>
        
        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && <SuccessOverlay />}
        </AnimatePresence>

        {/* Modal Content */}
        <div className="p-6">
          {/* File Input */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isSubmitting} // file input is disabled while uploading
            className="w-full text-sm text-gray-700 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-600 focus:outline-none"
          />
          
          {/* Clickable File Preview */}
          {file && (
            <div className="mt-4 cursor-pointer" onClick={handlePreviewClick}>
              <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 p-3 rounded-lg">
                <span className="text-sm text-gray-800 truncate">{file.name}</span>
                <button onClick={handleRemoveFile} aria-label="Remove file" disabled={isSubmitting}>
                  <Trash2 className={`w-5 h-5 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'text-red-700 hover:text-red-700'}`} />
                </button>
              </div>
              
              {/* Progress Bar and Info Message */}
              {uploadProgress > 0 && (
                <>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {infoMessage && <p className="mt-2 text-sm text-gray-700">{infoMessage}</p>}
                </>
              )}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-5 py-2 bg-white text-gray-800 border border-gray-300 rounded-md 
                          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isSubmitting || !file}
              style={{ backgroundColor: '#1b68b3' }}
              className="px-5 py-2 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? `Uploading... ${uploadProgress}%` : `Import ${entityType}s`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CsvImportModal;
