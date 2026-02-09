/**
 * CloudFront Function to add trailing slashes to directory-style paths
 * 
 * Ensures /minesweeper redirects to /minesweeper/ so CloudFront can match
 * the correct cache behavior pattern.
 */

function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // List of app paths that need trailing slashes
  var appPaths = [
    '/portfolio',
    '/camera-tricks',
    '/home',
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
  
  // Check if URI matches an app path without trailing slash
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
  
  return request;
}
