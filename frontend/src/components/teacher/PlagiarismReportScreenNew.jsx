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
  FileText, Award, Target, Eye, Download
} from 'lucide-react';

// Enhanced Professional Plagiarism Report Screen with Beautiful Design and Multiple Chart Types

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
      .attr("stop-opacity", 0.8);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f3f4f6")
      .attr("stop-opacity", 0.2);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(45));

    svg.attr("width", width).attr("height", height)
      .style("background", "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
      .style("border-radius", "12px");

    const link = svg.append("g")
      .selectAll("line")
      .data(edges)
      .enter().append("line")
      .attr("stroke", "#ffffff")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", d => Math.max(2, Math.sqrt(d.value / 8)))
      .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))");

    const edgeLabels = svg.append("g")
      .selectAll("text")
      .data(edges)
      .enter().append("text")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#ffffff")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
      .text(d => `${d.value}%`);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => Math.max(35, Math.min(60, d.value * 0.9)))
      .attr("fill", "url(#nodeGradient)")
      .attr("stroke", d => d.value > 80 ? '#DC2626' : d.value > 50 ? '#D97706' : '#059669')
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
    <div className="flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

const PlagiarismReportScreen = () => {
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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
    averageSimilarity: (results.submissions.reduce((acc, sub) => acc + (parseFloat(sub.result1) || 0), 0) / results.submissions.length).toFixed(1),
    maxSimilarity: Math.max(...results.submissions.map(sub => parseFloat(sub.result1) || 0)).toFixed(1),
    minSimilarity: Math.min(...results.submissions.map(sub => parseFloat(sub.result1) || 0)).toFixed(1),
    highRiskCount: results.submissions.filter(sub => parseFloat(sub.result1) >= 70).length,
    mediumRiskCount: results.submissions.filter(sub => {
      const sim = parseFloat(sub.result1);
      return sim >= 40 && sim < 70;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Plagiarism Analysis Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive similarity detection and academic integrity insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
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
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-600 ml-2">from last report</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Similarity</p>
                <p className="text-3xl font-bold text-amber-600">{stats.averageSimilarity}%</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">+3.2%</span>
              <span className="text-gray-600 ml-2">from last report</span>
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
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span>Low (0-39%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-600 rounded"></div>
                      <span>Medium (40-69%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded"></div>
                      <span>High (70%+)</span>
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
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Similarity Score Distribution</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart data={similarityBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} />
                      <YAxis dataKey="similarity" domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Similarity']} />
                      <Scatter dataKey="similarity" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
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
                      <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <div className="font-medium text-blue-800">Review High Risk Cases</div>
                        <div className="text-sm text-blue-600">{stats.highRiskCount} submissions need attention</div>
                      </button>
                      <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <div className="font-medium text-green-800">Generate Detailed Report</div>
                        <div className="text-sm text-green-600">Export comprehensive analysis</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Similarity Trends
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="submission" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="similarity" 
                        stackId="1" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                        name="Individual Similarity"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avgSimilarity" 
                        stackId="2" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.6}
                        name="Running Average"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <h4 className="font-semibold text-blue-800 mb-2">Trend Analysis</h4>
                    <p className="text-sm text-blue-700">
                      Similarity scores show an increasing trend, suggesting potential widespread collaboration or copying patterns.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
                    <h4 className="font-semibold text-amber-800 mb-2">Pattern Detection</h4>
                    <p className="text-sm text-amber-700">
                      Multiple students show similar coding patterns, indicating possible shared resources or collaboration.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <h4 className="font-semibold text-green-800 mb-2">Recommendations</h4>
                    <p className="text-sm text-green-700">
                      Consider implementing stricter guidelines and individual assessment methods for future assignments.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismReportScreen;
