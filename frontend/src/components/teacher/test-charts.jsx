// "use client"

// import { useState } from "react"
// import PlagiarismReportModal from "./PlagiarismReportModal"

// const TestChartsPage = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false)

//   // Test data that should definitely work
//   const testResults = {
//     submissions: [
//       {
//         id: "1",
//         studentName: "Alice Johnson",
//         total_result: "85.5",
//         submissionresults: [
//           { id: "1", submission_id_compared: "2", score: "75.2" },
//           { id: "2", submission_id_compared: "3", score: "45.8" },
//         ],
//       },
//       {
//         id: "2",
//         studentName: "Bob Smith",
//         total_result: "65.3",
//         submissionresults: [{ id: "3", submission_id_compared: "1", score: "75.2" }],
//       },
//       {
//         id: "3",
//         studentName: "Charlie Brown",
//         total_result: "25.1",
//         submissionresults: [{ id: "4", submission_id_compared: "1", score: "45.8" }],
//       },
//       {
//         id: "4",
//         studentName: "Diana Prince",
//         total_result: "92.7",
//         submissionresults: [],
//       },
//       {
//         id: "5",
//         studentName: "Eve Wilson",
//         total_result: "15.3",
//         submissionresults: [],
//       },
//     ],
//   }

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">Chart Testing Page</h1>
//       <p className="mb-4">This page tests the charts with known good data.</p>

//       <button
//         onClick={() => setIsModalOpen(true)}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//       >
//         Open Test Modal with Sample Data
//       </button>

//       <div className="mt-4 p-4 bg-gray-100 rounded">
//         <h3 className="font-semibold">Test Data Preview:</h3>
//         <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(testResults, null, 2)}</pre>
//       </div>

//       <PlagiarismReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} results={testResults} />
//     </div>
//   )
// }

// export default TestChartsPage
