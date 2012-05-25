var vm = require('vm');
var _ = require('underscore')._;
var EventEmitter = require('events').EventEmitter;

var CancelError = require('./cancel-error');
var wrapAsyncFunctions = require('./wrap-async-functions')

module.exports = function asyncEval(code, options, callback) {
  if (!callback) {
    callback = arguments[1];
    options = undefined;
  }

  options = _.defaults(options || {}, {
      this: {}
    , asyncFunctions: {}
    , context: {}
  });

  var sandbox = _.extend(options.context, {
      _this: options.this
    , _error: undefined
    , cancel: function(message, arg) {
      throw new CancelError(message, arg);
    }
  });

  var done = function(err) {
    if (callback) callback(err);
  };

  var callbackCount = 0;

  var events = new EventEmitter();
  wrapAsyncFunctions(options.asyncFunctions, sandbox, events, done);

  events.on('addCallback', function() {
    callbackCount++;
  });

  events.on('finishCallback', function() {
    callbackCount--;
    if (callbackCount <= 0) {
      done();
    }
  });

  try {
    vm.runInNewContext("(function() {" + code + "\n}).call(_this)", sandbox);  

    if (callbackCount <= 0) {
      done();
    }
  } catch (err) {
    done(err);
  }

};