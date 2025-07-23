// import React, { useState } from 'react';
// import { Shield, AlertTriangle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
// import PlagiarismReportModal from './PlagiarismReportModal';
// import axios from 'axios';

// const PlagiarismCheckButton = ({ assignmentId, assignmentTitle }) => {
//   const [isChecking, setIsChecking] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [reportReady, setReportReady] = useState(false);
//   const [submissions, setSubmissions] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Helper function to find student name from the original submissions data
//   const findStudentNameFromSubmissions = (plagiarismSubmission, allSubmissions) => {
//     // Extract student ID from filename pattern
//     const fileNameMatch = plagiarismSubmission.filename?.match(/student_([a-f0-9]+)_/);
//     if (!fileNameMatch) return null;
    
//     const studentId = fileNameMatch[1];
//     const submission = submissions.find(s => s.studentId?._id === studentId);
//     return submission?.studentId?.name || null;
//   };

//   // Helper function to extract student names from submission
//   const getStudentName = (submission) => {
//     return submission?.studentName || 'Unknown Student';
//   };
  
//   // Helper to extract name from filename as last resort
//   const extractNameFromFileName = (filename) => {
//     if (!filename) return null;
//     const match = filename.match(/student_[a-f0-9]+_([^/]+)/);
//     return match ? match[1].replace(/_/g, ' ') : null;
//   };

//   const formatSubmissionId = (submissionId) => {
//     if (!submissionId) return 'Unknown';
//     // Just show first 6 characters of the ID for brevity
//     return `Student ${submissionId.slice(0, 6)}...`;
//   };

//   const handlePlagiarismCheck = async () => {
//     setIsChecking(true);
//     setError(null);
//     setResult(null);
//     setReportReady(false);

//     try {
//       // Fetch submissions data first
//       const submissionsResponse = await axios.get(
//         `http://localhost:8080/submission/all/${assignmentId}`,
//         { withCredentials: true }
//       );

//       if (submissionsResponse.data.success) {
//         console.log('Received submissions data:', submissionsResponse.data);
//         setSubmissions(submissionsResponse.data.submissions || []);
//       }

//       // Initial check
//       const response = await axios.post(
//         `http://localhost:8080/api/plagiarism/check/${assignmentId}`,
//         {},
//         { withCredentials: true }
//       );

//       if (response.data.success) {
//         // Wait a moment and then fetch the results
//         await new Promise(resolve => setTimeout(resolve, 2000));
        
//         // Fetch results
//         const resultsResponse = await axios.get(
//           `http://localhost:8080/api/plagiarism/results/${assignmentId}`,
//           { withCredentials: true }
//         );

//         if (resultsResponse.data.success) {
//           const report = resultsResponse.data.report;
//           console.log('Full Plagiarism API Response:', resultsResponse.data);
//           console.log('Received plagiarism report:', report);
//           console.log('Report overview:', report.overview);
          
//           // Process similarity data from overview
//           const submissions = report.overview?.submissions || [];
//           console.log('Detailed submissions data:', JSON.stringify(submissions, null, 2));
          
//           // Map student names from the original submissions
//           const submissionsWithNames = submissions.map(submission => {
//             const studentInfo = submissions.find(s => 
//               s.id === submission.id || 
//               s.filename?.includes(submission.id)
//             );
//             return {
//               ...submission,
//               studentName: studentInfo?.studentName || findStudentNameFromSubmissions(submission, submissions)
//             };
//           });
          
//           console.log('Submissions with mapped names:', submissionsWithNames);
          
//           const similarities = submissionsWithNames.map(s => parseFloat(s.total_result));
//           const maxSimilarity = similarities.length ? Math.max(...similarities) : 0;

//           setResult({
//             ...report,
//             maxSimilarity,
//             similarities,
//             submissions: submissionsWithNames,
//           });
          
//           setReportReady(true);
//         }
//       }
//     } catch (error) {
//       console.error('Plagiarism check failed:', error);
//       setError(error.response?.data?.message || 'Failed to run plagiarism check');
//     } finally {
//       setIsChecking(false);
//     }
//   };

//   const openReport = () => {
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="space-y-4">
//       <button
//         onClick={handlePlagiarismCheck}
//         disabled={isChecking}
//         className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//           isChecking 
//             ? 'bg-gray-400 cursor-not-allowed' 
//             : 'bg-purple-600 hover:bg-purple-700'
//         } text-white`}
//       >
//         {isChecking ? (
//           <Loader2 className="w-5 h-5 animate-spin" />
//         ) : (
//           <Shield className="w-5 h-5" />
//         )}
//         {isChecking ? 'Running Plagiarism Check...' : 'Run Plagiarism Check'}
//       </button>

//       {/* Success State */}
//       {result && (
//         <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-5 h-5 text-green-600" />
//               <span className="font-medium text-green-800">
//                 Plagiarism Check Completed
//               </span>
//             </div>
//             {result.maxSimilarity !== undefined && (
//               <span className={`text-sm font-medium px-2 py-1 rounded-full ${
//                 result.maxSimilarity > 80 ? 'bg-red-100 text-red-800' :
//                 result.maxSimilarity > 50 ? 'bg-yellow-100 text-yellow-800' :
//                 'bg-green-100 text-green-800'
//               }`}>
//                 Max Similarity: 100%
//               </span>
//             )}
//           </div>
          
//           <p className="text-green-700 text-sm mb-3">
//             Successfully analyzed submissions for "{assignmentTitle}"
//           </p>
          
//           {/* Submissions Overview */}
//           {result.submissions?.length > 0 && (
//             <div className="mb-4">
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Submission Analysis</h4>
//               <div className="space-y-2">
//                 {result.submissions.map(submission => (
//                   <div key={submission.id} className="bg-white p-3 rounded-lg border border-gray-200">
//                     <div className="flex justify-between items-center">
//                       <div className="flex flex-col">
//                         <span className="font-medium text-black">
//                           {getStudentName(submission)}
//                         </span>
//                         <span className="text-xs text-gray-500">
//                           {submission.studentEmail || ''}
//                         </span>
//                       </div>
//                       <span className={`text-sm px-2 py-1 rounded-full ${
//                         parseFloat(submission.total_result) > 80 ? 'bg-red-100 text-red-800' :
//                         parseFloat(submission.total_result) > 50 ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-green-100 text-green-800'
//                       }`}>
//                         {/* Show nothing here, as per new requirement */}
//                       </span>
//                     </div>
//                     {submission.submissionresults?.length > 0 && (
//                       <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1">
//                         {submission.submissionresults.map(comparison => {
//                           const matchedSubmission = result.submissions.find(s => s.id === comparison.submission_id_compared);
//                           return (
//                             <div key={comparison.id} className="text-sm text-gray-600 flex justify-between">
//                               <span className="font-medium text-black">Matches with: {getStudentName(matchedSubmission)}</span>
//                               <span className="font-medium text-black">{comparison.score}% Similar</span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           {/* View Report Button */}
//           <button
//             onClick={openReport}
//             className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm w-full justify-center"
//           >
//             <ExternalLink className="w-4 h-4" />
//             View Detailed Report
//           </button>
//         </div>
//       )}

//       {/* Error State */}
//       {error && (
//         <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//           <div className="flex items-center gap-2 mb-2">
//             <AlertTriangle className="w-5 h-5 text-red-600" />
//             <span className="font-medium text-red-800">
//               Plagiarism Check Failed
//             </span>
//           </div>
//           <p className="text-red-700 text-sm">{error}</p>
//         </div>
//       )}

//       {/* Plagiarism Report Modal */}
//       <PlagiarismReportModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         results={result}
//       />
//     </div>
//   );
// };

// export default PlagiarismCheckButton;













"use client"

import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import PlagiarismReportModal from "./PlagiarismReportModal"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Custom styles for animations
const progressStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.3; }
  }
  .animate-pulse-slow {
    animation: pulse-slow 3s infinite;
  }
  @keyframes fade-in {
    0% { 
      opacity: 0; 
      transform: translateY(-20px) scale(0.95); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
  }
  .animate-glow {
    animation: glow 2s infinite;
  }
  .border-3 {
    border-width: 3px;
  }
`;

const PlagiarismCheckButton = ({ assignmentId, assignmentTitle }) => {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [reportReady, setReportReady] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Progress tracking states
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [totalSubmissions, setTotalSubmissions] = useState(0)

  // Helper function to find student name from the original submissions data
  const findStudentNameFromSubmissions = (plagiarismSubmission, allSubmissions) => {
    // Extract student ID from filename pattern
    const fileNameMatch = plagiarismSubmission.filename?.match(/student_([a-f0-9]+)_/)
    if (!fileNameMatch) return null

    const studentId = fileNameMatch[1]
    const submission = submissions.find((s) => s.studentId?._id === studentId)
    return submission?.studentId?.name || null
  }

  // Helper function to extract student names from submission
  const getStudentName = (submission) => {
    return submission?.studentName || "Unknown Student"
  }

  // Helper to extract name from filename as last resort
  const extractNameFromFileName = (filename) => {
    if (!filename) return null
    const match = filename.match(/student_[a-f0-9]+_([^/]+)/)
    return match ? match[1].replace(/_/g, " ") : null
  }

  const formatSubmissionId = (submissionId) => {
    if (!submissionId) return "Unknown"
    // Just show first 6 characters of the ID for brevity
    return `Student ${submissionId.slice(0, 6)}...`
  }
  const handleViewReport = () => {
  console.log('=== PLAGIARISM BUTTON: Opening report (data already saved) ===');
  console.log('Result state check:', !!result);
  console.log('LocalStorage check:', !!localStorage.getItem('plagiarismResults'));
  
  // Data is already saved to localStorage in the main plagiarism check flow
  // No need to save again here
  window.open('/plagiarism-report', '_blank');
};


  const handlePlagiarismCheck = async () => {
    setIsChecking(true)
    setError(null)
    setResult(null)
    setReportReady(false)
    setProgress(5)
    setCurrentStep('Initializing plagiarism check...')

    try {
      // Smooth progress increments with visual feedback
      await new Promise((resolve) => setTimeout(resolve, 300))
      setProgress(10)
      setCurrentStep('Connecting to plagiarism service...')
      
      await new Promise((resolve) => setTimeout(resolve, 200))
      setProgress(15)
      setCurrentStep('Fetching student submissions...')
      
      // Add a small delay to ensure the progress bar is visible
      await new Promise((resolve) => setTimeout(resolve, 400))
      
      const submissionsResponse = await axios.get(`http://localhost:8080/submission/all/${assignmentId}`, {
        withCredentials: true,
      })

      if (submissionsResponse.data.success) {
        const submissionsData = submissionsResponse.data.submissions || []
        setSubmissions(submissionsData)
        setTotalSubmissions(submissionsData.length)
        
        setProgress(25)
        setCurrentStep(`Found ${submissionsData.length} submissions to analyze...`)
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        setProgress(30)
        setCurrentStep('Validating submission files...')
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      // Step 2: Start plagiarism check with more granular progress
      setProgress(35)
      setCurrentStep('Preparing files for upload...')
      await new Promise((resolve) => setTimeout(resolve, 400))
      
      setProgress(40)
      setCurrentStep('Uploading submissions for comparison...')
      
      const response = await axios.post(
        `http://localhost:8080/api/plagiarism/check/${assignmentId}`,
        {},
        { withCredentials: true },
      )

      if (response.data.success) {
        // Step 3: Processing phase with continuous updates
        setProgress(50)
        setCurrentStep('Files uploaded successfully...')
        await new Promise((resolve) => setTimeout(resolve, 600))
        
        setProgress(55)
        setCurrentStep('Initializing plagiarism analysis...')
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        setProgress(60)
        setCurrentStep('Analyzing submissions for similarities...')
        await new Promise((resolve) => setTimeout(resolve, 700))
        
        setProgress(65)
        setCurrentStep('Comparing code patterns...')
        await new Promise((resolve) => setTimeout(resolve, 600))
        
        setProgress(70)
        setCurrentStep('Checking text similarities...')
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        setProgress(75)
        setCurrentStep('Processing comparison results...')
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Step 4: Fetch results with detailed progress
        setProgress(80)
        setCurrentStep('Generating plagiarism report...')
        await new Promise((resolve) => setTimeout(resolve, 400))
        
        setProgress(85)
        setCurrentStep('Fetching analysis results...')
        
        const resultsResponse = await axios.get(`http://localhost:8080/api/plagiarism/results/${assignmentId}`, {
          withCredentials: true,
        })

        if (resultsResponse.data.success) {
          setProgress(90)
          setCurrentStep('Processing detailed results...')
          await new Promise((resolve) => setTimeout(resolve, 300))
          
          // Also fetch detailed results for code comparison
          setCurrentStep('Fetching detailed comparison data...')
          let detailedResults = null;
          try {
            const detailedResponse = await axios.get(`http://localhost:8080/api/plagiarism/detailed-results/${assignmentId}`, {
              withCredentials: true,
            });
            if (detailedResponse.data.success) {
              detailedResults = detailedResponse.data.detailedResults;
              console.log('Detailed results for code comparison:', detailedResults);
            }
          } catch (detailError) {
            console.warn('Could not fetch detailed results:', detailError);
          }
          
          setProgress(93)
          setCurrentStep('Mapping student information...')
          await new Promise((resolve) => setTimeout(resolve, 200))
          
          const report = resultsResponse.data.report

          // Process similarity data from overview
          const submissions = report.overview?.submissions || []

          // Map student names and ensure proper data structure
          const submissionsWithNames = submissions.map((submission) => {
            // Ensure total_result is a valid number
            const totalResult = Number.parseFloat(submission.total_result) || 0

            const studentInfo = submissions.find((s) => s.id === submission.id || s.filename?.includes(submission.id))

            return {
              ...submission,
              total_result: totalResult, // Ensure it's a number
              studentName:
                studentInfo?.studentName ||
                findStudentNameFromSubmissions(submission, submissions) ||
                extractNameFromFileName(submission.filename) ||
                `Student ${submission.id?.slice(0, 8) || "Unknown"}`,
              studentEmail: studentInfo?.studentEmail || "",
              // Ensure submissionresults exists and has proper structure
              submissionresults:
                submission.submissionresults?.map((result) => ({
                  ...result,
                  score: Number.parseFloat(result.score) || 0,
                })) || [],
            }
          })

          // Calculate statistics
          const similarities = submissionsWithNames.map((s) => Number.parseFloat(s.total_result) || 0)
          const maxSimilarity = similarities.length ? Math.max(...similarities) : 0
          const avgSimilarity = similarities.length
            ? similarities.reduce((acc, val) => acc + val, 0) / similarities.length
            : 0
          const minSimilarity = similarities.length ? Math.min(...similarities) : 0

          // Create the final result object with proper structure - INCLUDING ALL API DATA
          const finalResult = {
            overview: report.overview,
            submissions: submissionsWithNames,
            maxSimilarity,
            avgSimilarity,
            minSimilarity,
            similarities,
            totalSubmissions: submissionsWithNames.length,
            detailedResults: detailedResults, // Add detailed results for code comparison
            // Include ALL original API data for complete access
            codequiry: report, // Complete codequiry API response
            rawOverview: report.overview, // Direct access to overview
            rawDetailed: detailedResults // Direct access to detailed results
          }
          
          console.log('=== PLAGIARISM BUTTON: Final Result Created ===');
          console.log('finalResult structure:', Object.keys(finalResult));
          console.log('finalResult.detailedResults length:', finalResult.detailedResults?.length);
          console.log('finalResult.detailedResults sample:', finalResult.detailedResults?.[0]);
          console.log('Complete finalResult:', finalResult);
          
          setProgress(97)
          setCurrentStep('Finalizing report...')
          await new Promise((resolve) => setTimeout(resolve, 300))
          
          setProgress(100)
          setCurrentStep('Analysis complete!')
          await new Promise((resolve) => setTimeout(resolve, 500))
          
          console.log('=== PLAGIARISM BUTTON: About to setResult ===');
          setResult(finalResult)
          console.log('=== PLAGIARISM BUTTON: setResult called ===');
          
          // Also save finalResult directly to localStorage to avoid state timing issues
          console.log('=== PLAGIARISM BUTTON: Saving finalResult directly to localStorage ===');
          localStorage.setItem('plagiarismResults', JSON.stringify(finalResult));
          console.log('=== PLAGIARISM BUTTON: finalResult saved to localStorage ===');
          
          setReportReady(true)
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to run plagiarism check")
      setProgress(0)
      setCurrentStep('')
    } finally {
      setIsChecking(false)
    }
  }

  const openReport = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <style>{progressStyles}</style>
      <div className="space-y-4">
      <button
        onClick={handlePlagiarismCheck}
        disabled={isChecking}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 text-white shadow-md ${
          isChecking 
            ? "bg-gray-400 cursor-not-allowed transform scale-95" 
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105"
        }`}
      >
        {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
        {isChecking ? "Running Plagiarism Check..." : "Run Plagiarism Check"}
      </button>

      {/* Enhanced Progress Bar */}
      {isChecking && (
        <div className="bg-gradient-to-br from-white to-blue-50 p-8 border border-blue-200 rounded-2xl shadow-xl transform transition-all duration-500 ease-out animate-fade-in backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Analyzing Submissions</h3>
              <p className="text-sm text-gray-600 transition-all duration-300 font-medium">{currentStep}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent transition-all duration-300">
                {progress}%
              </div>
              {totalSubmissions > 0 && (
                <div className="text-xs text-gray-500 bg-white bg-opacity-70 px-3 py-1 rounded-full shadow-sm border">
                  {totalSubmissions} submissions
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mb-8">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-25 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 opacity-20 rounded-full"></div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-between text-xs mb-6">
            <div className={`flex flex-col items-center transition-all duration-500 ${progress >= 15 ? 'text-blue-600 font-semibold transform scale-105' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full mb-3 border-3 transition-all duration-500 relative ${progress >= 15 ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-200 border-gray-300'}`}>
                {progress >= 15 && progress < 40 && (
                  <>
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-white opacity-30 animate-ping"></div>
                    <div className="absolute inset-1 w-2 h-2 rounded-full bg-white opacity-60"></div>
                  </>
                )}
              </div>
              <span className="text-center leading-tight">Fetch<br/>Submissions</span>
            </div>
            <div className={`flex flex-col items-center transition-all duration-500 ${progress >= 40 ? 'text-blue-600 font-semibold transform scale-105' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full mb-3 border-3 transition-all duration-500 relative ${progress >= 40 ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-200 border-gray-300'}`}>
                {progress >= 40 && progress < 75 && (
                  <>
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-white opacity-30 animate-ping"></div>
                    <div className="absolute inset-1 w-2 h-2 rounded-full bg-white opacity-60"></div>
                  </>
                )}
              </div>
              <span className="text-center leading-tight">Upload &<br/>Process</span>
            </div>
            <div className={`flex flex-col items-center transition-all duration-500 ${progress >= 60 ? 'text-blue-600 font-semibold transform scale-105' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full mb-3 border-3 transition-all duration-500 relative ${progress >= 60 ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-200 border-gray-300'}`}>
                {progress >= 60 && progress < 85 && (
                  <>
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-white opacity-30 animate-ping"></div>
                    <div className="absolute inset-1 w-2 h-2 rounded-full bg-white opacity-60"></div>
                  </>
                )}
              </div>
              <span className="text-center leading-tight">Analyze<br/>Similarities</span>
            </div>
            <div className={`flex flex-col items-center transition-all duration-500 ${progress >= 85 ? 'text-blue-600 font-semibold transform scale-105' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full mb-3 border-3 transition-all duration-500 relative ${progress >= 85 ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-200 border-gray-300'}`}>
                {progress >= 85 && progress < 100 && (
                  <>
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-white opacity-30 animate-ping"></div>
                    <div className="absolute inset-1 w-2 h-2 rounded-full bg-white opacity-60"></div>
                  </>
                )}
              </div>
              <span className="text-center leading-tight">Generate<br/>Report</span>
            </div>
            <div className={`flex flex-col items-center transition-all duration-500 ${progress >= 100 ? 'text-green-600 font-semibold transform scale-110' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full mb-3 border-3 transition-all duration-500 relative ${progress >= 100 ? 'bg-green-600 border-green-600 shadow-lg shadow-green-200' : 'bg-gray-200 border-gray-300'}`}>
                {progress >= 100 && (
                  <>
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-white opacity-50 animate-pulse"></div>
                    <svg className="absolute inset-0.5 w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </>
                )}
              </div>
              <span className="text-center leading-tight">Complete!</span>
            </div>
          </div>
          
          {/* Estimated Time */}
          <div className="text-center bg-white bg-opacity-50 rounded-xl p-4 border border-white border-opacity-30">
            <p className="text-sm text-gray-600">
              {progress < 100 ? (
                <>
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-2 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">
                      Estimated time remaining: 
                      <span className="ml-1 text-blue-600 font-semibold">
                        {
                          progress < 30 ? '15-20 seconds' :
                          progress < 60 ? '8-12 seconds' :
                          progress < 90 ? '3-5 seconds' :
                          'Almost done...'
                        }
                      </span>
                    </span>
                  </span>
                </>
              ) : (
                <span className="text-green-600 font-semibold inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Analysis Complete! Report is ready.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {result && (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg transform transition-all duration-500 ease-out">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-green-800 text-lg">Plagiarism Check Completed</span>
            </div>
            {result.maxSimilarity !== undefined && (
              <span
                className={`text-sm font-semibold px-3 py-2 rounded-full shadow-sm ${
                  result.maxSimilarity > 80
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : result.maxSimilarity > 50
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : "bg-green-100 text-green-800 border border-green-200"
                }`}
              >
                Max Similarity: 100%
              </span>
            )}
          </div>
          <p className="text-green-700 text-sm mb-4 font-medium">
            Successfully analyzed submissions for "{assignmentTitle}"
          </p>

          {/* Submissions Overview */}
          {result.submissions?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Submission Analysis</h4>
              <div className="space-y-2">
                {result.submissions.map((submission) => (
                  <div key={submission.id} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-medium text-black">{getStudentName(submission)}</span>
                        <span className="text-xs text-gray-500">{submission.studentEmail || ""}</span>
                      </div>
                      {/* <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          Number.parseFloat(submission.total_result) > 80
                            ? "bg-red-100 text-red-800"
                            : Number.parseFloat(submission.total_result) > 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {Number.parseFloat(submission.total_result).toFixed(1)} % Similar
                      </span> */}
                    </div>
                    {submission.submissionresults?.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1">
                        {submission.submissionresults.map((comparison) => {
                          const matchedSubmission = result.submissions.find(
                            (s) => s.id === comparison.submission_id_compared,
                          )
                          return (
                            <div key={comparison.id} className="text-sm text-gray-600 flex justify-between">
                              <span className="font-medium text-black">
                                Matches with: {getStudentName(matchedSubmission)}
                              </span>
                              <span className="font-medium px-2 py-1 rounded-full text-black bg-green-100">
                                {Number.parseFloat(comparison.score).toFixed(1)}% Similar
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Report Button */}
          <button
            onClick={handleViewReport}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            View Detailed Report
          </button>
                 
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Plagiarism Check Failed</span>
          </div>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Plagiarism Report Modal */}
      <PlagiarismReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} results={result} />
      </div>
    </>
  )
}

export default PlagiarismCheckButton
