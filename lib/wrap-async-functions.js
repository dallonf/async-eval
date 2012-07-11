var _ = require('underscore')._;
var wrapError = require('./wrap-error');

function wrapAsyncFunctions(asyncFunctions, sandbox, events, done, sandboxRoot) {
  if (!sandboxRoot) sandboxRoot = sandbox;

  Object.keys(asyncFunctions).forEach(function(k) {
    if (typeof asyncFunctions[k] === 'function') {
      sandbox[k] = function() {
        if (sandboxRoot._error) return;
        events.emit('addCallback');

        var args = _.toArray(arguments);
        var callback = _.last(args);
        if (typeof callback === 'function') {
          args[args.length - 1] = function() {
            if (sandboxRoot._error) return;
            try {
              callback.apply(sandboxRoot._this, arguments);
              events.emit('finishCallback');  
            } catch (err) {
              err = wrapError(err);
              sandbox._error = err;
              done(err);
            }
          };
        } else {
          args.push(function() {
            if (sandboxRoot._error) return;
            events.emit('finishCallback');
          });
        }
        asyncFunctions[k].apply(sandboxRoot._this, args);
      };
    } else if (typeof asyncFunctions[k] === 'object') {
      sandbox[k] = sandbox[k] || {};
      wrapAsyncFunctions(asyncFunctions[k], sandbox[k], events, done, sandboxRoot);
    }
  });
}

module.exports = wrapAsyncFunctions;  