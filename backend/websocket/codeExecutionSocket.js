const WebSocket = require('ws');
const url = require('url');
const codeExecutionService = require('../services/codeExecution');

function setupCodeExecutionWebSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws, req) => {
    const parsedUrl = url.parse(req.url, true);
    const pathParts = parsedUrl.pathname.split('/');

    if (pathParts.length === 4 && pathParts[1] === 'ws' && pathParts[2] === 'code-execution') {
      const containerId = pathParts[3];
      console.log(`Interactive terminal WebSocket connection established for container: ${containerId}`);
      
      codeExecutionService.attachToContainerStreams(containerId, ws)
        .catch(err => {
          console.error(`Error attaching to container ${containerId} streams:`, err);
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.send(`Error establishing connection: ${err.message}\r\n`);
            ws.close();
          }
        });
    } else {
      console.error('Error: wss connection handler called for non-interactive path:', req.url);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1008, "Invalid path for this WebSocket service");
      }
      return;
    }

    ws.on('error', (error) => {
      console.error(`WebSocket error on client from path ${req.url}. Code: ${error.code}, Message: ${error.message}`);
    });

    ws.on('close', (code, reason) => {
      const reasonString = reason instanceof Buffer ? reason.toString() : (reason || '').toString();
      console.log(`WebSocket connection from path ${req.url} closed. Code: ${code}, Reason: ${reasonString}`);
    });
  });

  // Handle WebSocket upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname && pathname.startsWith('/ws/code-execution/')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  return wss;
}

module.exports = { setupCodeExecutionWebSocket };
