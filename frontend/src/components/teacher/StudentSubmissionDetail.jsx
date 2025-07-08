import React, { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Download, Send, User, CheckCircle, ArrowLeft, Play, Code, AlertTriangle, Info, Terminal as TerminalIcon } from 'lucide-react'; // Added TerminalIcon
import axios from 'axios';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
// import { WebLinksAddon } from 'xterm-addon-web-links'; // Optional: for clickable links in terminal
import 'xterm/css/xterm.css';
import ExecutionSummary from './ExecutionSummary'; 



const StudentSubmissionDetail = ({ student, submission, assignment, onBack, onGraded }) => {
  const [grade, setGrade] = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [loading, setLoading] = useState(false); // For grading
  const [runCodeLoading, setRunCodeLoading] = useState(false); // For running code
  const [error, setError] = useState(null); // General error for the component
  const [success, setSuccess] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [codeExecutionResult, setCodeExecutionResult] = useState(null);
  const [executionSummary, setExecutionSummary] = useState(null); // New state for structured summary
  const [summaryLoading, setSummaryLoading] = useState(false); // Loading state for summary generation
  const [currentProcessMessage, setCurrentProcessMessage] = useState(''); // New state for process messages

  // State for interactive terminal
  const [interactiveSession, setInteractiveSession] = useState({
    containerId: null,
    language: null,
    isRunning: false, // True if session is active (terminal visible)
    isLoading: false, // True when starting/stopping session
    isConnected: false, // WebSocket connection status
  });
  const terminalContainerRef = useRef(null); // Div element for xterm
  const xtermInstanceRef = useRef(null);   // xterm.js Terminal instance
  const fitAddonRef = useRef(null);        // xterm-addon-fit instance
  const websocketRef = useRef(null);       // WebSocket instance

  // State for MERN execution
  const [mernSession, setMernSession] = useState({
    sessionId: null,
    frontendUrl: null,
    backendUrl: null,
    isRunning: false,
    isLoading: false,
    isHealthy: false,
    status: null
  });

  // Initialize xterm.js terminal
  const initTerminal = () => {
    if (xtermInstanceRef.current || !terminalContainerRef.current) {
      console.warn('[XTerm] Init: Instance already exists or terminal container ref is null.');
      if (!terminalContainerRef.current) console.error('[XTerm] FATAL: terminalContainerRef.current is NULL during initTerminal. This should not happen if useEffect is timed correctly.');
      return;
    }

    console.log('[XTerm] Init: Initializing new terminal instance.');
    const term = new Terminal({
      cursorBlink: true,
      convertEol: true, // Important for proper line endings in terminal
      rows: 20,         // Default rows, FitAddon will adjust
      theme: {
        background: '#282c34', // Example dark theme
        foreground: '#abb2bf',
        cursor: '#61afef',
        selectionBackground: '#3e4451',
        black: '#282c34',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#d19a66',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#abb2bf',
        brightBlack: '#5c6370',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#d19a66',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff'
      }
    });

    fitAddonRef.current = new FitAddon();
    term.loadAddon(fitAddonRef.current);
    // term.loadAddon(new WebLinksAddon()); // Optional

    term.open(terminalContainerRef.current);
    console.log('[XTerm] Init: term.open() called on terminalContainerRef.current.'); 

    try {
      fitAddonRef.current.fit();
      console.log('[XTerm] Init: Initial fitAddon.fit() called.'); // Added log
    } catch (e) {
      console.warn("[XTerm] Init: Initial fit addon error (might be fine if terminal not fully visible yet):", e);
    }
    

    term.onData(data => { // User types in terminal
      console.log('[XTerm onData] Sending to WebSocket:', data, 'Type:', typeof data); // Enhanced log
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(data);
      }
    });
    
    xtermInstanceRef.current = term;
    console.log('[XTerm] Init: Terminal instance created and assigned to ref.'); // Added log
  };

  // Dispose xterm.js terminal
  const disposeTerminal = () => {
    console.log('[XTerm] Dispose: Disposing terminal instance.'); // Added log
    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.dispose();
      xtermInstanceRef.current = null;
    }
    if (fitAddonRef.current) {
      fitAddonRef.current.dispose();
      fitAddonRef.current = null;
    }
    // terminalContainerRef.current will be cleared by React if component unmounts or re-renders without it
  };

  // Connect WebSocket for interactive session
  const connectWebSocket = (containerId) => {
    if (websocketRef.current) {
      console.log('[WebSocket] Connect: Closing existing WebSocket connection.'); 
      websocketRef.current.close();
    }
    setCurrentProcessMessage("Connecting to interactive session...");
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//localhost:8080/ws/code-execution/${containerId}`;
    
    const ws = new WebSocket(wsUrl);
    websocketRef.current = ws;
    console.log(`[WebSocket] Connect: New WebSocket instance created for ${wsUrl}`); // Added log

    ws.onopen = () => {
      console.log('[WebSocket] Event: onopen - Connection established.');
      setInteractiveSession(prev => ({ ...prev, isConnected: true, isLoading: false }));
      setCurrentProcessMessage("Session connected. Auto-executing initial commands...");
      setTimeout(() => setCurrentProcessMessage("Ready for input or get summary."), 3000); // Clear message after a bit

      if (xtermInstanceRef.current) {
        xtermInstanceRef.current.focus();
        xtermInstanceRef.current.writeln('\r\n\x1b[32m[INFO] WebSocket connected. Waiting for shell prompt...\x1b[0m\r\n');
        console.log('[XTerm] Focus: Terminal focused after WebSocket open.');
         // Try to fit again once connected, ensuring terminal is ready for output
        if (fitAddonRef.current && terminalContainerRef.current?.offsetParent !== null) {
          try {
            fitAddonRef.current.fit();
            console.log('[XTerm] Fit: fitAddon.fit() called on WebSocket open.');
          } catch (e) {
            console.warn('[XTerm] Fit: Error during fit on WebSocket open:', e.message);
          }
        }
      } else {
        console.warn('[XTerm] Focus: xtermInstanceRef.current is null when trying to focus after WebSocket open.');
      }
    };

    ws.onmessage = (event) => { // Data from container
        const receivedData = event.data;
        console.log(`[WebSocket] Event: onmessage - Raw data received (type: ${typeof receivedData}):`, receivedData);

        if (xtermInstanceRef.current) {
            console.log('[XTerm] Write: Attempting to write to terminal.');
            let dataToWrite;
            if (typeof receivedData === 'string') {
                dataToWrite = receivedData;
                console.log('[XTerm] Write: Writing string data:', JSON.stringify(dataToWrite));
                xtermInstanceRef.current.write(dataToWrite);
            } else if (receivedData instanceof ArrayBuffer) {
                dataToWrite = new Uint8Array(receivedData);
                console.log('[XTerm] Write: Writing ArrayBuffer data (as Uint8Array):', dataToWrite);
                xtermInstanceRef.current.write(dataToWrite);
            } else if (receivedData instanceof Blob) {
                console.log('[XTerm] Write: Received Blob data. Reading as ArrayBuffer...');
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result instanceof ArrayBuffer && xtermInstanceRef.current) {
                         const blobDataAsUint8Array = new Uint8Array(reader.result);
                         console.log('[XTerm] Write: Writing Blob data (converted to Uint8Array):', blobDataAsUint8Array);
                         xtermInstanceRef.current.write(blobDataAsUint8Array);
                         console.log('[XTerm] Write: Finished writing Blob data to terminal.');
                    } else {
                        console.warn('[XTerm] Write: Failed to convert Blob or xterm instance became null.');
                    }
                };
                reader.onerror = () => {
                    console.error('[XTerm] Write: FileReader error converting Blob.');
                };
                reader.readAsArrayBuffer(receivedData);
            } else {
                console.warn('[WebSocket] onmessage: Received unknown data type:', receivedData);
            }
            if (typeof receivedData === 'string' || receivedData instanceof ArrayBuffer) { // For non-blob cases
                 console.log('[XTerm] Write: Finished writing data to terminal.');
            }
        } else {
            console.warn('[WebSocket] onmessage: xtermInstanceRef.current is null. Cannot write data. Data lost:', receivedData);
        }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Event: onerror - Error:', error);
      setCurrentProcessMessage(`WebSocket error. Check console. ${error.message}`);
      xtermInstanceRef.current?.writeln(`\r\n\x1b[31mWebSocket error. Check console.\x1b[0m\r\n`);
      setInteractiveSession(prev => ({ ...prev, isConnected: false, isLoading: false }));
    };

    ws.onclose = (event) => {
      console.log(`[WebSocket] Event: onclose - Code: ${event.code}, Reason: ${event.reason}, WasClean: ${event.wasClean}`);
      setCurrentProcessMessage("Interactive session disconnected.");
      if (xtermInstanceRef.current) {
        xtermInstanceRef.current.writeln(`\r\n\x1b[33mWebSocket disconnected: ${event.reason || (event.wasClean ? 'Clean close' : 'Connection lost')}\x1b[0m\r\n`);
      }
      setInteractiveSession(prev => ({ ...prev, isConnected: false, isLoading: false, isRunning: prev.containerId ? prev.isRunning : false })); // Keep terminal if containerId still exists, unless explicitly stopped
    };
  };

  const handleRunCodeInteractive = async () => {
    if (interactiveSession.isLoading || interactiveSession.isRunning) {
      console.log('[RunInteractive] Aborted: isLoading or isRunning is true.');
      return;
    }
    setExecutionSummary(null); 
    setCodeExecutionResult(null);
    setError(null);
    setCurrentProcessMessage("Preparing interactive session..."); 
    
    setInteractiveSession(prev => ({ ...prev, isLoading: true, isRunning: true, containerId: null, isConnected: false, language: null }));
    

    if (!submission?.files?.length) {
      setError('No files available to execute.');
      setCurrentProcessMessage("");
      setInteractiveSession(prev => ({ ...prev, isLoading: false, isRunning: false }));
      return;
    }
    const zipFile = submission.files.find(f => f.fileType === 'application/zip' || f.fileType === 'application/x-zip-compressed');
    if (!zipFile) {
      setError('No zip file found in submission for interactive execution.');
      setCurrentProcessMessage("");
      setInteractiveSession(prev => ({ ...prev, isLoading: false, isRunning: false }));
      console.error('[RunInteractive] No zip file found.');
      return;
    }

    try {
      setCurrentProcessMessage("Requesting session from server...");
      const response = await axios.post(
        `http://localhost:8080/code/execute-interactive`,
        { fileUrl: zipFile.url, submissionId: submission._id },
        { withCredentials: true }
      );

      if (response.data.success && response.data.containerId) {
        console.log(`[RunInteractive] Success from backend. Container ID: ${response.data.containerId}, Language: ${response.data.language}`);
        setCurrentProcessMessage("Session created by server. Initializing terminal window...");
        setInteractiveSession(prev => ({
          ...prev, 
          containerId: response.data.containerId,
          language: response.data.language,
          // isLoading is true, isConnected is false, isRunning is true
        }));
      } else {
        console.error('[RunInteractive] Backend call failed or did not return containerId. Response:', response.data);
        throw new Error(response.data.message || 'Failed to start interactive session on server.');
      }
    } catch (err) {
      console.error('[RunInteractive] Error during API call or setup:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to start interactive session.';
      setError(errorMsg); 
      setCurrentProcessMessage(`Error: ${errorMsg}`);
      xtermInstanceRef.current?.writeln(`\r\n\x1b[31mError starting session: ${errorMsg}\x1b[0m\r\n`);
      setInteractiveSession(prev => ({ ...prev, isLoading: false, isRunning: false, containerId: null }));
    }
  };
  
  const handleStopInteractiveCode = async () => {
    const currentContainerId = interactiveSession.containerId; 
    if (!currentContainerId && !interactiveSession.isRunning) { // If no container and not even in a running state (e.g. summary shown and cleared)
        console.warn("[StopInteractive] No active session or containerId to stop.");
        setInteractiveSession({ containerId: null, language: null, isRunning: false, isLoading: false, isConnected: false });
        setExecutionSummary(null);
        setCurrentProcessMessage("");
        return;
    }
    
    // If only summary is shown and user clicks "Stop Session" (which was "Get Summary & Stop")
    // and container is already stopped (containerId is null from previous stop)
    if (!currentContainerId && executionSummary) {
        console.log("[StopInteractive] Clearing summary and resetting UI.");
        setExecutionSummary(null);
        setInteractiveSession({ containerId: null, language: null, isRunning: false, isLoading: false, isConnected: false });
        setCurrentProcessMessage("");
        disposeTerminal(); // Clean up the terminal instance if it exists
        return;
    }
    
    if (!currentContainerId) {
        console.warn("[StopInteractive] No containerId to stop, but session might be in an intermediate state. Resetting.");
        setInteractiveSession(prev => ({ ...prev, isLoading: false, isRunning: false, isConnected: false, containerId: null }));
        setCurrentProcessMessage("Session was not fully active. Resetting.");
        return;
    }


    setSummaryLoading(true); // Use summaryLoading for the button's visual state
    setCurrentProcessMessage("Stopping session and generating execution summary...");
    xtermInstanceRef.current?.writeln('\r\n\x1b[33mStopping interactive session & preparing summary...\x1b[0m\r\n');
    
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    let terminalLogContent = "";
    if (xtermInstanceRef.current) {
        const buffer = xtermInstanceRef.current.buffer.active;
        for (let i = 0; i < buffer.length; i++) {
            terminalLogContent += buffer.getLine(i).translateToString(true) + '\n';
        }
        // Optionally clear the terminal after getting content, before showing summary
        // xtermInstanceRef.current.clear(); 
    }

    try {
      await axios.post(
        `http://localhost:8080/code/stop/${currentContainerId}`,
        {},
        { withCredentials: true }
      );
      xtermInstanceRef.current?.writeln('\x1b[32mSession stopped by request.\x1b[0m\r\n');
      console.log('[StopInteractive] Session stop request acknowledged by server.');

      // After stopping, try to get the analysis
      if (terminalLogContent.trim()) {
        setSummaryLoading(true);
        try {
          console.log('[StopInteractive] Requesting execution summary analysis...');
          const analysisResponse = await axios.post(
            `http://localhost:8080/code/analyze-output`,
            { terminalLog: terminalLogContent, languageHint: interactiveSession.language || assignment.category },
            { withCredentials: true }
          );
          if (analysisResponse.data.success && analysisResponse.data.analysis) {
            setExecutionSummary(analysisResponse.data.analysis);
            console.log('[StopInteractive] Execution summary received:', analysisResponse.data.analysis);
            setCurrentProcessMessage("Execution summary generated.");
          } else {
            console.error('[StopInteractive] Failed to get execution summary:', analysisResponse.data.message);
            setExecutionSummary([{ fileName: "Summary Error", description: "Could not generate execution summary.", output: "", errors: [{type: "Analysis Error", message: analysisResponse.data.message || "Unknown error during analysis."}], status: "Error" }]);
            setCurrentProcessMessage(`Failed to generate summary: ${analysisResponse.data.message || "Unknown error"}`);
          }
        } catch (analysisError) {
          console.error('[StopInteractive] Error fetching execution summary:', analysisError);
          setExecutionSummary([{ fileName: "Summary Error", description: "Failed to fetch execution summary.", output: "", errors: [{type: "Fetch Error", message: analysisError.message}], status: "Error" }]);
          setCurrentProcessMessage(`Error fetching summary: ${analysisError.message}`);
        } finally {
          setSummaryLoading(false);
        }
      } else {
         setSummaryLoading(false); // Ensure summaryLoading is false if no log content
         setCurrentProcessMessage("Session stopped. No terminal content to summarize.");
      }

    } catch (err) {
      console.error('[StopInteractive] Error stopping interactive session via API:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to stop session on server.';
      setError(prev => prev ? `${prev}\n${errorMsg}`: errorMsg);
      setCurrentProcessMessage(`Error stopping session: ${errorMsg}`);
      xtermInstanceRef.current?.writeln(`\r\n\x1b[31mError stopping session: ${errorMsg}\x1b[0m\r\n`);
      setSummaryLoading(false); // Ensure loading is stopped on error
    } finally {
      setInteractiveSession(prev => ({ 
        ...prev,
        containerId: null, 
        isLoading: false, 
        isConnected: false,
        // isRunning remains true if summary is to be shown, otherwise it's handled by summary clear
      }));
      // If no summary was generated and no terminal log, we might want to set isRunning to false.
      if (!terminalLogContent.trim() && !executionSummary) {
          setInteractiveSession(prev => ({...prev, isRunning: false}));
      }
      console.log("[StopInteractive] Session stop process finished.");
      // Message will be updated by summary success/failure or cleared if summary is displayed.
    }
  };

  // Effect for initializing terminal and connecting WebSocket when session starts
  useEffect(() => {
    if (interactiveSession.isRunning && interactiveSession.containerId && !interactiveSession.isConnected) {
      // Condition: session is marked as running, we have a containerId, but not yet connected.
      if (!xtermInstanceRef.current && terminalContainerRef.current) {
        console.log('[useEffect-TerminalInit] Conditions met: isRunning=true, terminalContainerRef exists, xtermInstance not set. Initializing terminal.');
        initTerminal();
        // After initTerminal, xtermInstanceRef.current should be set.
        // Write initial message if terminal is now ready.
        if (xtermInstanceRef.current) {
            xtermInstanceRef.current.writeln('\x1b[36m[INFO] Terminal initialized. Connecting to session...\x1b[0m\r\n');
        }
      }
      // Proceed to connect WebSocket if terminal is ready (or was already ready) and we have a containerId
      if (xtermInstanceRef.current && interactiveSession.containerId && !websocketRef.current && !interactiveSession.isConnected) {
        console.log(`[useEffect-TerminalInit] Terminal ready. Connecting WebSocket for containerId: ${interactiveSession.containerId}`);
        connectWebSocket(interactiveSession.containerId);
      } else if (!xtermInstanceRef.current && terminalContainerRef.current) {
        console.warn('[useEffect-TerminalInit] Terminal container ref exists, but xterm instance is still null after init attempt. WS connection deferred.');
      } else if (!terminalContainerRef.current) {
        console.error('[useEffect-TerminalInit] isRunning is true, but terminalContainerRef.current is null. Cannot init terminal or connect WebSocket.');
        // This case should be rare if isRunning correctly triggers div rendering.
        // Consider resetting state if this happens, as it's an invalid state.
        setError('Terminal display area failed to render. Cannot continue interactive session.');
        setInteractiveSession(prev => ({ ...prev, isLoading: false, isRunning: false, containerId: null }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactiveSession.isRunning, interactiveSession.containerId, interactiveSession.isConnected]); // Rerun if isRunning, containerId, or isConnected changes


  // Effect for resizing terminal with FitAddon
  useEffect(() => {
    // This effect now correctly handles cleanup on unmount.
    const currentContainerId = interactiveSession.containerId; // Capture at the time of effect setup
    const currentIsRunning = interactiveSession.isRunning; // Capture isRunning state

    // Resize listener setup
    const resizeListener = () => {
      // Check offsetParent to ensure the terminal container is actually visible in the layout
      if (xtermInstanceRef.current && fitAddonRef.current && terminalContainerRef.current?.offsetParent !== null) {
        try {
            fitAddonRef.current.fit();
            // console.log('[XTerm Resize] fitAddon.fit() called.'); // Can be noisy, enable if needed
        } catch(e) {
            console.warn("[XTerm Resize] Terminal fit error:", e.message);
        }
      }
    };

    if (currentIsRunning) { // Only add listener and do initial fit if session is running
        window.addEventListener('resize', resizeListener);
        // Initial fit when terminal becomes visible or session starts
        // Use a small timeout to allow layout to settle, especially after conditional rendering
        const fitTimeoutId = setTimeout(() => {
            console.log('[XTerm Resize] Attempting initial fit due to isRunning state change.');
            resizeListener();
        }, 100); // Increased delay slightly

        return () => {
            window.removeEventListener('resize', resizeListener);
            clearTimeout(fitTimeoutId);
            console.log('[XTerm Resize] Resize listener removed.');
        };
    }
  }, [interactiveSession.isRunning]); // Depend only on isRunning for adding/removing listener

  // Effect for cleanup on component unmount
  useEffect(() => {
    const sessionToCleanOnUnmount = { containerId: interactiveSession.containerId, isRunning: interactiveSession.isRunning };
    return () => {
      console.log(`[Unmount] StudentSubmissionDetail is unmounting. Cleaning up session for container: ${sessionToCleanOnUnmount.containerId}`);
      if (websocketRef.current) {
        console.log("[Unmount] Closing WebSocket.");
        websocketRef.current.close();
      }
      if (sessionToCleanOnUnmount.containerId) { 
        console.log(`[Unmount] Requesting stop for container ${sessionToCleanOnUnmount.containerId}.`);
        axios.post(`http://localhost:8080/code/stop/${sessionToCleanOnUnmount.containerId}`, {}, { withCredentials: true })
          .then(() => console.log(`[Unmount] Stop request for ${sessionToCleanOnUnmount.containerId} sent.`))
          .catch(err => console.error(`[Unmount] Error stopping container ${sessionToCleanOnUnmount.containerId}:`, err.message));
      }
      disposeTerminal(); // This will log internally
      console.log("[Unmount] Cleanup complete.");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array for unmount-only logic

  const handleGrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:8080/submission/grade/${submission._id}`,
        { grade, feedback },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(true);
        onGraded?.(response.data.submission);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = (file) => {
    if (file.fileType.startsWith('image/')) {
      return <img src={file.url} alt={file.fileName} className="max-w-full max-h-full object-contain" />;
    } else if (file.fileType === 'application/pdf') {
      return (
        <iframe
          src={file.url}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    } else if (
      file.fileType === 'application/msword' ||
      file.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.fileType === 'text/csv' ||
      file.fileType === 'application/vnd.ms-powerpoint' ||
      file.fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    } else {
      return <p className="text-gray-600">Preview not available for this file type.</p>;
    }
  };

  const handleDownload = (file) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleViewCode = async () => {
    try {
      setLoading(true); // Re-use general loading for simplicity, or use a specific one
      setError(null);
      
      if (!submission?.files) {
        setError('No files available to view');
        return;
      }

      const zipFile = submission.files.find(file => 
        file.fileType === 'application/zip' || 
        file.fileType === 'application/x-zip-compressed'
      );

      if (!zipFile) {
        setError('No zip file found in submission');
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/code-view/prepare',
        { fileUrl: zipFile.url },
        { withCredentials: true }
      );

      if (response.data.success && response.data.localPath) {
        const cleanPath = response.data.localPath.replace(/^file:\/\//, '');
        const vscodeUrl = `vscode://file/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
        window.location.href = vscodeUrl;
      } else {
        throw new Error('Failed to prepare code for viewing');
      }
    } catch (error) {
      console.error('Error viewing code:', error);
      setError(error.response?.data?.message || 'Failed to open code in VS Code');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => { // This is the original non-interactive run
    setRunCodeLoading(true);
    setError(null);
    setCodeExecutionResult(null);
    setExecutionSummary(null); // Clear any existing summary
    setCurrentProcessMessage("Executing code in batch mode...");
    
    if (!submission || !submission.files || submission.files.length === 0) {
      setError('No files available to execute');
      setCurrentProcessMessage("");
      setRunCodeLoading(false);
      return;
    }

    try {
      setCurrentProcessMessage("Sending code to server for batch execution...");
      const response = await axios.post(
        `http://localhost:8080/code/execute`,
        {
          files: submission.files, // Server will find the zip
          language: assignment.category, // Hint for backend, though it re-analyzes
          submissionId: submission._id
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCodeExecutionResult(response.data.result); 
        setCurrentProcessMessage("Batch execution finished. Results below.");
        // Optionally, generate summary for batch mode too
        // const batchLog = constructLogFromResult(response.data.result);
        // if (batchLog) { /* call analyze-output */ }
      } else {
        setError(response.data.message || 'Code execution request failed.');
        if(response.data.errorDetails) {
            setCodeExecutionResult({ error: response.data.errorDetails }); 
        }
        setCurrentProcessMessage(`Batch execution failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error executing code:', err);
      setError(err.response?.data?.message || err.message || 'Failed to execute code due to a network or server error.');
      if(err.response?.data?.errorDetails) {
        setCodeExecutionResult({ error: err.response.data.errorDetails });
      }
      setCurrentProcessMessage(`Error during batch execution: ${err.message || 'Network/Server error'}`);
    } finally {
      setRunCodeLoading(false);
      // setTimeout(() => setCurrentProcessMessage(""), 5000); // Clear message after a while
    }
  };

  const handleRunMERNStack = async () => {
    if (mernSession.isLoading || mernSession.isRunning) {
      console.log('[RunJSApp] Aborted: isLoading or isRunning is true.');
      return;
    }

    setError(null);
    setCurrentProcessMessage("Preparing JavaScript application execution locally...");
    setMernSession(prev => ({ ...prev, isLoading: true }));

    if (!submission?.files?.length) {
      setError('No files available to execute.');
      setCurrentProcessMessage("");
      setMernSession(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const zipFile = submission.files.find(f => f.fileType === 'application/zip' || f.fileType === 'application/x-zip-compressed');
    if (!zipFile) {
      setError('No zip file found in submission for JavaScript app execution.');
      setCurrentProcessMessage("");
      setMernSession(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setCurrentProcessMessage("Analyzing project structure and installing dependencies...");
      const response = await axios.post(
        `http://localhost:8080/code/execute-mern`,
        { fileUrl: zipFile.url, submissionId: submission._id },
        { withCredentials: true }
      );

      if (response.data.success) {
        console.log('[RunJSApp] Success:', response.data);
        setMernSession({
          sessionId: response.data.sessionId,
          frontendUrl: response.data.frontendUrl,
          backendUrl: response.data.backendUrl,
          isRunning: true,
          isLoading: false,
          isHealthy: false,
          status: response.data.status
        });
        setCurrentProcessMessage("JavaScript application deployed locally! Starting servers...");
        
        if (response.data.openBrowserUrl) {
          setTimeout(() => {
            window.open(response.data.openBrowserUrl, '_blank');
            setCurrentProcessMessage("Application is running! Browser opened in new tab.");
          }, 20000);
        }
        
      } else {
        throw new Error(response.data.message || 'Failed to deploy JavaScript application locally.');
      }
    } catch (err) {
      console.error('[RunJSApp] Error:', err);
      let errorMsg = err.response?.data?.message || err.message || 'Failed to deploy JavaScript application locally.';
      
      if (errorMsg.includes('spawn npm ENOENT') || errorMsg.includes('npm ENOENT')) {
        errorMsg = 'Node.js/npm not found or not properly installed. Please ensure Node.js is installed from https://nodejs.org/ and restart the application.';
      }
      
      setError(errorMsg);
      setCurrentProcessMessage(`Deployment Error: ${errorMsg}`);
      setMernSession(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleStopMERNStack = async () => {
    if (!mernSession.sessionId) return;

    setCurrentProcessMessage("Stopping JavaScript application...");
    setMernSession(prev => ({ ...prev, isLoading: true }));

    try {
      await axios.post(
        `http://localhost:8080/code/stop-mern/${mernSession.sessionId}`,
        {},
        { withCredentials: true }
      );
      
      setMernSession({
        sessionId: null,
        frontendUrl: null,
        backendUrl: null,
        isRunning: false,
        isLoading: false,
        isHealthy: false,
        status: null
      });
      setCurrentProcessMessage("JavaScript application stopped successfully.");
    } catch (err) {
      console.error('[StopJSApp] Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to stop JavaScript application.';
      setError(errorMsg);
      setCurrentProcessMessage(`Error stopping application: ${errorMsg}`);
    }
  };

  const isProgrammingAssignment = () => {
    const programmingCategories = ['java', 'c++', 'python', 'mern']; // MERN might need special handling not covered here
    return programmingCategories.includes(assignment.category.toLowerCase());
  };

  const isMERNAssignment = () => {
    return assignment.category.toLowerCase() === 'mern';
  };

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button 
            onClick={onBack}
            style={{color: "#1b68b3",}}
            className="flex items-center text-gray-700  font-medium bg-white px-4 py-2 rounded-lg border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to submissions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info and Assignment Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  {student.profilePicture ? (
                    <img
                      src={student.profilePicture}
                      alt={student.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{student.name}</h2>
                  <p className="text-gray-600 text-sm">{student.email}</p>
                  {submission?.submittedAt && (
                    <p className="text-gray-500 text-xs mt-1">
                      Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Assignment Details</h3>
                {assignment.dueDate && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    new Date(assignment.dueDate) < new Date()
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-2">{assignment.title}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            </div>

            {submission && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Submitted Files</h3>
                  <span className="text-xs text-gray-500">
                    {submission.files.length} {submission.files.length === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <div className="space-y-2">
                  {submission.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors group"
                    >
                      <div 
                        className="flex items-center space-x-3 cursor-pointer flex-grow"
                        onClick={() => setPreviewFile(file)}
                      >
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="truncate">
                          <p className="text-gray-700 font-medium truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-500">{file.fileType}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4"  style={{color:"white"}}/>
                      </button>
                    </div>
                  ))}
                </div>

                {submission.privateComment && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Student's Comment</h4>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-600 text-sm">{submission.privateComment}</p>
                    </div>
                  </div>
                )}

                {isProgrammingAssignment() && submission && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleViewCode}
                        disabled={loading || interactiveSession.isLoading || summaryLoading || runCodeLoading || mernSession.isLoading}
                        style={{backgroundColor: "#1b68b3"}}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <Code className="w-5 h-5" />
                        <span className="font-medium">View Code</span>
                      </button>
                      
                      {isMERNAssignment() ? (
                        // JavaScript application execution button
                        mernSession.isRunning ? (
                          <button
                            onClick={handleStopMERNStack}
                            disabled={mernSession.isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                          >
                            {mernSession.isLoading ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                            <span className="font-medium">{mernSession.isLoading ? 'Stopping...' : 'Stop Application'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleRunMERNStack}
                            disabled={mernSession.isLoading || loading || interactiveSession.isLoading || summaryLoading || runCodeLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                          >
                            {mernSession.isLoading ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                            <span className="font-medium">{mernSession.isLoading ? 'Starting...' : 'Run Application'}</span>
                          </button>
                        )
                      ) : (
                        // Regular programming assignment buttons
                        (() => {
                          if (executionSummary) { // If summary is shown, this button could be "Start New Interactive Session"
                            return (
                              <button
                                onClick={() => {
                                  setExecutionSummary(null);
                                  disposeTerminal(); // Clean up old terminal
                                  setInteractiveSession({ isRunning: false, isLoading: false, isConnected: false, containerId: null, language: null });
                                  setCurrentProcessMessage("");
                                  // Then call handleRunCodeInteractive or let user click "Run Interactively" again
                                  // For simplicity, this just clears and user can click "Run Interactively"
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                              >
                                <TerminalIcon className="w-5 h-5" />
                                <span className="font-medium">Clear Summary & Reset</span>
                              </button>
                            );
                          } else if (interactiveSession.isRunning && interactiveSession.containerId && interactiveSession.isConnected) {
                            return ( // Session is active and connected
                              <button
                                onClick={handleStopInteractiveCode}
                                disabled={summaryLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                              >
                                {summaryLoading ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                  <Info className="w-5 h-5" /> 
                                )}
                                <span className="font-medium">{summaryLoading ? 'Generating Summary...' : 'Get Summary & Stop Session'}</span>
                              </button>
                            );
                          } else if (interactiveSession.isLoading && interactiveSession.isRunning) { // Starting up
                            return (
                              <button
                                disabled={true}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md opacity-50 cursor-not-allowed"
                              >
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span className="font-medium">Starting Session...</span>
                              </button>
                            );
                          } else { // Default: "Run Interactively"
                            return (
                              <button
                                onClick={handleRunCodeInteractive}
                                disabled={runCodeLoading || interactiveSession.isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                              >
                                <TerminalIcon className="w-5 h-5" />
                                <span className="font-medium">Run Interactively</span>
                              </button>
                            );
                          }
                        })()
                      )}
                    </div>
                    
                    {/* JavaScript Application Status Display */}
                    {mernSession.isRunning && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Application Status (Running Locally)</h4>
                        <div className="space-y-2 text-sm">
                          {mernSession.frontendUrl && (
                            <div className="flex justify-between">
                              <span>Frontend URL:</span>
                              <a 
                                href={mernSession.frontendUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 underline"
                              >
                                {mernSession.frontendUrl}
                              </a>
                            </div>
                          )}
                          {mernSession.backendUrl && (
                            <div className="flex justify-between">
                              <span>Backend URL:</span>
                              <a 
                                href={mernSession.backendUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 underline"
                              >
                                {mernSession.backendUrl}
                              </a>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              mernSession.isHealthy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {mernSession.isHealthy ? 'Running' : 'Starting'}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            <span>🏠 Running locally on your machine</span>
                          </div>
                          <div className="mt-2 text-xs text-blue-600">
                            <span>💡 Browser will open automatically when ready</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentProcessMessage && (
                        <div className="mt-3 p-2 text-sm text-center text-gray-700 bg-gray-100 rounded-md shadow">
                            {currentProcessMessage}
                        </div>
                    )}
                    
                    <p className="mt-3 text-sm text-gray-500 text-center">
                      Assignment Category: <span className="font-medium capitalize">{assignment.category}</span>
                      {interactiveSession.language && (interactiveSession.isRunning || interactiveSession.containerId || executionSummary) && (
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-300 capitalize">
                          Interactive: {interactiveSession.language} {interactiveSession.isConnected ? '(Connected)' : interactiveSession.isLoading ? '(Connecting...)' : interactiveSession.containerId ? '(Disconnected)' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Interactive Terminal Display Area */}
                {(interactiveSession.isRunning || interactiveSession.containerId) && !executionSummary && ( 
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">Interactive Terminal</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            interactiveSession.isLoading && !interactiveSession.isConnected ? 'bg-yellow-100 text-yellow-800 animate-pulse' : 
                            interactiveSession.isConnected ? 'bg-green-100 text-green-800' : 
                            interactiveSession.containerId ? 'bg-red-100 text-red-700' : // Has containerId but not connected (e.g. after stop)
                            'bg-gray-100 text-gray-800' // Default/Idle
                        }`}>
                            {interactiveSession.isLoading && !interactiveSession.isConnected ? 'Processing...' : 
                             interactiveSession.isConnected ? 'Connected' : 
                             interactiveSession.containerId ? 'Session Ended' :
                             'Idle'}
                        </span>
                    </div>
                    <div ref={terminalContainerRef} className="bg-[#282c34] rounded-lg p-1 min-h-[300px] max-h-[600px] overflow-hidden shadow-md">
                      {/* Xterm.js will attach here. Ensure this div is rendered when initTerminal is called. */}
                    </div>
                  </div>
                )}

                {/* Execution Summary Display Area */}
                {summaryLoading && (
                    <div className="mt-6 p-4 bg-gray-800 text-gray-300 rounded-lg shadow-md animate-pulse">
                        <p>Generating execution summary, please wait...</p>
                    </div>
                )}
                {executionSummary && !summaryLoading && (
                    <ExecutionSummary 
                        summaryData={executionSummary} 
                        onClearSummary={() => {
                            setExecutionSummary(null);
                            disposeTerminal(); // Clean up terminal instance
                            setInteractiveSession({ isRunning: false, isLoading: false, isConnected: false, containerId: null, language: null });
                            setCurrentProcessMessage(""); 
                        }}
                    />
                )}


                {/* Display Non-Interactive Code Execution Results (only if not in interactive mode and no summary) */}
                {codeExecutionResult && !interactiveSession.isRunning && !interactiveSession.containerId && !executionSummary && (
                  <div className="mt-6 bg-gray-900 rounded-lg p-6 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-200">Execution Results (Batch)</h4>
                      {codeExecutionResult.language && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-300 capitalize">
                          {codeExecutionResult.language}
                        </span>
                      )}
                    </div>

                    {/* General Error Display */}
                    {codeExecutionResult.error && (
                      <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 mr-2 text-red-400"/>
                          <strong className="font-semibold">Overall Execution Failed:</strong>
                        </div>
                        <p className="text-sm mb-1">{codeExecutionResult.error.message}</p>
                        {codeExecutionResult.error.aiAnalysis && typeof codeExecutionResult.error.aiAnalysis.explanation === 'string' && (
                           <div className="mt-2 text-xs p-3 bg-red-800/60 rounded">
                             <p><strong>AI Analysis:</strong> {codeExecutionResult.error.aiAnalysis.explanation}</p>
                           </div>
                        )}
                        {codeExecutionResult.error.rawBuildOutput && (
                            <details className="mt-2 text-xs">
                                <summary className="cursor-pointer hover:underline">Show Raw Build Output</summary>
                                <pre className="mt-1 p-2 bg-black/30 rounded whitespace-pre-wrap break-all">
                                    {codeExecutionResult.error.rawBuildOutput}
                                </pre>
                            </details>
                        )}
                      </div>
                    )}

                    {/* Per-File Results */}
                    {codeExecutionResult.fileResults && codeExecutionResult.fileResults.map((fileRes, index) => (
                      <div key={index} className="mb-6 p-4 bg-gray-800/70 rounded-lg border border-gray-700">
                        <h5 className="text-md font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-2">
                          File: <span className="font-mono">{fileRes.fileName}</span>
                        </h5>
                        
                        {/* Status Badge */}
                        <div className="mb-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full
                            ${fileRes.status === 'success' ? 'bg-green-500/30 text-green-300' : ''}
                            ${fileRes.status === 'compile_error' ? 'bg-red-500/30 text-red-300' : ''}
                            ${fileRes.status === 'runtime_error' ? 'bg-yellow-500/30 text-yellow-300' : ''}
                            ${fileRes.status === 'not_run_due_to_compile_error' ? 'bg-gray-500/30 text-gray-400' : ''}
                            ${['script_error', 'unknown', 'unknown_error'].includes(fileRes.status) ? 'bg-purple-500/30 text-purple-300' : ''}
                          `}>
                            Status: {fileRes.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Successful Output */}
                        {fileRes.status === 'success' && fileRes.stdout && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Output:</p>
                            <pre className="text-green-300 whitespace-pre-wrap p-3 bg-black/30 rounded font-mono text-sm">{fileRes.stdout}</pre>
                          </div>
                        )}

                        {/* Compile Error Analysis */}
                        {fileRes.status === 'compile_error' && fileRes.compileErrorAnalysis && (
                          <div className="space-y-2 text-sm">
                            <div className="text-red-400"><strong>Explanation:</strong> {fileRes.compileErrorAnalysis.explanation}</div>
                            <div className="text-yellow-400"><strong>Location:</strong> {fileRes.compileErrorAnalysis.location}</div>
                            <div className="text-blue-400"><strong>Solution:</strong> {fileRes.compileErrorAnalysis.solution}</div>
                            {fileRes.compileErrorAnalysis.rawErrors && (
                              <details className="mt-2 text-xs">
                                <summary className="cursor-pointer hover:underline text-gray-400">Show Raw Compiler Errors</summary>
                                <pre className="mt-1 p-2 bg-black/30 rounded whitespace-pre-wrap break-all text-red-400">
                                  {fileRes.compileErrorAnalysis.rawErrors}
                                </pre>
                              </details>
                            )}
                          </div>
                        )}
                        
                        {/* Runtime Error */}
                        {fileRes.status === 'runtime_error' && (
                          <div className="text-sm">
                            {fileRes.stdout && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-400 mb-1">Standard Output (if any):</p>
                                <pre className="text-gray-300 whitespace-pre-wrap p-3 bg-black/30 rounded font-mono text-sm">{fileRes.stdout}</pre>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mb-1">Runtime Error:</p>
                            <pre className="text-yellow-300 whitespace-pre-wrap p-3 bg-black/30 rounded font-mono text-sm">{fileRes.stderr}</pre>
                          </div>
                        )}
                        
                        {/* Other Statuses */}
                        {['not_run_due_to_compile_error', 'script_error', 'unknown', 'unknown_error'].includes(fileRes.status) && (
                            <div className="p-3 bg-gray-700/50 rounded text-gray-400 text-sm">
                                <Info size={16} className="inline mr-2"/>
                                {fileRes.stderr || `This file was marked as: ${fileRes.status.replace(/_/g, ' ')}.`}
                            </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
                 {error && !codeExecutionResult?.error && (!interactiveSession.isRunning && !interactiveSession.containerId) && ( // Display general Axios/network error if not already handled by codeExecutionResult.error
                    <div className="mt-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-700">
                        <AlertTriangle size={18} className="inline mr-2" />
                        <strong>Error:</strong> {error}
                    </div>
                )}
              </div>
            )}
          </div>

          {/* Grading Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Submission</h3>
              {success ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-green-600">Grade submitted successfully!</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Edit grade
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGrade} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade (out of {assignment?.points || 100})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={assignment?.points || 100}
                      placeholder="Enter grade..."
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={5}
                      className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none placeholder-gray-400"
                      placeholder="Provide constructive feedback..."
                    />
                  </div>

                  {error && !codeExecutionResult?.error && (!interactiveSession.isRunning && !interactiveSession.containerId) && ( // Display grading error if not a code execution general error and not in interactive mode
                    <div className="p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      style={{backgroundColor: "#1b68b3"}}
                      className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                        loading 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow-sm'
                      }`}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? 'Submitting...' : 'Submit Grade'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {previewFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-4 max-w-4xl w-full relative flex flex-col"
                style={{ height: '90vh' }}
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 truncate max-w-[80%]">
                    {previewFile.fileName}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDownload(previewFile)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 rounded-lg">
                  {renderPreview(previewFile)}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StudentSubmissionDetail;
