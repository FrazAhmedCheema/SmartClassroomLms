import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Download, ExternalLink } from 'lucide-react';

const JupyterResultsScreen = ({ htmlContent, fileName, onClose, isOpen }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const downloadNotebook = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.ipynb', '')}_output.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    const newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    setIsFullscreen(false);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center transition-all duration-300 ${
      isFullscreen ? 'p-0' : 'p-4'
    }`}>
      <div className={`bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen 
          ? 'w-full h-full rounded-none' 
          : isMinimized 
            ? 'w-96 h-16'
            : 'w-11/12 h-5/6 max-w-7xl'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-semibold ml-4">
              📊 {fileName} - Notebook Results
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadNotebook}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Download HTML"
            >
              <Download size={18} />
            </button>
            <button
              onClick={openInNewTab}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink size={18} />
            </button>
            <button
              onClick={toggleMinimize}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isMinimized ? "Restore" : "Minimize"}
            >
              <Minimize2 size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 p-0 overflow-hidden bg-gray-50">
            <iframe
              srcDoc={htmlContent}
              title={`Jupyter Notebook Results: ${fileName}`}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              style={{
                minHeight: isFullscreen ? '100vh' : '600px'
              }}
            />
          </div>
        )}

        {/* Footer Info (only when minimized) */}
        {isMinimized && (
          <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-600">
            <span>Notebook execution completed successfully</span>
            <button
              onClick={toggleMinimize}
              className="text-blue-600 hover:text-blue-800"
            >
              Click to restore
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JupyterResultsScreen;
