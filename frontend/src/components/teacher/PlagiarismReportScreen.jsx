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
  FileText, Award, Target, Eye, Download, X, Flag, Code
} from 'lucide-react';
import CodeComparisonModal from './CodeComparisonModal';

const NetworkGraph = ({ nodes, edges }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!nodes || !edges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    const margin = 60; // Margin to keep nodes visible

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
      .force("link", d3.forceLink(edges).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    svg.attr("width", width).attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background", "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)")
      .style("border-radius", "12px")
      .style("max-width", "100%")
      .style("height", "auto");

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

      // Constrain nodes to stay within visible bounds
      node.attr("cx", d => {
        const nodeRadius = Math.max(35, Math.min(60, d.value * 0.9));
        return d.x = Math.max(nodeRadius + margin, Math.min(width - nodeRadius - margin, d.x));
      }).attr("cy", d => {
        const nodeRadius = Math.max(35, Math.min(60, d.value * 0.9));
        return d.y = Math.max(nodeRadius + margin, Math.min(height - nodeRadius - margin, d.y));
      });
      
      label.attr("x", d => d.x).attr("y", d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      const nodeRadius = Math.max(35, Math.min(60, d.value * 0.9));
      // Constrain drag position within bounds
      d.fx = Math.max(nodeRadius + margin, Math.min(width - nodeRadius - margin, event.x));
      d.fy = Math.max(nodeRadius + margin, Math.min(height - nodeRadius - margin, event.y));
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
      <div className="w-full max-w-4xl overflow-x-auto">
        <svg ref={svgRef} className="mx-auto"></svg>
      </div>
      <div className="mt-4 w-full max-w-4xl">
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
  const [showCodeComparison, setShowCodeComparison] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);

  useEffect(() => {
    console.log('=== PLAGIARISM REPORT SCREEN: Loading data ===');
    const stored = localStorage.getItem('plagiarismResults');
    console.log('Raw localStorage data:', stored?.substring(0, 200) + '...');
    
    if (stored) {
      const parsedResults = JSON.parse(stored);
      console.log('Parsed data structure:', Object.keys(parsedResults));
      console.log('parsedResults.detailedResults length:', parsedResults.detailedResults?.length);
      console.log('parsedResults.detailedResults sample:', parsedResults.detailedResults?.[0]);
      
      // Additional detailed logging for debugging
      if (parsedResults.detailedResults && parsedResults.detailedResults.length > 0) {
        console.log('=== DETAILED RESULTS BREAKDOWN ===');
        parsedResults.detailedResults.forEach((detail, index) => {
          console.log(`DetailedResult ${index}:`, {
            submissionId: detail.submission?.id,
            hasOtherMatches: !!detail.other_matches,
            otherMatchesCount: detail.other_matches?.length || 0,
            hasRelatedFiles: !!detail.related_files,
            relatedFilesCount: detail.related_files?.length || 0
          });
          
          if (detail.related_files && detail.related_files.length > 0) {
            console.log(`DetailedResult ${index} - first file sample:`, {
              hasContent: !!detail.related_files[0].content,
              contentLength: detail.related_files[0].content?.length || 0,
              contentPreview: detail.related_files[0].content?.substring(0, 100) + '...'
            });
          }
        });
      }
      
      setResults(parsedResults);
      
      // Note: detailedResults should already be in parsedResults.detailedResults
      // No need to load from separate localStorage key
      console.log('=== PLAGIARISM REPORT SCREEN: Data loaded successfully ===');
      console.log('Final results object:', {
        hasOverview: !!parsedResults.overview,
        hasSubmissions: !!parsedResults.submissions,
        hasDetailedResults: !!parsedResults.detailedResults,
        detailedResultsCount: parsedResults.detailedResults?.length
      });
    } else {
      console.log('No localStorage data found');
    }
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

  // Handle code comparison
  const handleViewCodeComparison = (submissionId) => {
    console.log('=== PLAGIARISM REPORT SCREEN: handleViewCodeComparison called ===');
    console.log('submissionId:', submissionId);
    console.log('results structure:', Object.keys(results || {}));
    console.log('results.detailedResults length:', results?.detailedResults?.length);
    console.log('Available detailedResults:', results?.detailedResults);
    
    setSelectedComparison({ submissionId });
    setShowCodeComparison(true);
    
    console.log('=== PLAGIARISM REPORT SCREEN: Modal should now open ===');
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
              <span className="text-gray-600 ml-2"> in current report</span>
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
                { id: 'comparisons', label: 'Code Comparisons', icon: Code },
                // { id: 'trends', label: 'Trends & Patterns', icon: TrendingUp }
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
                        formatter={(val, name, props) => {
                          const submission = results.submissions.find(s => s.studentName === props.payload.name);
                          return [
                            <div key="tooltip">
                              <div>{`${val}% Similarity`}</div>
                              {submission && parseFloat(submission.result1) >= 40 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewCodeComparison(submission.id);
                                  }}
                                  className="mt-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                                >
                                  View Code Comparison
                                </button>
                              )}
                            </div>
                          ];
                        }}
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

            {activeTab === 'comparisons' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-purple-600" />
                    Submissions with Code Similarities
                  </h3>
                  
                  {results.submissions.filter(sub => parseFloat(sub.result1) >= 40).length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Significant Similarities Found</h3>
                      <p className="text-gray-600">All submissions appear to be original work.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {results.submissions
                        .filter(sub => parseFloat(sub.result1) >= 40)
                        .sort((a, b) => parseFloat(b.result1) - parseFloat(a.result1))
                        .map((submission) => (
                          <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  parseFloat(submission.result1) >= 70 ? 'bg-red-100' : 'bg-orange-100'
                                }`}>
                                  <div className={`text-lg font-bold ${
                                    parseFloat(submission.result1) >= 70 ? 'text-red-600' : 'text-orange-600'
                                  }`}>
                                    {parseFloat(submission.result1).toFixed(0)}%
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-800">
                                    {submission.studentName || 'Unknown Student'}
                                  </h4>
                                  <p className="text-sm text-gray-600">ID: {submission.id}</p>
                                  <p className="text-sm text-gray-500">
                                    Submitted: {new Date(submission.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${
                                    parseFloat(submission.result1) >= 70 ? 'text-red-600' : 'text-orange-600'
                                  }`}>
                                    {parseFloat(submission.result1).toFixed(1)}%
                                  </div>
                                  <div className="text-sm text-gray-600">Similarity</div>
                                </div>
                                <button
                                  onClick={() => handleViewCodeComparison(submission.id)}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                                >
                                  <Code className="h-4 w-4" />
                                  <span>View Code</span>
                                </button>
                              </div>
                            </div>
                            
                            {submission.submissionresults && submission.submissionresults.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Similar to:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {submission.submissionresults.slice(0, 3).map((result, idx) => {
                                    const matchedSubmission = results.submissions.find(s => s.id === result.submission_id_compared);
                                    return (
                                      <div key={idx} className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                                        <span className="font-medium">
                                          {matchedSubmission?.studentName || `Submission #${result.submission_id_compared}`}
                                        </span>
                                        <span className="text-gray-600 ml-2">({result.score}%)</span>
                                      </div>
                                    );
                                  })}
                                  {submission.submissionresults.length > 3 && (
                                    <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-600">
                                      +{submission.submissionresults.length - 3} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
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
                        <button 
                          onClick={() => handleViewCodeComparison(submission.id)}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                        >
                          <Code className="h-3 w-3" />
                          Compare Code
                        </button>
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
      
      {/* Code Comparison Modal */}
      <CodeComparisonModal
        isOpen={showCodeComparison}
        onClose={() => {
          setShowCodeComparison(false);
          setSelectedComparison(null);
        }}
        comparisonData={selectedComparison}
        results={results}
      />
    </div>
  );
};

export default PlagiarismReportScreen;
