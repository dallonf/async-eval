var asyncEval = require('../');
var expect = require('chai').expect;

var wait = function(callback) {
  process.nextTick(callback);
};

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
    asyncEval('me.baz = me.foo;', { sandbox: {me: me} }, function() {
      expect(me.baz).to.equal('bar');
      done();
    });
  });

  it('should wait for an async function', function(done) {
    function test() {
      
    }

    var self = {};

    asyncEval("var self = this; wait( function() { this.x = 5; } );"
      , {this: self, asyncFunctions: {wait: wait}}, function() {
      expect(self.x).to.equal(5);
      done();
    })
  });
});