// const axios = require('axios');
// const fs = require('fs-extra');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');

// const COPYLEAKS_EMAIL = process.env.COPYLEAKS_EMAIL || 'frazcheema82003@gmail.com';
// const COPYLEAKS_API_KEY = process.env.COPYLEAKS_API_KEY || '58fbe107-e607-42c4-8075-118c8d682ed6';

// class CopyleaksService {

//   /**
//    * Fetch Copyleaks scan results and PDF report URL for a scanId
//    * @param {string} scanId
//    * @returns {Promise<object>} - { results, pdfUrl }
//    */
//   async getScanFullResults(scanId) {
//     const token = await this.authenticate();
//     // 1. Get scan results (matches, overview, etc.)
//     let results = null;
//     let pdfUrl = null;
//     try {
//       const url = `https://api.copyleaks.com/v3/scans/${scanId}/result`;
//       const res = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       results = res.data;
//     } catch (err) {
//       console.error(`[Copyleaks] Error fetching scan results for scanId ${scanId}:`, err.response?.data || err.message);
//     }
//     // 2. Get PDF report URL (if available)
//     try {
//       const pdfUrlEndpoint = `https://api.copyleaks.com/v3/scans/${scanId}/report/download/pdf`; // This is the documented endpoint for PDF
//       const pdfRes = await axios.get(pdfUrlEndpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//         maxRedirects: 0,
//         validateStatus: status => status === 302 // Only follow redirect
//       });
//       if (pdfRes.headers && pdfRes.headers.location) {
//         pdfUrl = pdfRes.headers.location;
//       }
//     } catch (err) {
//       // If 404 or not available, just skip
//       if (err.response && err.response.status !== 302) {
//         console.error(`[Copyleaks] PDF report not available for scanId ${scanId}:`, err.response?.data || err.message);
//       }
//     }
//     return { results, pdfUrl };
//   }
//   constructor() {
//     this.token = null;
//     this.tokenExpires = null;
//   }

//   async authenticate() {
//     if (this.token && this.tokenExpires && Date.now() < this.tokenExpires) {
//       return this.token;
//     }
//     const res = await axios.post('https://id.copyleaks.com/v3/account/login/api', {
//       email: COPYLEAKS_EMAIL,
//       key: COPYLEAKS_API_KEY
//     });
//     this.token = res.data.access_token;
//     // Token is valid for 60 minutes, set expiry 5 min before
//     this.tokenExpires = Date.now() + 55 * 60 * 1000;
//     return this.token;
//   }

//   async submitFileScan(fileBuffer, filename, scanId = uuidv4()) {
//     const token = await this.authenticate();
//     const base64 = fileBuffer.toString('base64');
//     const url = `https://api.copyleaks.com/v3/scans/submit/file/${scanId}`;
//     const body = {
//       base64,
//       filename,
//       properties: {
//         sandbox: false, // Set to false for production
//         action: 0, // 0 = Scan (required for starting scan)
//         webhooks: {
//           status: `https://example.com/webhook/{STATUS}/scan-${scanId}`
//         },
//         scanning: {
//           excludeWebResults: true,  // Only compare submitted files, don't search web
//           enableBatchScan: true,    // Enable comparing submissions with each other
//           compareAgainstSubmittedFiles: true // Compare with other submitted files
//         }
//       }
//     };
//     console.log(`[Copyleaks] [submitFileScan] scanId: ${scanId}, filename: ${filename}`);
//     console.log('[Copyleaks] [submitFileScan] Request body:', JSON.stringify(body, null, 2));
//     try {
//       const response = await axios.put(url, body, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       console.log(`[Copyleaks] [submitFileScan] API response for scanId ${scanId}:`, response.data);
//       return response.data || scanId;
//     } catch (err) {
//       if (err.response) {
//         console.error(`[Copyleaks] [submitFileScan] API error for scanId ${scanId}:`, err.response.status, err.response.statusText, err.response.data);
//       } else {
//         console.error(`[Copyleaks] [submitFileScan] API error for scanId ${scanId}:`, err.message);
//       }
//       throw err;
//     }
//   }

//   async exportScanResults(scanId) {
//     const token = await this.authenticate();
//     const exportId = uuidv4(); // Generate a unique export ID
//     const url = `https://api.copyleaks.com/v3/downloads/${scanId}/export/${exportId}`;
    
//     // Set up your server endpoint to receive results
//     const baseEndpoint = process.env.SERVER_URL || 'http://localhost:3000';
    
//     const body = {
//       results: [{
//         id: scanId,
//         verb: "POST",
//         endpoint: `${baseEndpoint}/api/copyleaks/results/${scanId}`
//       }],
//       pdfReport: {
//         verb: "POST",
//         endpoint: `${baseEndpoint}/api/copyleaks/pdf/${scanId}`
//       },
//       completionWebhook: `${baseEndpoint}/api/copyleaks/export-completed/${exportId}`,
//       maxRetries: 3
//     };

//     try {
//       await axios.post(url, body, {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       // Instead of waiting for webhook, directly fetch results
//       const results = await this.getScanFullResults(scanId);
//       return results;
//     } catch (error) {
//       console.error(`[Copyleaks] Error exporting results for scanId ${scanId}:`, error.response?.data || error.message);
//       throw error;
//     }
//   }

//   /**
//    * Utility function to add delay
//    * @param {number} ms - milliseconds to wait
//    * @returns {Promise} resolves after the specified delay
//    */
//   async delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

//   async startScans(scanIds) {
//     const token = await this.authenticate();
//     console.log('[Copyleaks] [startScans] Request body:', JSON.stringify({
//       trigger: scanIds,
//       errorHandling: 0
//     }, null, 2));
    
//     try {
//       // First start all scans
//       const startResponse = await axios.patch('https://api.copyleaks.com/v3/scans/start', {
//         trigger: scanIds,
//         errorHandling: 0
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       console.log('[Copyleaks] [startScans] API response:', startResponse.data);

//       // Wait for 10 seconds before attempting to get results
//       console.log('[Copyleaks] Waiting 10 seconds before fetching results...');
//       await this.delay(10000);

//       // For each scan, try to get results
//       const results = await Promise.all(
//         scanIds.map(async scanId => {
//           try {
//             const result = await this.getScanFullResults(scanId);
//             return {
//               scanId,
//               ...(result.results || {}),
//               pdfUrl: result.pdfUrl,
//               status: 'Completed'
//             };
//           } catch (err) {
//             console.error(`[Copyleaks] Error getting results for scanId ${scanId}:`, err.message);
//             return {
//               scanId,
//               error: 'Failed to get scan results',
//               status: 'Failed',
//               similarity: 0,
//               results: null,
//               pdfUrl: null
//             };
//           }
//         })
//       );

//       return {
//         startResponse: startResponse.data,
//         results
//       };
//     } catch (err) {
//       console.error('[Copyleaks] Error in startScans:', err.response?.data || err.message);
//       throw err;
//     }
//   }

//   async getScanStatus(scanId) {
//     const token = await this.authenticate();
//     const url = `https://api.copyleaks.com/v3/scans/status/${scanId}`;
//     const res = await axios.get(url, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     return res.data;
//   }

//   async getScanResults(scanId) {
//     const token = await this.authenticate();
//     const url = `https://api.copyleaks.com/v3/scans/${scanId}/result`;
//     const res = await axios.get(url, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     return res.data;
//   }

//   async getCredits() {
//     const token = await this.authenticate();
//     const url = 'https://api.copyleaks.com/v3/scans/credits';
//     const res = await axios.get(url, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     return res.data;
//   }
// }

// module.exports = new CopyleaksService();
