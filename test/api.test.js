var asyncEval = require('../');
var expect = require('chai').expect;

var wait = function(callback) {
  process.nextTick(callback);
};

function funcToString(func) {
  return "(" + func.toString() + ").apply(this)";
}

describe('asyncEval', function() {
  it('should run the callback', function(done) {
    asyncEval('var x = 5;', function() {
      done();
    });
  });

  it('should have access to this', function(done) {
    var self = {};
    asyncEval('this.x = 5;', { this: self }, function() {
      expect(self.x).to.equal(5);
      done();
    });
  });

  it('should have access to sandbox objects', function(done) {
    var me = {foo: 'bar'};
    asyncEval('me.baz = me.foo;', { context: {me: me} }, function() {
      expect(me.baz).to.equal('bar');
      done();
    });
  });

  it('should wait for an async function', function(done) {
    var self = {};

    asyncEval("var self = this; wait( function() { this.x = 5; } );"
      , {this: self, asyncFunctions: {wait: wait}}, function() {
      expect(self.x).to.equal(5);
      done();
    })
  });

  it('should return a syntax error', function(done) {
    asyncEval("x = 3.xxxx;", function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('should return a runtime error', function(done) {
    asyncEval("var x = undefined; \n x.toString();", function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('should not continue the event after cancel is called', function(done) {
    var test = function() {
      setTimeout(function() {
        this.x = 5;
      }, 10);
      cancel();
    };

    var self = {};

    asyncEval(funcToString(test), {this: self, asyncFunctions: { setTimeout: setTimeout }}, function(err) {
      setTimeout(function() {
        expect(this.x).to.not.exist;
        done();
      }, 100);
    });
  });

  it('should return a runtime error from a callback', function(done) {

    var test = function() {
      var foo = undefined;
      wait(function() {
        foo.toString();
      });
    };

    asyncEval(funcToString(test), {asyncFunctions: {wait: wait}}, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('should support namespaced async functions', function(done) {

    var async = {
      wait: {
        ten: function(callback) {
          setTimeout(callback, 10);
        }
        , fifty: function(callback) {
          setTimeout(callback, 50);
        }
      }
    };

    var test = function() {
      this.x = 1;
      wait.ten(function() {
        this.x += 10;
        wait.fifty(function() {
          this.x += 50;
        })
      });
    };

    var self = {};

    asyncEval(funcToString(test), {asyncFunctions: async, this: self}, function(err) {
      expect(self.x).to.equal(61);
      done(err);
    });

  });
});