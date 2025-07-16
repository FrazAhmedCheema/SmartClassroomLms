// import React, { useEffect, useRef } from 'react';
// import { XCircle, X } from 'lucide-react';
// import * as d3 from 'd3';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// const NetworkGraph = ({ nodes, edges }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (!nodes || !edges) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = 350;
//     const height = 300;

//     // Create simulation
//     const simulation = d3.forceSimulation(nodes)
//       .force("link", d3.forceLink(edges).id(d => d.id).distance(80))
//       .force("charge", d3.forceManyBody().strength(-250))
//       .force("center", d3.forceCenter(width / 2, height / 2))
//       .force("collision", d3.forceCollide().radius(25));

//     // Create SVG
//     svg.attr("width", width).attr("height", height);

//     // Create links
//     const link = svg.append("g")
//       .selectAll("line")
//       .data(edges)
//       .enter().append("line")
//       .attr("stroke", "#999")
//       .attr("stroke-opacity", 0.6)
//       .attr("stroke-width", d => Math.max(1, Math.sqrt(d.value / 10)));

//     // Create edge labels for similarity scores
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
//       .text(d => `${d.value}%`)
//       .style("background", "white")
//       .style("padding", "2px");

//     // Create nodes
//     const node = svg.append("g")
//       .selectAll("circle")
//       .data(nodes)
//       .enter().append("circle")
//       .attr("r", d => Math.max(12, Math.min(25, d.value * 0.25)))
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

//     // Add node labels
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

//     // Add tooltips
//     node.append("title")
//       .text(d => `${d.label}\nSimilarity: ${d.value}%`);

//     // Update positions on simulation tick
//     simulation.on("tick", () => {
//       link
//         .attr("x1", d => d.source.x)
//         .attr("y1", d => d.source.y)
//         .attr("x2", d => d.target.x)
//         .attr("y2", d => d.target.y);

//       // Position edge labels at the midpoint of each edge
//       edgeLabels
//         .attr("x", d => (d.source.x + d.target.x) / 2)
//         .attr("y", d => (d.source.y + d.target.y) / 2);

//       node
//         .attr("cx", d => d.x)
//         .attr("cy", d => d.y);

//       label
//         .attr("x", d => d.x)
//         .attr("y", d => d.y);
//     });

//     // Drag functions
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

//     // Cleanup
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

// const PlagiarismReportModal = ({ isOpen, onClose, results }) => {
//   if (!isOpen || !results) return null;

//   // Close modal when clicking outside
//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   // Close modal on Escape key
//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === 'Escape') {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       document.removeEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, onClose]);

//   // Prepare data for network graph
//   const nodes = results.submissions.map(sub => {
//     const similarity = parseFloat(sub.total_result) || 0;
//     return {
//       id: sub.id,
//       label: sub.studentName || 'Unknown',
//       value: similarity,
//     };
//   });

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

//   // Prepare data for bar chart
//   const barChartData = results.submissions.map(sub => ({
//     name: sub.studentName || 'Unknown',
//     similarity: parseFloat(sub.total_result) || 0,
//   }));

//   // Prepare data for pie chart - similarity distribution
//   const pieChartData = [
//     { name: '0-20%', value: 0 },
//     { name: '21-40%', value: 0 },
//     { name: '41-60%', value: 0 },
//     { name: '61-80%', value: 0 },
//     { name: '81-100%', value: 0 },
//   ];

//   results.submissions.forEach(sub => {
//     const similarity = parseFloat(sub.total_result) || 0;
//     if (similarity <= 20) pieChartData[0].value++;
//     else if (similarity <= 40) pieChartData[1].value++;
//     else if (similarity <= 60) pieChartData[2].value++;
//     else if (similarity <= 80) pieChartData[3].value++;
//     else pieChartData[4].value++;
//   });

//   return (
//     <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
//       <div 
//         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
//         onClick={handleBackdropClick}
//       >
//         <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
//           <div className="h-full flex flex-col">
//             {/* Header */}
//             <div className="flex justify-between items-center p-4 border-b bg-gray-50">
//               <h2 className="text-xl font-bold text-blue-800">Detailed Plagiarism Analysis</h2>
//               <button
//                 onClick={onClose}
//                 className="p-1 hover:bg-gray-200 rounded-full transition-colors"
//               >
//                 <X className="w-5 h-5 text-gray-600" />
//               </button>
//             </div>

//             {/* Content */}
//             <div className="flex-1 overflow-y-auto p-4">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 {/* Network Graph */}
//                 <div className="bg-white p-3 rounded-lg shadow-md border">
//                   <h3 className="text-md font-semibold mb-3 text-gray-800">Similarity Network</h3>
//                   <div className="h-[300px] border rounded-lg bg-gray-50 flex items-center justify-center">
//                     <NetworkGraph nodes={nodes} edges={edges} />
//                   </div>
//                 </div>

//                 {/* Bar Chart */}
//                 <div className="bg-white p-3 rounded-lg shadow-md border">
//                   <h3 className="text-md font-semibold mb-3 text-gray-800">Similarity Scores</h3>
//                   <div className="h-[300px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={barChartData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} />
//                         <YAxis label={{ value: 'Similarity %', angle: -90, position: 'insideLeft' }} fontSize={10} />
//                         <Tooltip />
//                         <Legend />
//                         <Bar dataKey="similarity" fill="#3B82F6" name="Similarity %" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>

//                 {/* Pie Chart */}
//                 <div className="bg-white p-3 rounded-lg shadow-md border">
//                   <h3 className="text-md font-semibold mb-3 text-gray-800">Similarity Distribution</h3>
//                   <div className="h-[300px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={pieChartData}
//                           cx="50%"
//                           cy="50%"
//                           labelLine={false}
//                           label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
//                           outerRadius={120}
//                           fill="#8884d8"
//                           dataKey="value"
//                           fontSize={10}
//                         >
//                           {pieChartData.map((_, index) => (
//                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>

//                 {/* Summary Stats */}
//                 <div className="bg-white p-3 rounded-lg shadow-md border">
//                   <h3 className="text-md font-semibold mb-3 text-gray-800">Summary Statistics</h3>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="p-3 bg-blue-50 rounded-lg">
//                       <p className="text-xs text-blue-600">Total Submissions</p>
//                       <p className="text-xl font-bold text-blue-800">{results.submissions.length}</p>
//                     </div>
//                     <div className="p-3 bg-green-50 rounded-lg">
//                       <p className="text-xs text-green-600">Average Similarity</p>
//                       <p className="text-xl font-bold text-green-800">
//                         {(results.submissions.reduce((acc, sub) => acc + (parseFloat(sub.total_result) || 0), 0) / results.submissions.length).toFixed(1)}%
//                       </p>
//                     </div>
//                     <div className="p-3 bg-yellow-50 rounded-lg">
//                       <p className="text-xs text-yellow-600">Max Similarity</p>
//                       <p className="text-xl font-bold text-yellow-800">
//                         {Math.max(...results.submissions.map(sub => parseFloat(sub.total_result) || 0)).toFixed(1)}%
//                       </p>
//                     </div>
//                     <div className="p-3 bg-purple-50 rounded-lg">
//                       <p className="text-xs text-purple-600">Min Similarity</p>
//                       <p className="text-xl font-bold text-purple-800">
//                         {Math.min(...results.submissions.map(sub => parseFloat(sub.total_result) || 0)).toFixed(1)}%
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="p-4 border-t bg-gray-50">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
//               >
//                 Close Report
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlagiarismReportModal;





import React, { useEffect, useRef } from 'react';
import { XCircle, X } from 'lucide-react';
import * as d3 from 'd3';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const NetworkGraph = ({ nodes, edges }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!nodes || !edges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 350;
    const height = 300;

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25));

    // Create SVG
    svg.attr("width", width).attr("height", height);

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(edges)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.max(1, Math.sqrt(d.value / 10)));

    // Create edge labels for similarity scores
    const edgeLabels = svg.append("g")
      .selectAll("text")
      .data(edges)
      .enter().append("text")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("pointer-events", "none")
      .text(d => `${d.value}%`)
      .style("background", "white")
      .style("padding", "2px");

    // Create nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => Math.max(12, Math.min(25, d.value * 0.25)))
      .attr("fill", d => {
        const similarity = d.value;
        return similarity > 80 ? '#FCA5A5' : 
               similarity > 50 ? '#FDE68A' : 
               '#A7F3D0';
      })
      .attr("stroke", d => {
        const similarity = d.value;
        return similarity > 80 ? '#DC2626' : 
               similarity > 50 ? '#D97706' : 
               '#059669';
      })
      .attr("stroke-width", 2)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add node labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.label.length > 10 ? d.label.substring(0, 10) + '...' : d.label)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("pointer-events", "none");

    // Add tooltips
    node.append("title")
      .text(d => `${d.label}\nSimilarity: ${d.value}%`);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      // Position edge labels at the midpoint of each edge
      edgeLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Drag functions
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

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  return (
    <div className="flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

const PlagiarismReportModal = ({ isOpen, onClose, results }) => {
  if (!isOpen || !results) return null;

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Prepare data for network graph
  const nodes = results.submissions.map(sub => {
    const similarity = parseFloat(sub.total_result) || 0;
    return {
      id: sub.id,
      label: sub.studentName || 'Unknown',
      value: similarity,
    };
  });

  const edges = [];
  results.submissions.forEach(sub => {
    if (sub.submissionresults) {
      sub.submissionresults.forEach(comparison => {
        if (comparison.score > 0) {
          edges.push({
            source: sub.id,
            target: comparison.submission_id_compared,
            value: comparison.score,
          });
        }
      });
    }
  });

  // Dummy data for similarity bar chart with colorful bars
  const similarityBarData = [
    { name: 'Alice Johnson', similarity: 15 },
    { name: 'Bob Smith', similarity: 45 },
    { name: 'Carol Davis', similarity: 78 },
    { name: 'David Wilson', similarity: 92 },
    { name: 'Emma Brown', similarity: 23 },
    { name: 'Frank Miller', similarity: 67 },
    { name: 'Grace Lee', similarity: 34 },
    { name: 'Henry Taylor', similarity: 89 },
  ];

  // Debug logging
  console.log("Bar chart data:", similarityBarData);

  // Function to get bar color based on similarity percentage
  const getBarColor = (similarity) => {
    console.log("Getting color for similarity:", similarity);
    if (similarity >= 70) return '#DC2626'; // Red for high similarity
    if (similarity >= 40) return '#D97706'; // Yellow/Orange for medium similarity
    return '#059669'; // Green for low similarity
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[75vh] overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-blue-800">Detailed Plagiarism Analysis</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Network Graph */}
                <div className="bg-white p-3 rounded-lg shadow-md border">
                  <h3 className="text-md font-semibold mb-3 text-gray-800">Similarity Network</h3>
                  <div className="h-[300px] border rounded-lg bg-gray-50 flex items-center justify-center">
                    <NetworkGraph nodes={nodes} edges={edges} />
                  </div>
                </div>

                {/* Student Similarity Bar Chart */}
                <div className="bg-white p-3 rounded-lg shadow-md border">
                  <h3 className="text-md font-semibold mb-3 text-gray-800">Student Similarity Analysis</h3>
                  <div className="h-[300px] w-full bg-gray-100 flex items-center justify-center">
                    <div style={{ width: '100%', height: '300px' }}>
                      <BarChart 
                        width={600}
                        height={300}
                        data={similarityBarData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80} 
                          fontSize={10}
                          interval={0}
                        />
                        <YAxis 
                          label={{ value: 'Similarity %', angle: -90, position: 'insideLeft' }} 
                          fontSize={10}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Similarity']}
                          labelFormatter={(label) => `Student: ${label}`}
                        />
                        <Bar dataKey="similarity" fill="#3B82F6">
                          {similarityBarData.map((entry, index) => {
                            const color = getBarColor(entry.similarity);
                            console.log(`Bar ${index}: ${entry.name} - ${entry.similarity}% - Color: ${color}`);
                            return (
                              <Cell key={`cell-${index}`} fill={color} />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-600 rounded"></div>
                      <span className="text-black">Low (0-39%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-600 rounded"></div>
                      <span>Medium (40-69%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-600 rounded"></div>
                      <span>High (70%+)</span>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-white p-3 rounded-lg shadow-md border lg:col-span-2">
                  <h3 className="text-md font-semibold mb-3 text-gray-800">Summary Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600">Total Submissions</p>
                      <p className="text-xl font-bold text-blue-800">{results.submissions.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600">Average Similarity</p>
                      <p className="text-xl font-bold text-green-800">
                        {(results.submissions.reduce((acc, sub) => acc + (parseFloat(sub.total_result) || 0), 0) / results.submissions.length).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-600">Max Similarity</p>
                      <p className="text-xl font-bold text-yellow-800">
                        {Math.max(...results.submissions.map(sub => parseFloat(sub.total_result) || 0)).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600">Min Similarity</p>
                      <p className="text-xl font-bold text-purple-800">
                        {Math.min(...results.submissions.map(sub => parseFloat(sub.total_result) || 0)).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismReportModal;