// Cache Busting Middleware
const VERSION = Date.now(); // Unique version based on deploy time

const cacheBusting = (req, res, next) => {
  // Add version to all responses
  res.locals.version = VERSION;
  
  // For HTML responses, inject version into asset URLs
  const originalSend = res.send;
  res.send = function(data) {
    if (typeof data === 'string' && res.get('Content-Type')?.includes('text/html')) {
      // Add version query string to CSS and JS files
      data = data.replace(
        /(href|src)=["']([^"']+\.(css|js))["']/gi,
        `$1="$2?v=${VERSION}"`
      );
    }
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = cacheBusting;
