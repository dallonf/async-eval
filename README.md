# async-eval

Execute arbitrary JS with callbacks in node.js

Note: This library actually uses `vm.runInNewContext()` instead of `eval()` for a bit more added security, though it doesn't fork a process, so it's best used with trusted code.

## Example usage

    var asyncEval = require('async-eval');

    var someObject = {x: 5, y: 10};

    function waitOneSecond(callback) {
      setTimeout(callback, 1000);
    }

    var options = {
      this: someObject,
      asyncFunctions: {
        waitOneSecond: waitOneSecond
      }
    }

    asyncEval('waitOneSecond(function() { this.x += 2; });', options, function() {
      console.log(someObject.x); // 7
    });

## Usage

    asyncEval(code, [options], [callback])

asyncEval() will interpret and execute `code` and run `callback` when the code and every asynchronous function it calls has finished running.

## Options

**this**

*Default: {}*

Sets the object that will be used as `this` in the executed code and any nested callbacks.

**context**

*Default: {}*

Sets the global context in the executed code. Put any synchronous DSL functions and global variables here.

**asyncFunctions**

*Default: {}*

Registers asynchronous functions into the `context`. Asynchronous functions must be listed in the `asyncFunctions` property so that asyncEval can count pending callbacks.

The functions registered in `asyncFunctions` must take a callback as the last argument.

 These functions can be namespaced with objects, for example:

    asyncFunctions: {
      users: {
        get: function(callback) { /* ... */ },
        create: function(user, callback) { /* ... */ },
      },
      posts: {
        get: function(callback) { /* ... */ },
        create: function(post, callback) { /* ... */ },
      }
    }
