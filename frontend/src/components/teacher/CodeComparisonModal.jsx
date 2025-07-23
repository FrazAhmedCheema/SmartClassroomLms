import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, Users, FileText, Copy, Eye, Download } from 'lucide-react';

const CodeComparisonModal = ({ onClose, comparisonData, results }) => {
  const [selectedMatch, setSelectedMatch] = useState(0);
  
  if (!comparisonData) return null;

    // Process the detailed results to get comparison data
  const processComparisonData = () => {
    console.log('=== STEP 1: Starting processComparisonData ===');
    console.log('comparisonData:', comparisonData);
    console.log('Full results structure:', {
      hasResults: !!results,
      resultsKeys: results ? Object.keys(results) : 'no results',
      hasDetailedResults: !!results?.detailedResults,
      hasCodequiry: !!results?.codequiry,
      hasRawDetailed: !!results?.rawDetailed,
      detailedResultsLength: results?.detailedResults?.length || 0
    });
    
    // Check for detailed results in all possible locations
    const detailedResults = results?.detailedResults || 
                          results?.rawDetailed ||
                          results?.codequiry?.detailedResults ||
                          results?.overview?.detailedResults;
                          
    console.log('=== STEP 1B: Detailed results search ===');
    console.log('Found detailedResults:', !!detailedResults);
    console.log('DetailedResults length:', detailedResults?.length || 0);
    console.log('First detailed result sample:', detailedResults?.[0]);    if (!comparisonData?.submissionId) {
      console.log('=== STEP 1 FAILED: No submissionId ===');
      return null;
    }

    console.log('=== STEP 2: Processing detailed results ===');
    // Access detailed results directly from wherever they are in the data structure
    if (detailedResults) {
      console.log('=== STEP 2A: Found detailed results ===');
      console.log('detailedResults:', detailedResults);
      
      const detailedData = detailedResults.find(
        detail => detail.submission?.id?.toString() === comparisonData.submissionId?.toString()
      );
      
      // Log the actual data we found for debugging
      console.log('=== STEP 2B: Searching for matching submission ===');
      console.log('Looking for submissionId:', comparisonData.submissionId);
      console.log('Available submission IDs:', detailedResults?.map(d => d.submission?.id) || 'no detailed results');
      console.log('Found detailed data:', detailedData);
      console.log('Related files:', detailedData?.related_files);
      console.log('Other matches:', detailedData?.other_matches);
      
      if (detailedData && detailedData.other_matches?.length > 0) {
        console.log('=== STEP 2C: Found detailedData with other_matches ===');
        console.log('other_matches:', detailedData.other_matches);
        console.log('related_files:', detailedData.related_files);
        
        // Process other_matches to create matches array with student names
        const matches = detailedData.other_matches.map((match, index) => {
          console.log(`=== STEP 2C-${index}: Processing match ===`, match);
          
          // Find the matched student info from detailed results
          const matchedSubmission = detailedResults?.find(
            d => d.submission?.id === match.submission_id_matched
          );
          
          console.log(`=== STEP 2D-${index}: Found matchedSubmission ===`, matchedSubmission);
          
          // Extract student name from submission data or filename
          let matchedStudentName = 'Unknown Student';
          if (matchedSubmission?.submission?.studentName) {
            matchedStudentName = matchedSubmission.submission.studentName;
            console.log(`=== STEP 2E-${index}: Got student name from submission ===`, matchedStudentName);
          } else if (match.file_matched) {
            // Extract from filename pattern: student_<id>_<name>
            const filenameMatch = match.file_matched.match(/student_[^_]+_(.+?)\//);
            if (filenameMatch) {
              matchedStudentName = filenameMatch[1].replace(/_/g, ' ');
              console.log(`=== STEP 2F-${index}: Extracted name from filename ===`, matchedStudentName);
            }
          }

          const processedMatch = {
            id: match.id,
            submission_id_matched: match.submission_id_matched,
            similarity_percentage: parseFloat(match.similarity) || 0,
            matched_student_name: matchedStudentName,
            file: match.file,
            file_matched: match.file_matched,
            line_start: match.line_start,
            line_end: match.line_end,
            line_matched_start: match.line_matched_start,
            line_matched_end: match.line_matched_end,
            tokens: match.tokens,
            // Include all original match data for detailed view
            originalMatch: match
          };
          
          console.log(`=== STEP 2G-${index}: Processed match ===`, processedMatch);
          return processedMatch;
        });

        // Get current student name
        let currentStudentName = 'Unknown Student';
        if (detailedData.submission?.studentName) {
          currentStudentName = detailedData.submission.studentName;
          console.log('=== STEP 2H: Got current student name from submission ===', currentStudentName);
        } else if (detailedData.other_matches[0]?.file) {
          // Extract from filename
          const currentFileMatch = detailedData.other_matches[0].file.match(/student_[^_]+_(.+?)\//);
          if (currentFileMatch) {
            currentStudentName = currentFileMatch[1].replace(/_/g, ' ');
            console.log('=== STEP 2I: Extracted current student name from filename ===', currentStudentName);
          }
        }

        const result = {
          currentSubmission: {
            id: detailedData.submission?.id,
            student_name: currentStudentName,
            similarity_percentage: parseFloat(detailedData.submission?.result1) || 0,
            // Include file content from related_files if available
            content: detailedData.related_files?.[0]?.content || null
          },
          matches: matches,
          files: detailedData.related_files || [],
          // Include all original detailed data
          originalDetailedData: detailedData
        };
        
        console.log('=== STEP 2J: Final detailed result ===', result);
        return result;
      } else {
        console.log('=== STEP 2C FAILED: No detailedData or no other_matches ===');
      }
    } else {
      console.log('=== STEP 2A FAILED: No codequiry detailed results ===');
    }

    console.log('=== STEP 3: Checking fallback paths ===');
    // Fallback: Find the current submission in the main results
    const currentSubmission = results.submissions?.find(
      sub => sub.id.toString() === comparisonData.submissionId.toString()
    );

    console.log('=== STEP 3A: Current submission search ===');
    console.log('Looking for submissionId:', comparisonData.submissionId);
    console.log('Available submission IDs:', results.submissions?.map(s => s.id) || 'no submissions');
    console.log('Found currentSubmission:', currentSubmission);

    if (!currentSubmission) {
      console.log('=== STEP 3A FAILED: No current submission found ===');
      return null;
    }

    // Check if we have detailed results (legacy path)
    if (results?.detailedResults) {
      console.log('=== STEP 3B: Checking legacy detailedResults ===');
      const detailedData = results.detailedResults.find(
        detail => detail.submission.id === comparisonData.submissionId
      );
      
      if (detailedData && detailedData.other_matches?.length) {
        console.log('=== STEP 3C: Found legacy detailed data ===', detailedData);
        return {
          currentSubmission: detailedData.submission,
          matches: detailedData.other_matches,
          files: detailedData.related_files || []
        };
      }
    }

    console.log('=== STEP 4: Using basic fallback ===');
    // Final fallback to basic comparison data from submissionresults
    if (currentSubmission.submissionresults && currentSubmission.submissionresults.length > 0) {
      console.log('=== STEP 4A: Processing submissionresults ===', currentSubmission.submissionresults);
      
      const matches = currentSubmission.submissionresults.map(result => {
        const matchedSubmission = results.submissions.find(s => s.id === result.submission_id_compared);
        console.log('=== STEP 4B: Processing submissionresult ===', { result, matchedSubmission });
        
        return {
          matched_student_name: matchedSubmission?.studentName || 'Unknown Student',
          similarity_percentage: result.score,
          content: 'Code comparison not available - detailed results needed',
          line_matches: []
        };
      });

      const basicResult = {
        currentSubmission: {
          id: currentSubmission.id,
          student_name: currentSubmission.studentName,
          similarity_percentage: parseFloat(currentSubmission.result1) || 0,
          content: 'Code content not available - detailed results needed'
        },
        matches: matches,
        files: []
      };
      
      console.log('=== STEP 4C: Final basic result ===', basicResult);
      return basicResult;
    }

    console.log('=== STEP 4 FAILED: No submissionresults ===');
    return null;
  };

  const compData = processComparisonData();
  
  console.log('=== STEP 5: processComparisonData result ===', compData);
  
  if (!compData) {
    console.log('=== STEP 5 FAILED: No compData, showing no data modal ===');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">No Comparison Data</h3>
          <p className="text-gray-600 mb-4">
            No comparison matches found for this submission. This could mean:
          </p>
          <ul className="text-gray-600 mb-4 text-sm list-disc list-inside space-y-1">
            <li>The submission has low similarity scores</li>
            <li>Detailed results haven't been generated yet</li>
            <li>No matching submissions were found</li>
          </ul>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentMatch = compData.matches[selectedMatch];
  console.log('=== STEP 6: Current match ===', currentMatch);

  // For detailed comparison (with actual code content), show advanced view
  const isDetailedView = compData.files && compData.files.length > 0 && 
    compData.matches.some(m => m.file && m.line_start && m.line_end);
    
  console.log('=== STEP 7: Detailed view check ===', {
    hasFiles: compData.files && compData.files.length > 0,
    filesCount: compData.files?.length || 0,
    hasMatchWithFileInfo: compData.matches.some(m => m.file && m.line_start && m.line_end),
    matchesWithFileInfo: compData.matches.map(m => ({
      hasFile: !!m.file,
      hasLineStart: !!m.line_start,
      hasLineEnd: !!m.line_end,
      file: m.file,
      lineStart: m.line_start,
      lineEnd: m.line_end
    })),
    isDetailedView,
    sampleFile: compData.files?.[0],
    sampleFileContent: compData.files?.[0]?.content?.substring(0, 100) + '...'
  });  if (!isDetailedView) {
    // Simplified comparison view for basic data
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center pt-4 pb-4 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Code Similarity Analysis</h2>
                <p className="text-gray-600 text-sm">
                  {currentMatch?.similarity_percentage || 0}% similarity detected between submissions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Match {selectedMatch + 1} of {compData.matches.length}</div>
                <div className="text-lg font-bold text-red-600">{currentMatch?.similarity_percentage || 0}% Match</div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Match Selection */}
          {compData.matches.length > 1 && (
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Matches:</span>
                {compData.matches.map((match, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMatch(index)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedMatch === index
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {match.similarity_percentage}% vs {match.matched_student_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Detailed Code Comparison Not Available</h3>
                  <p className="text-yellow-700 text-sm mb-3">
                    The system has detected similarity between these submissions, but detailed code comparison 
                    requires additional processing. You can see the basic similarity information below.
                  </p>
                  <div className="text-xs text-yellow-600">
                    To enable detailed side-by-side code comparison with highlighted differences, 
                    the backend needs to provide detailed results with file contents and line-by-line matching data.
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Comparison Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Original Submission
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Student:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {compData.currentSubmission.student_name || 'Unknown Student'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Submission ID:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {compData.currentSubmission.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overall Similarity:</span>
                    <span className="text-sm font-bold text-red-600">
                      {compData.currentSubmission.similarity_percentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  Matched Submission
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Student:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {currentMatch?.matched_student_name || 'Unknown Student'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Similarity Score:</span>
                    <span className="text-sm font-bold text-orange-600">
                      {currentMatch?.similarity_percentage || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Match Type:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {currentMatch?.similarity_percentage >= 70 ? 'High Risk' : 
                       currentMatch?.similarity_percentage >= 40 ? 'Medium Risk' : 'Low Risk'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* All Matches Summary */}
            {compData.matches.length > 0 && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">All Detected Matches</h4>
                <div className="space-y-2">
                  {compData.matches.map((match, index) => (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center p-2 rounded ${
                        index === selectedMatch ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-sm text-gray-700">
                        vs {match.matched_student_name || 'Unknown Student'}
                      </span>
                      <span className={`text-sm font-semibold ${
                        match.similarity_percentage >= 70 ? 'text-red-600' : 
                        match.similarity_percentage >= 40 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {match.similarity_percentage}% similar
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Basic similarity analysis • Detailed comparison requires backend enhancement
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed view code (for when we have detailed results)  
  // Find the files for comparison
  const currentFile = compData.files.find(f => 
    f.submission_id === compData.currentSubmission.id || 
    f.filedir === currentMatch.file
  );
  
  const matchedFile = compData.files.find(f => 
    f.submission_id === currentMatch.submission_id_matched || 
    f.filedir === currentMatch.file_matched
  );

  // Decode HTML entities in content
  const decodeHtmlEntities = (text) => {
    if (!text) return '';
    return text
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  };

  // Process code content and highlight matches
  const processCodeWithHighlights = (content, lineStart, lineEnd, isMatched = false) => {
    if (!content) return [];
    
    const decodedContent = decodeHtmlEntities(content);
    const lines = decodedContent.split('\n');
    
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const isHighlighted = lineNumber >= lineStart && lineNumber <= lineEnd;
      
      return {
        number: lineNumber,
        content: line,
        isHighlighted,
        isMatched
      };
    });
  };

  const leftCode = currentFile ? processCodeWithHighlights(
    currentFile.content, 
    currentMatch.line_start, 
    currentMatch.line_end, 
    false
  ) : [];

  const rightCode = matchedFile ? processCodeWithHighlights(
    matchedFile.content, 
    currentMatch.line_matched_start, 
    currentMatch.line_matched_end, 
    true
  ) : [];

  // Get student names for display
  const getStudentName = (submissionId) => {
    const submission = results.submissions.find(s => s.id === submissionId);
    return submission?.studentName || 'Unknown Student';
  };

  const currentStudentName = getStudentName(compData.currentSubmission.id);
  const matchedStudentName = getStudentName(currentMatch.submission_id_matched);

  // Custom syntax highlighter component
  const CodeLine = ({ line, side }) => {
    const bgColor = line.isHighlighted 
      ? (side === 'left' ? 'bg-red-100 border-l-4 border-red-500' : 'bg-orange-100 border-l-4 border-orange-500')
      : 'bg-transparent';
      
    return (
      <div className={`flex items-start px-2 py-0.5 ${bgColor} hover:bg-gray-50 transition-colors group`}>
        <span className="text-gray-400 text-xs font-mono mr-3 select-none min-w-[30px] text-right sticky left-0 bg-inherit group-hover:bg-gray-50">
          {line.number}
        </span>
        <code className="text-xs font-mono text-gray-800 flex-1 whitespace-pre break-all leading-tight">
          {line.content || ' '}
        </code>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Code Similarity Analysis</h2>
              <p className="text-gray-600 text-sm">
                {currentMatch?.similarity_percentage || 0}% similarity detected between submissions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Match {selectedMatch + 1} of {compData.matches.length}</div>
              <div className="text-lg font-bold text-red-600">{currentMatch?.similarity_percentage || 0}% Match</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Match Selection */}
        {compData.matches.length > 1 && (
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Matches:</span>
              {compData.matches.map((match, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMatch(index)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedMatch === index
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {match.similarity_percentage || 0}% (Lines {match.line_start}-{match.line_end})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Student Info Header */}
        <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{currentStudentName}</div>
                <div className="text-xs text-gray-600">{currentFile?.filedir || 'Unknown File'}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{matchedStudentName}</div>
                <div className="text-xs text-gray-600">{matchedFile?.filedir || 'Unknown File'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Comparison */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 h-full divide-x divide-gray-200">
            {/* Left Panel - Current Submission */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-red-50 px-3 py-1 border-b border-red-200 flex-shrink-0">
                <div className="font-semibold text-red-800 text-sm">{currentStudentName}</div>
                <div className="text-xs text-red-600">
                  Lines {currentMatch.line_start}-{currentMatch.line_end} highlighted
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                {leftCode.map((line, index) => (
                  <CodeLine key={index} line={line} side="left" />
                ))}
              </div>
            </div>

            {/* Right Panel - Matched Submission */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-orange-50 px-3 py-1 border-b border-orange-200 flex-shrink-0">
                <div className="font-semibold text-orange-800 text-sm">{matchedStudentName}</div>
                <div className="text-xs text-orange-600">
                  Lines {currentMatch.line_matched_start}-{currentMatch.line_matched_end} highlighted
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                {rightCode.map((line, index) => (
                  <CodeLine key={index} line={line} side="right" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-700">Original highlights</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-gray-700">Matched highlights</span>
              </div>
              <div className="text-gray-600">
                {currentMatch?.similarity_percentage || 0}% | {currentMatch?.tokens || 0} tokens
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const comparisonReport = {
                    originalStudent: currentStudentName,
                    matchedStudent: matchedStudentName,
                    similarity: currentMatch?.similarity_percentage || 0,
                    originalFile: currentFile?.filedir,
                    matchedFile: matchedFile?.filedir,
                    originalLines: `${currentMatch?.line_start}-${currentMatch?.line_end}`,
                    matchedLines: `${currentMatch?.line_matched_start}-${currentMatch?.line_matched_end}`,
                    tokens: currentMatch?.tokens || 0,
                    originalCode: decodeHtmlEntities(currentFile?.content || ''),
                    matchedCode: decodeHtmlEntities(matchedFile?.content || '')
                  };
                  
                  const blob = new Blob([JSON.stringify(comparisonReport, null, 2)], { 
                    type: 'application/json' 
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `code-comparison-${currentStudentName}-vs-${matchedStudentName}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-xs"
              >
                <Download className="h-3 w-3" />
                <span>Export</span>
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeComparisonModal;
