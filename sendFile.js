const fs = require('fs');
const path = require('path');

/**
 * Returns the content type based on the file extension
 * @param {string} filePath - The path to the file
 * @returns {string} The content type (MIME type)
 */
function getContentType(filePath) {
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain'
    };
    return contentTypes[ext] || 'text/html';
}

/**
 * Sends a response to the client
 * @param {object} res - The response object
 * @param {number} statusCode - HTTP status code
 * @param {string} contentType - Content type for the response
 * @param {string|Buffer} data - Data to send
 */
function sendResponse(res, statusCode, contentType, data) {
    res.writeHead(statusCode, {'content-type': contentType});
    res.write(data);
    res.end();
}

/**
 * Sends a file to the client with the appropriate content type
 * @param {string} filePath - The path to the file to send
 * @param {object} res - The response object
 */
function sendFile(filePath, res) {
    // Get the content type based on file extension
    const contentType = getContentType(filePath);
    
    // Read and serve the file
    fs.readFile(filePath, function(err, data) {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                sendResponse(res, 404, 'text/plain', '404 - File Not Found');
            } else {
                // Server error
                sendResponse(res, 500, 'text/plain', '500 - Internal Server Error');
            }
        } else {
            // Success - send the file
            sendResponse(res, 200, contentType, data);
        }
    });
}

module.exports = sendFile;
