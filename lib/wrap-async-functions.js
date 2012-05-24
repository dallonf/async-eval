var _ = require('underscore')._;

function wrapAsyncFunctions(asyncFunctions, sandbox, events, done) {
  Object.keys(asyncFunctions).forEach(function(k) {
    if (typeof asyncFunctions[k] === 'function') {
      sandbox[k] = function() {
        if (sandbox._error) return;
        events.emit('addCallback');

        var args = _.toArray(arguments);
        var callback = _.last(args);
        if (typeof callback === 'function') {
          args[args.length - 1] = function() {
            if (sandbox._error) return;
            try {
              callback.apply(sandbox._this, arguments);
              events.emit('finishCallback');  
            } catch (err) {
              done(err);
            }
          };
        } else {
          args.push(function() {
            if (sandbox._error) return;
            events.emit('finishCallback');
          });
        }
        asyncFunctions[k].apply(sandbox._this, args);
      };
    }

    //TODO: Support namespaced async functions
  });
}

module.exports = wrapAsyncFunctions;