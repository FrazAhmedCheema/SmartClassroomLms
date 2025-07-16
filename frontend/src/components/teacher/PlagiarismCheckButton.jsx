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

const PlagiarismCheckButton = ({ assignmentId, assignmentTitle }) => {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [reportReady, setReportReady] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handlePlagiarismCheck = async () => {
    setIsChecking(true)
    setError(null)
    setResult(null)
    setReportReady(false)

    try {
      // Fetch submissions data first
      const submissionsResponse = await axios.get(`http://localhost:8080/submission/all/${assignmentId}`, {
        withCredentials: true,
      })

      if (submissionsResponse.data.success) {
        console.log("Received submissions data:", submissionsResponse.data)
        setSubmissions(submissionsResponse.data.submissions || [])
      }

      // Initial check
      const response = await axios.post(
        `http://localhost:8080/api/plagiarism/check/${assignmentId}`,
        {},
        { withCredentials: true },
      )

      if (response.data.success) {
        // Wait a moment and then fetch the results
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Fetch results
        const resultsResponse = await axios.get(`http://localhost:8080/api/plagiarism/results/${assignmentId}`, {
          withCredentials: true,
        })

        if (resultsResponse.data.success) {
          const report = resultsResponse.data.report
          console.log("Full Plagiarism API Response:", resultsResponse.data)
          console.log("Received plagiarism report:", report)
          console.log("Report overview:", report.overview)

          // Process similarity data from overview
          const submissions = report.overview?.submissions || []
          console.log("Detailed submissions data:", JSON.stringify(submissions, null, 2))

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

          console.log("Submissions with mapped names:", submissionsWithNames)

          // Calculate statistics
          const similarities = submissionsWithNames.map((s) => Number.parseFloat(s.total_result) || 0)
          const maxSimilarity = similarities.length ? Math.max(...similarities) : 0
          const avgSimilarity = similarities.length
            ? similarities.reduce((acc, val) => acc + val, 0) / similarities.length
            : 0
          const minSimilarity = similarities.length ? Math.min(...similarities) : 0

          // Create the final result object with proper structure
          const finalResult = {
            overview: report.overview,
            submissions: submissionsWithNames,
            maxSimilarity,
            avgSimilarity,
            minSimilarity,
            similarities,
            totalSubmissions: submissionsWithNames.length,
          }

          console.log("Final processed result:", finalResult)
          setResult(finalResult)
          setReportReady(true)
        }
      }
    } catch (error) {
      console.error("Plagiarism check failed:", error)
      setError(error.response?.data?.message || "Failed to run plagiarism check")
    } finally {
      setIsChecking(false)
    }
  }

  const openReport = () => {
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handlePlagiarismCheck}
        disabled={isChecking}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isChecking ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
        } text-white`}
      >
        {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
        {isChecking ? "Running Plagiarism Check..." : "Run Plagiarism Check"}
      </button>

      {/* Success State */}
      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Plagiarism Check Completed</span>
            </div>
            {result.maxSimilarity !== undefined && (
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  result.maxSimilarity > 80
                    ? "bg-red-100 text-red-800"
                    : result.maxSimilarity > 50
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                Max Similarity: 100%
              </span>
            )}
          </div>
          <p className="text-green-700 text-sm mb-3">Successfully analyzed submissions for "{assignmentTitle}"</p>

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
            onClick={openReport}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm w-full justify-center"
          >
            <ExternalLink className="w-4 h-4" />
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
  )
}

export default PlagiarismCheckButton
