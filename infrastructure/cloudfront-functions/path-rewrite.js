/**
 * CloudFront Function for path rewriting
 * 
 * 1. Redirects app root paths to include trailing slash (e.g., /dread-ui -> /dread-ui/)
 * 2. Strips the app prefix from the URI before requesting from S3.
 *    For example: /gifster/index.html -> /index.html (from gifster bucket)
 */

function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // List of app paths that need trailing slashes
  var appPaths = [
    '/portfolio',
    '/home',
    '/dread-ui',
    '/gifster',
    '/fallcrate',
    '/shareme',
    '/su-done-ku',
    '/sketches',
    '/resume',
    '/ascii-video',
    '/steering-text',
    '/minesweeper',
    '/pathfinder-visualizer',
    '/enlight',
    '/quipster'
  ];
  
  // Check if URI matches an app root path without trailing slash
  for (var i = 0; i < appPaths.length; i++) {
    if (uri === appPaths[i]) {
      // Redirect to add trailing slash
      return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: {
          'location': { value: uri + '/' }
        }
      };
    }
  }
  
  // Extract the first path segment (app name)
  var pathParts = uri.split('/').filter(part => part !== '');
  
  if (pathParts.length > 0) {
    // Remove the first segment (app name) from the URI
    // /gifster/assets/foo.js -> /assets/foo.js
    // /gifster/ -> /
    var newPath = '/' + pathParts.slice(1).join('/');
    
    // Handle directory requests (ensure they get index.html)
    if (newPath === '/' || newPath.endsWith('/')) {
      newPath += 'index.html';
    }
    
    // Handle extensionless paths (client-side routes) - serve index.html
    if (!newPath.includes('.') && !newPath.endsWith('/')) {
      newPath = '/index.html';
    }
    
    request.uri = newPath;
  }
  
  return request;
}
