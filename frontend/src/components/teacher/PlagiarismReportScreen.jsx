// import React, { useEffect, useRef, useState } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
// import * as d3 from 'd3';

// const NetworkGraph = ({ nodes, edges }) => {
//   const svgRef = useRef(null);

//   useEffect(() => {
//     if (!nodes || !edges) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = 350;
//     const height = 300;

//     const simulation = d3.forceSimulation(nodes)
//       .force("link", d3.forceLink(edges).id(d => d.id).distance(80))
//       .force("charge", d3.forceManyBody().strength(-250))
//       .force("center", d3.forceCenter(width / 2, height / 2))
//       .force("collision", d3.forceCollide().radius(40));

//     svg.attr("width", width).attr("height", height);

//     const link = svg.append("g")
//       .selectAll("line")
//       .data(edges)
//       .enter().append("line")
//       .attr("stroke", "#999")
//       .attr("stroke-opacity", 0.6)
//       .attr("stroke-width", d => Math.max(1, Math.sqrt(d.value / 10)));

//     const edgeLabels = svg.append("g")
//       .selectAll("text")
//       .data(edges)
//       .enter().append("text")
//       .attr("font-size", "10px")
//       .attr("font-weight", "bold")
//       .attr("fill", "#374151")
//       .attr("text-anchor", "middle")
//       .attr("dy", "0.35em")
//       .attr("pointer-events", "none")
//       .text(d => `${d.value}%`);

//     const node = svg.append("g")
//       .selectAll("circle")
//       .data(nodes)
//       .enter().append("circle")
//       .attr("r", d => Math.max(30, Math.min(55, d.value * 0.8)))
//       .attr("fill", d => {
//         const similarity = d.value;
//         return similarity > 80 ? '#FCA5A5' :
//                similarity > 50 ? '#FDE68A' :
//                '#A7F3D0';
//       })
//       .attr("stroke", d => {
//         const similarity = d.value;
//         return similarity > 80 ? '#DC2626' :
//                similarity > 50 ? '#D97706' :
//                '#059669';
//       })
//       .attr("stroke-width", 2)
//       .call(d3.drag()
//         .on("start", dragstarted)
//         .on("drag", dragged)
//         .on("end", dragended));

//     const label = svg.append("g")
//       .selectAll("text")
//       .data(nodes)
//       .enter().append("text")
//       .text(d => d.label.length > 10 ? d.label.substring(0, 10) + '...' : d.label)
//       .attr("font-size", "10px")
//       .attr("font-weight", "bold")
//       .attr("fill", "#374151")
//       .attr("text-anchor", "middle")
//       .attr("dy", "0.35em")
//       .attr("pointer-events", "none");

//     node.append("title").text(d => `${d.label}\nSimilarity: ${d.value}%`);

//     simulation.on("tick", () => {
//       link.attr("x1", d => d.source.x)
//           .attr("y1", d => d.source.y)
//           .attr("x2", d => d.target.x)
//           .attr("y2", d => d.target.y);

//       edgeLabels.attr("x", d => (d.source.x + d.target.x) / 2)
//                 .attr("y", d => (d.source.y + d.target.y) / 2);

//       node.attr("cx", d => d.x).attr("cy", d => d.y);
//       label.attr("x", d => d.x).attr("y", d => d.y);
//     });

//     function dragstarted(event, d) {
//       if (!event.active) simulation.alphaTarget(0.3).restart();
//       d.fx = d.x;
//       d.fy = d.y;
//     }

//     function dragged(event, d) {
//       d.fx = event.x;
//       d.fy = event.y;
//     }

//     function dragended(event, d) {
//       if (!event.active) simulation.alphaTarget(0);
//       d.fx = null;
//       d.fy = null;
//     }

//     return () => {
//       simulation.stop();
//     };
//   }, [nodes, edges]);

//   return (
//     <div className="flex justify-center">
//       <svg ref={svgRef}></svg>
//     </div>
//   );
// };

// const PlagiarismReportScreen = () => {
//   const [results, setResults] = useState(null);

//   useEffect(() => {
//     const stored = localStorage.getItem('plagiarismResults');
//     if (stored) setResults(JSON.parse(stored));
//   }, []);

//   if (!results) {
//     return <div className="p-6 text-center">No report data found.</div>;
//   }

//   const nodes = results.submissions.map(sub => ({
//     id: sub.id,
//     label: sub.studentName || 'Unknown',
//     value: parseFloat(sub.total_result) || 0,
//   }));

//   const edges = [];
//   results.submissions.forEach(sub => {
//     if (sub.submissionresults) {
//       sub.submissionresults.forEach(comparison => {
//         if (comparison.score > 0) {
//           edges.push({
//             source: sub.id,
//             target: comparison.submission_id_compared,
//             value: comparison.score,
//           });
//         }
//       });
//     }
//   });

//   const similarityBarData = results.submissions.map(sub => ({
//     name: sub.studentName || 'Unknown',
//     similarity: parseFloat(sub.result1) || 0,
//   }));

//   const getBarColor = (similarity) => {
//     if (similarity >= 70) return '#DC2626';
//     if (similarity >= 40) return '#D97706';
//     return '#059669';
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">
//       <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">Detailed Plagiarism Report</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         {/* Network Graph */}
//         <div className="bg-white p-4 rounded shadow border">
//           <h3 className="text-md font-semibold mb-3 text-gray-800">Similarity Network</h3>
//           <div className="h-[300px] border rounded-lg bg-gray-50 flex items-center justify-center">
//             <NetworkGraph nodes={nodes} edges={edges} />
//           </div>
//         </div>

//         {/* Bar Chart */}
//         <div className="bg-white p-4 rounded shadow border">
//           <h3 className="text-md font-semibold mb-3 text-gray-800">Student Similarity Analysis</h3>
//           <div className="h-[300px] bg-gray-100 flex items-center justify-center">
//             <div style={{ width: '100%', height: '300px' }}>
//               <BarChart
//                 width={600}
//                 height={300}
//                 data={similarityBarData}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} interval={0} />
//                 <YAxis label={{ value: 'Similarity %', angle: -90, position: 'insideLeft' }} fontSize={10} domain={[0, 100]} />
//                 <Tooltip formatter={value => [`${value}%`, 'Similarity']} labelFormatter={label => `Student: ${label}`} />
//                 <Bar dataKey="similarity" fill="#3B82F6">
//                   {similarityBarData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={getBarColor(entry.similarity)} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </div>
//           </div>
//           <div className="mt-2 flex justify-center gap-4 text-xs">
//             <div className="flex items-center gap-1">
//               <div className="w-3 h-3 bg-green-600 rounded"></div><span>Low (0-39%)</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <div className="w-3 h-3 bg-orange-600 rounded"></div><span>Medium (40-69%)</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <div className="w-3 h-3 bg-red-600 rounded"></div><span>High (70%+)</span>
//             </div>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="bg-white p-4 rounded shadow border lg:col-span-2">
//           <h3 className="text-md font-semibold mb-3 text-gray-800">Summary Statistics</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             <div className="p-3 bg-blue-50 rounded-lg">
//               <p className="text-xs text-blue-600">Total Submissions</p>
//               <p className="text-xl font-bold text-blue-800">{results.submissions.length}</p>
//             </div>
//             <div className="p-3 bg-green-50 rounded-lg">
//               <p className="text-xs text-green-600">Average Similarity</p>
//               <p className="text-xl font-bold text-green-800">
//                 {(results.submissions.reduce((acc, sub) => acc + (parseFloat(sub.result1) || 0), 0) / results.submissions.length).toFixed(1)}%
//               </p>
//             </div>
//             <div className="p-3 bg-yellow-50 rounded-lg">
//               <p className="text-xs text-yellow-600">Max Similarity</p>
//               <p className="text-xl font-bold text-yellow-800">
//                 {Math.max(...results.submissions.map(sub => parseFloat(sub.result1) || 0)).toFixed(1)}%
//               </p>
//             </div>
//             <div className="p-3 bg-purple-50 rounded-lg">
//               <p className="text-xs text-purple-600">Min Similarity</p>
//               <p className="text-xl font-bold text-purple-800">
//                 {Math.min(...results.submissions.map(sub => parseFloat(sub.result1) || 0)).toFixed(1)}%
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlagiarismReportScreen;





import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, 
  PieChart, Pie, LineChart, Line, ResponsiveContainer, Legend,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Area, AreaChart
} from 'recharts';
import * as d3 from 'd3';
import { 
  TrendingUp, Users, AlertTriangle, CheckCircle, 
  BarChart3, PieChart as PieChartIcon, Activity,
  FileText, Award, Target, Eye, Download, X, Flag
} from 'lucide-react';

const NetworkGraph = ({ nodes, edges }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!nodes || !edges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 350;

    // Add gradient definitions
    const defs = svg.append("defs");
    
    const gradient = defs.append("linearGradient")
      .attr("id", "nodeGradient")
      .attr("gradientUnits", "objectBoundingBox");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", 0.9);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#e2e8f0")
      .attr("stop-opacity", 0.6);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(45));

    svg.attr("width", width).attr("height", height)
      .style("background", "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)")
      .style("border-radius", "12px");

    const link = svg.append("g")
      .selectAll("line")
      .data(edges)
      .enter().append("line")
      .attr("stroke", d => {
        if (d.value >= 70) return "#dc2626"; // Red for high similarity
        if (d.value >= 40) return "#f59e0b"; // Amber for medium similarity
        return "#10b981"; // Green for low similarity
      })
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", d => Math.max(2, Math.sqrt(d.value / 8)))
      .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))");

    const edgeLabels = svg.append("g")
      .selectAll("text")
      .data(edges)
      .enter().append("text")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.9)")
      .text(d => `${d.value}%`);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => Math.max(35, Math.min(60, d.value * 0.9)))
      .attr("fill", d => {
        if (d.value >= 70) return "#fca5a5"; // Light red for high similarity
        if (d.value >= 40) return "#fbbf24"; // Light amber for medium similarity
        return "#86efac"; // Light green for low similarity
      })
      .attr("stroke", d => {
        if (d.value >= 70) return "#dc2626"; // Red stroke for high similarity
        if (d.value >= 40) return "#d97706"; // Amber stroke for medium similarity
        return "#059669"; // Green stroke for low similarity
      })
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0px 4px 8px rgba(0,0,0,0.2))")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.label.length > 12 ? d.label.substring(0, 12) + '...' : d.label)
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#1f2937")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)");

    node.append("title").text(d => `${d.label}\nSimilarity: ${d.value}%`);

    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

      edgeLabels.attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

      node.attr("cx", d => d.x).attr("cy", d => d.y);
      label.attr("x", d => d.x).attr("y", d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => simulation.stop();
  }, [nodes, edges]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef}></svg>
      <div className="mt-4 w-full">
        {/* Color Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-xs mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-300 border border-green-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">Low Similarity (0-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-300 border border-yellow-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">Medium Similarity (40-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-300 border border-red-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">High Similarity (70%+)</span>
          </div>
        </div>
        
        {/* Connection Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-xs mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-green-500 rounded"></div>
            <span className="text-gray-700 font-medium">Safe Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-yellow-500 rounded"></div>
            <span className="text-gray-700 font-medium">Warning Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-red-500 rounded"></div>
            <span className="text-gray-700 font-medium">Critical Connection</span>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="text-center text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Network shows similarity relationships between students</p>
          <p>• Circle size = Individual similarity score • Lines = Shared similarities • Percentages = Connection strength</p>
        </div>
      </div>
    </div>
  );
};

const PlagiarismReportScreen = () => {
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('plagiarismResults');
    if (stored) setResults(JSON.parse(stored));
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Report Data Found</h2>
          <p className="text-gray-500">Please generate a plagiarism report first.</p>
        </div>
      </div>
    );
  }

  // Data processing
  const nodes = results.submissions.map(sub => ({
    id: sub.id,
    label: sub.studentName || 'Unknown',
    value: parseFloat(sub.total_result) || 0,
  }));

  const edges = [];
  results.submissions.forEach(sub => {
    if (sub.submissionresults) {
      sub.submissionresults.forEach(comp => {
        if (comp.score > 0) {
          edges.push({ source: sub.id, target: comp.submission_id_compared, value: comp.score });
        }
      });
    }
  });

  const similarityBarData = results.submissions.map(sub => ({
    name: sub.studentName || 'Unknown',
    similarity: parseFloat(sub.result1) || 0,
  }));

  // Risk distribution for pie chart
  const riskDistribution = [
    { 
      name: 'High Risk (70%+)', 
      value: results.submissions.filter(sub => parseFloat(sub.result1) >= 70).length,
      color: '#DC2626'
    },
    { 
      name: 'Medium Risk (40-69%)', 
      value: results.submissions.filter(sub => {
        const sim = parseFloat(sub.result1);
        return sim >= 40 && sim < 70;
      }).length,
      color: '#D97706'
    },
    { 
      name: 'Low Risk (0-39%)', 
      value: results.submissions.filter(sub => parseFloat(sub.result1) < 40).length,
      color: '#059669'
    }
  ];

  // Trend data for area chart
  const trendData = results.submissions.map((sub, index) => ({
    submission: `S${index + 1}`,
    similarity: parseFloat(sub.result1) || 0,
    avgSimilarity: results.submissions.slice(0, index + 1)
      .reduce((acc, s) => acc + (parseFloat(s.result1) || 0), 0) / (index + 1)
  }));

  // Radar chart data
  const radarData = [
    { subject: 'Code Similarity', A: 85, fullMark: 100 },
    { subject: 'Structure Match', A: 65, fullMark: 100 },
    { subject: 'Comment Similarity', A: 45, fullMark: 100 },
    { subject: 'Variable Names', A: 70, fullMark: 100 },
    { subject: 'Logic Flow', A: 55, fullMark: 100 },
    { subject: 'Documentation', A: 40, fullMark: 100 }
  ];

  const getBarColor = sim => sim >= 70 ? '#DC2626' : sim >= 40 ? '#D97706' : '#059669';

  const stats = {
    totalSubmissions: results.submissions.length,
    averageSimilarity: results.submissions.length > 0 ? 
      (results.submissions.reduce((acc, sub) => acc + (parseFloat(sub.result1) || 0), 0) / results.submissions.length).toFixed(1) : 
      '0.0',
    maxSimilarity: Math.max(...results.submissions.map(sub => parseFloat(sub.result1) || 0)).toFixed(1),
    minSimilarity: Math.min(...results.submissions.map(sub => parseFloat(sub.result1) || 0)).toFixed(1),
    highRiskCount: results.submissions.filter(sub => parseFloat(sub.result1) >= 70).length,
    mediumRiskCount: results.submissions.filter(sub => {
      const sim = parseFloat(sub.result1);
      return sim >= 40 && sim < 70;
    }).length
  };

  // Quick Action Handlers
  const handleReviewHighRisk = () => {
    setShowHighRiskModal(true);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Create comprehensive report data
      const reportData = {
        title: 'Plagiarism Analysis Report',
        generatedAt: new Date().toISOString(),
        summary: {
          totalSubmissions: stats.totalSubmissions,
          averageSimilarity: stats.averageSimilarity,
          maxSimilarity: stats.maxSimilarity,
          minSimilarity: stats.minSimilarity,
          highRiskCount: stats.highRiskCount,
          mediumRiskCount: stats.mediumRiskCount
        },
        submissions: results.submissions.map(sub => ({
          id: sub.id,
          studentName: sub.studentName,
          similarity: parseFloat(sub.result1) || 0,
          riskLevel: parseFloat(sub.result1) >= 70 ? 'High' : 
                    parseFloat(sub.result1) >= 40 ? 'Medium' : 'Low',
          submissionDate: sub.created_at || 'N/A',
          details: sub.submissionresults || []
        })),
        analysis: {
          riskDistribution: riskDistribution,
          trends: trendData
        }
      };

      // Create and download JSON report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plagiarism-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Get high risk submissions for modal
  const highRiskSubmissions = results.submissions.filter(sub => parseFloat(sub.result1) >= 70);

  const handleExportHighRiskReport = () => {
    const highRiskReport = {
      title: 'High Risk Plagiarism Cases Report',
      generatedAt: new Date().toISOString(),
      criteria: 'Similarity score >= 70%',
      totalHighRiskCases: highRiskSubmissions.length,
      submissions: highRiskSubmissions.map(sub => ({
        id: sub.id,
        studentName: sub.studentName,
        similarityScore: parseFloat(sub.result1) || 0,
        submissionDate: sub.created_at || 'N/A',
        matches: sub.submissionresults?.map(result => ({
          comparedWith: result.submission_id_compared,
          matchScore: result.score
        })) || []
      }))
    };

    const blob = new Blob([JSON.stringify(highRiskReport, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `high-risk-plagiarism-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-transparent">
                Plagiarism Analysis Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive similarity detection and academic integrity insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGeneratingReport ? 'Generating...' : 'Export Report'}
              </button>
              <button 
                onClick={handleReviewHighRisk}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalSubmissions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">Total</span>
              <span className="text-gray-600 ml-2">submissions in current report</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Similarity</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.averageSimilarity}%</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">Overall</span>
              <span className="text-gray-600 ml-2">Code Similarity</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Cases</p>
                <p className="text-3xl font-bold text-red-600">{stats.highRiskCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">Critical</span>
              <span className="text-gray-600 ml-2">requires attention</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Integrity Score</p>
                <p className="text-3xl font-bold text-green-600">{(100 - parseFloat(stats.averageSimilarity)).toFixed(0)}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">Good</span>
              <span className="text-gray-600 ml-2">overall integrity</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'network', label: 'Network Analysis', icon: Activity },
                { id: 'distribution', label: 'Risk Distribution', icon: PieChartIcon },
                { id: 'trends', label: 'Trends & Patterns', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-3 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg'
                      : 'border-transparent text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 hover:border-blue-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enhanced Bar Chart */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Student Similarity Analysis
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={similarityBarData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        fontSize={11} 
                        interval={0}
                        stroke="#666"
                      />
                      <YAxis 
                        label={{ value: 'Similarity %', angle: -90, position: 'insideLeft' }} 
                        fontSize={11} 
                        domain={[0, 100]}
                        stroke="#666"
                      />
                      <Tooltip 
                        formatter={val => [`${val}%`, 'Similarity']} 
                        labelFormatter={label => `Student: ${label}`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <Bar dataKey="similarity" radius={[4, 4, 0, 0]}>
                        {similarityBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.similarity)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded border border-gray-300 shadow-sm"></div>
                      <span className="font-medium text-gray-800">Low (0-39%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-600 rounded border border-gray-300 shadow-sm"></div>
                      <span className="font-medium text-gray-800">Medium (40-69%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded border border-gray-300 shadow-sm"></div>
                      <span className="font-medium text-gray-800">High (70%+)</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Pie Chart */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Risk Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Submissions']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'network' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Similarity Network Graph
                  </h3>
                  <div className="h-[400px] flex items-center justify-center">
                    <NetworkGraph nodes={nodes} edges={edges} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Analysis Metrics
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" fontSize={10} />
                      <PolarRadiusAxis angle={60} domain={[0, 100]} fontSize={8} />
                      <Radar
                        name="Similarity Metrics"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'distribution' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Similarity Score Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart data={similarityBarData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        fontSize={10}
                        stroke="#374151"
                      />
                      <YAxis 
                        dataKey="similarity" 
                        domain={[0, 100]}
                        label={{ value: 'Similarity %', angle: -90, position: 'insideLeft' }}
                        stroke="#374151"
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Similarity']}
                        labelFormatter={(label) => `Student: ${label}`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          fontSize: '12px'
                        }}
                      />
                      <Scatter 
                        dataKey="similarity" 
                        fill="#8b5cf6"
                        stroke="transparent"
                        strokeWidth={2}
                        r={6}
                      >
                        {similarityBarData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.similarity >= 70 ? '#dc2626' : entry.similarity >= 40 ? '#d97706' : '#059669'}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  
                  {/* Enhanced Legend */}
                  <div className="mt-4 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded-full shadow-md border-2 border-white"></div>
                      <span className="font-semibold text-gray-800">Low Risk (0-39%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-600 rounded-full shadow-md border-2 border-white"></div>
                      <span className="font-semibold text-gray-800">Medium Risk (40-69%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded-full shadow-md border-2 border-white"></div>
                      <span className="font-semibold text-gray-800">High Risk (70%+)</span>
                    </div>
                  </div>
                  
                  {/* Statistics Summary */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
                      <div className="text-xs font-medium text-blue-800">Total Students</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.averageSimilarity}%</div>
                      <div className="text-xs font-medium text-purple-800">Average Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stats.maxSimilarity}%</div>
                      <div className="text-xs font-medium text-red-800">Highest Score</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Risk Assessment</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">High Risk</span>
                        <span className="text-lg font-bold text-red-600">{stats.highRiskCount} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(stats.highRiskCount / stats.totalSubmissions) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Medium Risk</span>
                        <span className="text-lg font-bold text-orange-600">{stats.mediumRiskCount} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${(stats.mediumRiskCount / stats.totalSubmissions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={handleReviewHighRisk}
                        className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                      >
                        <div className="font-medium text-blue-800 group-hover:text-blue-900">Review High Risk Cases</div>
                        <div className="text-sm text-blue-600 group-hover:text-blue-700">{stats.highRiskCount} submissions need attention</div>
                      </button>
                      <button 
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-medium text-green-800 group-hover:text-green-900">
                          {isGeneratingReport ? 'Generating...' : 'Generate Detailed Report'}
                        </div>
                        <div className="text-sm text-green-600 group-hover:text-green-700">
                          {isGeneratingReport ? 'Please wait...' : 'Export comprehensive analysis'}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Similarity Trends Over Time
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorSimilarity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="submission" 
                        fontSize={11}
                        stroke="#374151"
                        tickLine={{ stroke: '#9ca3af' }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        label={{ value: 'Similarity %', angle: -90, position: 'insideLeft' }}
                        fontSize={11}
                        stroke="#374151"
                        tickLine={{ stroke: '#9ca3af' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [`${value}%`, name === 'similarity' ? 'Individual Score' : 'Running Average']}
                        labelFormatter={(label) => `Submission: ${label}`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="similarity" 
                        stackId="1" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fill="url(#colorSimilarity)"
                        fillOpacity={1}
                        name="Individual Similarity"
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#1d4ed8', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avgSimilarity" 
                        stackId="2" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="url(#colorAverage)"
                        fillOpacity={1}
                        name="Running Average"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  {/* Trend Metrics */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {trendData.length > 0 ? Math.max(...trendData.map(d => d.similarity)) : 0}%
                      </div>
                      <div className="text-xs font-medium text-blue-800">Peak Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {trendData.length > 0 ? Math.min(...trendData.map(d => d.similarity)) : 0}%
                      </div>
                      <div className="text-xs font-medium text-green-800">Lowest Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {trendData.length > 0 ? (trendData.reduce((acc, d) => acc + d.avgSimilarity, 0) / trendData.length).toFixed(1) : 0}%
                      </div>
                      <div className="text-xs font-medium text-purple-800">Overall Avg</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-yellow-500">
                        {trendData.length > 0 ? (
                          trendData[trendData.length - 1].similarity > trendData[0].similarity ? '↗' : '↘'
                        ) : '→'}
                      </div>
                      <div className="text-xs font-medium text-yellow-500">Trend Direction</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-800">Trend Analysis</h4>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed font-medium">
                      Similarity scores show patterns across submissions, suggesting potential widespread collaboration or shared coding approaches.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-3">
                      <Users className="h-6 w-6 text-purple-600 mr-2" />
                      <h4 className="font-semibold text-purple-800">Pattern Detection</h4>
                    </div>
                    <p className="text-sm text-purple-800 leading-relaxed font-medium">
                      Multiple students exhibit similar coding patterns, indicating possible shared resources or collaborative work.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                      <h4 className="font-semibold text-red-800">Recommendations</h4>
                    </div>
                    <p className="text-sm text-red-800 leading-relaxed font-medium">
                      Consider implementing stricter guidelines and individual assessment methods for future assignments.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High Risk Modal */}
      {showHighRiskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mt-8 mb-4 flex flex-col max-h-[85vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">High Risk Submissions</h2>
              </div>
              <button
                onClick={() => setShowHighRiskModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {highRiskSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No High Risk Cases Found</h3>
                  <p className="text-gray-600">All submissions are within acceptable similarity ranges.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      ⚠️ {highRiskSubmissions.length} Submissions Require Immediate Attention
                    </h3>
                    <p className="text-red-700 text-sm">
                      These submissions show similarity scores of 70% or higher, indicating potential plagiarism concerns.
                    </p>
                  </div>
                  
                  {highRiskSubmissions.map((submission, index) => (
                    <div key={submission.id} className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {submission.studentName || 'Unknown Student'}
                          </h4>
                          <p className="text-sm text-gray-600">ID: {submission.id}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {parseFloat(submission.result1).toFixed(1)}%
                          </div>
                          <div className="text-sm text-red-700 font-medium">Similarity Score</div>
                        </div>
                      </div>
                      
                      {submission.submissionresults && submission.submissionresults.length > 0 && (
                        <div className="border-t border-gray-200 pt-3">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Similarity Matches:</h5>
                          <div className="space-y-2">
                            {submission.submissionresults.slice(0, 3).map((result, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                  vs Submission #{result.submission_id_compared}
                                </span>
                                <span className="font-medium text-red-600">
                                  {result.score}% match
                                </span>
                              </div>
                            ))}
                            {submission.submissionresults.length > 3 && (
                              <div className="text-xs text-gray-500 italic">
                                +{submission.submissionresults.length - 3} more matches...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg hover:bg-blue-200 transition-colors">
                          View Details
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-lg hover:bg-red-200 transition-colors">
                          Flag for Review
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                          Contact Student
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Fixed Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {highRiskSubmissions.length} of {stats.totalSubmissions} submissions
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowHighRiskModal(false)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={handleExportHighRiskReport}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Export High Risk Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlagiarismReportScreen;
