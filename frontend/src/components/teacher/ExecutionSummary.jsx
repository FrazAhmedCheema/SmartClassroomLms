import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ExecutionSummary = ({ summaryData, onClearSummary }) => {
  if (!summaryData || !Array.isArray(summaryData) || summaryData.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-800 text-gray-300 rounded-lg shadow-md">
        <p className="flex items-center"><Info size={18} className="mr-2 text-blue-400" /> No execution summary available or output was not analyzable.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-gray-900 text-gray-200 rounded-lg shadow-xl border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-gray-100">Execution Summary & Analysis</h4>
        {onClearSummary && (
            <button 
                onClick={onClearSummary}
                className="text-xs text-gray-400 hover:text-gray-200 underline"
            >
                Clear Summary
            </button>
        )}
      </div>
      <div className="space-y-6">
        {summaryData.map((item, index) => (
          <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700/50 shadow-lg">
            <div className="flex items-center mb-3 pb-2 border-b border-gray-700">
              <FileText size={20} className="mr-3 text-blue-400" />
              <h5 className="text-lg font-semibold text-gray-100">{item.fileName || 'Unknown File'}</h5>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium
                ${item.status === 'Success' ? 'bg-green-500/20 text-green-300' : ''}
                ${item.status === 'Compilation Failed' ? 'bg-red-500/20 text-red-300' : ''}
                ${item.status === 'Runtime Error' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                ${item.status === 'Success with Warnings' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                ${!item.status || item.status === 'Unknown' ? 'bg-gray-500/20 text-gray-300' : ''}
              `}>
                {item.status || 'Unknown'}
              </span>
            </div>

            {item.description && (
              <p className="text-sm text-gray-400 mb-2 italic">"{item.description}"</p>
            )}

            {item.output && item.output.trim() !== "" && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Program Output:</p>
                <pre className="text-sm p-3 bg-black/50 rounded-md whitespace-pre-wrap font-mono text-gray-300 max-h-40 overflow-y-auto">
                  {item.output.trim()}
                </pre>
              </div>
            )}
            
            {!item.output && item.status !== "Compilation Failed" && (
                 <p className="text-sm text-gray-500 mb-2 italic">No explicit output captured for this program.</p>
            )}


            {item.errors && item.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-red-400 mb-1 font-semibold">Errors Encountered:</p>
                <ul className="space-y-2">
                  {item.errors.map((err, errIdx) => (
                    <li key={errIdx} className="p-2 bg-red-900/30 rounded-md border border-red-700/50">
                      <p className="text-sm text-red-300"><strong>{err.type || 'Error'}:</strong> {err.message}</p>
                      {err.explanation && <p className="text-xs text-red-400 mt-1"><em>AI Explanation: {err.explanation}</em></p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionSummary;
