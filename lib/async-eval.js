var vm = require('vm');
var _ = require('underscore')._;
var EventEmitter = require('events').EventEmitter;

module.exports = function asyncEval(code, options, callback) {
  if (!callback) {
    callback = arguments[1];
    options = undefined;
  }

  options = _.defaults(options || {}, {
      this: {}
    , asyncFunctions: {}
    , sandbox: {}
  });

  var sandbox = _.extend(options.sandbox, {
      _this: options.this
    , done: function() {
      if (callback) callback();
    }
  });

  var done = sandbox.done;

  var callbackCount = 0;

  var events = new EventEmitter();
  wrapAsyncFunctions(options.asyncFunctions, sandbox, events);

  events.on('addCallback', function() {
    callbackCount++;
  });

  events.on('finishCallback', function() {
    callbackCount--;
    if (callbackCount <= 0) {
      done();
    }
  });

  vm.runInNewContext("(function() {" + code + "\n}).call(_this)", sandbox);

  if (callbackCount <= 0) {
    done();
  }
};

function wrapAsyncFunctions(asyncFunctions, sandbox, events) {
  Object.keys(asyncFunctions).forEach(function(k) {
    if (typeof asyncFunctions[k] === 'function') {
      sandbox[k] = function() {
        events.emit('addCallback');

        var args = _.toArray(arguments);
        var callback = _.last(args);
        if (typeof callback === 'function') {
          args[args.length - 1] = function() {
            callback.apply(sandbox._this, arguments);
            events.emit('finishCallback');
          };
        } else {
          args.push(function() {
            events.emit('finishCallback');
          });
        }
        asyncFunctions[k].apply(sandbox._this, args);
      };
    }

    //TODO: Support nested async functions
  });
}