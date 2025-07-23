import React, { useState, useEffect } from 'react';
import { Loader2, Play, Terminal, Code2, CheckCircle, AlertTriangle } from 'lucide-react';

const CodeExecutionProgress = ({ 
  isLoading, 
  executionType = 'batch', // 'batch', 'interactive', 'notebook', 'mern'
  currentStep = '',
  progress = 0,
  onCancel = null 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // Animate progress bar
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(0);
    }
  }, [progress, isLoading]);

  if (!isLoading) return null;

  const getExecutionSteps = () => {
    switch (executionType) {
      case 'notebook':
        return [
          { id: 1, label: 'Preparing', description: 'Setting up notebook environment' },
          { id: 2, label: 'Uploading', description: 'Transferring files to execution server' },
          { id: 3, label: 'Processing', description: 'Executing notebook cells' },
          { id: 4, label: 'Analyzing', description: 'Generating execution report' },
          { id: 5, label: 'Complete', description: 'Execution finished successfully' }
        ];
      case 'interactive':
        return [
          { id: 1, label: 'Analyzing', description: 'Analyzing code structure' },
          { id: 2, label: 'Building', description: 'Creating container environment' },
          { id: 3, label: 'Starting', description: 'Launching interactive session' },
          { id: 4, label: 'Connecting', description: 'Establishing terminal connection' },
          { id: 5, label: 'Ready', description: 'Interactive session is ready' }
        ];
      case 'mern':
        return [
          { id: 1, label: 'Extracting', description: 'Extracting project files' },
          { id: 2, label: 'Installing', description: 'Installing dependencies' },
          { id: 3, label: 'Building', description: 'Building application' },
          { id: 4, label: 'Starting', description: 'Starting development servers' },
          { id: 5, label: 'Running', description: 'Application is running' }
        ];
      default: // batch
        return [
          { id: 1, label: 'Preparing', description: 'Analyzing code structure' },
          { id: 2, label: 'Building', description: 'Creating execution environment' },
          { id: 3, label: 'Executing', description: 'Running code and capturing output' },
          { id: 4, label: 'Processing', description: 'Analyzing execution results' },
          { id: 5, label: 'Complete', description: 'Execution finished successfully' }
        ];
    }
  };

  const steps = getExecutionSteps();
  const currentStepIndex = Math.min(Math.floor((animatedProgress / 100) * steps.length), steps.length - 1);

  const getIcon = () => {
    switch (executionType) {
      case 'notebook':
        return <Code2 className="w-6 h-6" />;
      case 'interactive':
        return <Terminal className="w-6 h-6" />;
      case 'mern':
        return <Play className="w-6 h-6" />;
      default:
        return <Play className="w-6 h-6" />;
    }
  };

  const getTitle = () => {
    switch (executionType) {
      case 'notebook':
        return 'Executing Jupyter Notebook';
      case 'interactive':
        return 'Starting Interactive Session';
      case 'mern':
        return 'Starting MERN Application';
      default:
        return 'Executing Code';
    }
  };

  const getProgressColor = () => {
    if (animatedProgress >= 90) return 'from-green-500 to-green-600';
    if (animatedProgress >= 60) return 'from-blue-500 to-blue-600';
    if (animatedProgress >= 30) return 'from-yellow-500 to-yellow-600';
    return 'from-blue-400 to-blue-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <div className="text-white animate-pulse">
              {getIcon()}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{getTitle()}</h3>
          <p className="text-gray-600 text-sm">
            {currentStep || steps[currentStepIndex]?.description || 'Processing...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>{Math.round(animatedProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out relative overflow-hidden`}
              style={{ width: `${animatedProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 transform ${
                  index <= currentStepIndex 
                    ? 'bg-blue-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 text-gray-500 scale-100'
                } ${index === currentStepIndex ? 'animate-bounce' : ''}`}>
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : index === currentStepIndex ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`text-xs mt-2 text-center max-w-16 transition-all duration-500 ${
                  index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
            {/* Progress line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0">
              <div 
                className="h-full bg-blue-600 transition-all duration-700"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Step Details */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-blue-600 rounded-full">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 text-sm">
                {steps[currentStepIndex]?.label || 'Processing'}
              </h4>
              <p className="text-blue-600 text-xs">
                {steps[currentStepIndex]?.description || 'Please wait...'}
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Button (if provided) */}
        {onCancel && (
          <div className="text-center mb-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-white-600 hover:text-whitep-800 text-sm font-medium transition-all duration-200 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Estimated Time */}
        <div className="text-center text-xs text-gray-500">
          <span>
            Estimated time: {
              animatedProgress < 20 ? '15-30 seconds' :
              animatedProgress < 50 ? '10-20 seconds' :
              animatedProgress < 80 ? '5-10 seconds' :
              'Almost done...'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodeExecutionProgress;
