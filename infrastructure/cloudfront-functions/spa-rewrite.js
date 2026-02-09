/**
 * CloudFront Function for SPA routing
 * 
 * This function ensures that requests to client-side routes
 * are served with the app's index.html file.
 * 
 * For example, /gifster/settings should serve /gifster/index.html
 * but preserve the URL for client-side routing.
 */

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // If URI doesn't have a file extension and doesn't end with /
  // assume it's a client-side route and serve index.html
  if (!uri.includes('.') && !uri.endsWith('/')) {
    // Extract the app base path (first segment after /)
    var pathParts = uri.split('/').filter(part => part !== '');
    
    if (pathParts.length > 0) {
      // For app subroutes like /gifster/settings
      // serve /gifster/index.html
      var appName = pathParts[0];
      request.uri = '/' + appName + '/index.html';
    } else {
      // For root path
      request.uri = '/index.html';
    }
  } else if (uri.endsWith('/')) {
    // If URI ends with /, append index.html
    request.uri += 'index.html';
  }

  return request;
}
