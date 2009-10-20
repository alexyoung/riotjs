/*jslint white: false plusplus: false onevar: false browser: true evil: true*/
/*global window: true*/
var Riot = {
  results: [],

  Benchmark: {
    results: [],

    addResult: function(start, end) {
      this.results.push(end - start);
    },

    displayResults: function() {
      var total   = 0,
          seconds = 0,
          i       = 0;
      for (i = 0; i < this.results.length; i++) {
        total += this.results[i];
      }
      seconds = total / 1000;
      return 'Elapsed time: ' + total + 'ms (' + seconds + ' seconds)';
    },

    run: function(times, callback) {
      this.results = [];
      for (var i = 0; i < times; i++) {
        var start = new Date(),
            end   = null;
        callback();
        end = new Date();
        this.addResult(start, end);
      }
      return this.displayResults();
    }
  },

  Formatters: {
    HTML: function() {
      function display(html) {
        var results = document.getElementById('test-results');
        results.innerHTML += html;
      }

      this.line = function(text) {
        display('<p>' + text + '</p>');
      };

      this.pass = function(message) {
        display('<p class="pass">' + message + '</p>');
      };

      this.fail = function(message) {
        display('<p class="fail">' + message + '</p>');
      };

      this.context = function(name) {
        display('<h3>' + name + '</h3>');
      };

      this.separator = function() {
        display('<hr />');
      };
    },

    Text: function() {
      function display(text) {
        print(text);
      }

      this.line = function(text) {
        display(text);
      };

      this.pass = function(message) {
        this.line('  +[32m ' + message + '[0m');
      };

      this.fail = function(message) {
        this.line('  -[31m ' + message + '[0m');
      };

      this.context = function(name) {
        this.line(name);
      };

      this.separator = function() {
        this.line('');
      };
    }
  },

  Context: function(name, callback, setup, teardown) {
    this.name             = name;
    this.callback         = callback;
    this.setupFunction    = setup;
    this.teardownFunction = teardown;

    this.asserts = function(name, result) {
      return new Riot.Assertion(this.name, name, result);
    },

    this.should = this.asserts;
    this.given  = Riot.given;

    this.run = function() {
      Riot.formatter.context(this.name);
      Riot.withThis(this, callback)();
      this.teardown();
    };

    this.setup = function() {
      if (typeof this.setupFunction !== 'undefined') {
        return this.setupFunction();
      }
    };

    this.teardown = function() {
      if (typeof this.teardownFunction !== 'undefined') {
        return this.teardownFunction();
      }
    };
  },

  Assertion: function(context_name, name, expected) {
    this.name           = name;
    this.expected_value = expected;
    this.context_name   = context_name;

    this.fail = function(message) {
      Riot.addResult(this.context, this.name, false);
      Riot.formatter.fail(message);
    };

    this.pass = function() {
      Riot.addResult(this.context, this.name, true);
      Riot.formatter.pass(this.name);
    };

    this.equals = function(expected) {
      if (expected === this.expected()) {
        this.pass();
      } else {
        this.fail(expected + ' does not equal: ' + this.expected());
      }
    };

    this.raises = function(expected) {
      try {
        this.expected_value();
      } catch (exception) {
        if (expected === exception) {
          this.pass();
          return;
        }
      }
      this.fail('did not raise ' + expected);
    };

    this.typeOf = function(expected) {
      var v = this.expected(),
          t = typeof this.expected();
      if (t === 'object') {
        if (v) {
          if (typeof v.length === 'number' &&
              !(v.propertyIsEnumerable('length')) &&
              typeof v.splice === 'function') {
            t = 'array';
          }
        } else {
          t = 'null';
        }
      }

      if (t === expected.toLowerCase()) {
        this.pass();
      } else {
        this.fail(expected + ' is not a type of ' + this.expected());
      }
    };

    this.kindOf = this.typeOf;

    this.isTrue = function() {
      if (this.expected() === true) {
        this.pass();
      } else {
        this.fail(this.expected() + ' was not true');
      }
    };

    this.isNull = function() {
      if (this.expected() === null) {
        this.pass();
      } else {
        this.fail(this.expected() + ' was not null');
      }
    };

    this.expected = function() {
      if (typeof this.expected_memo === 'undefined') {
        if (typeof this.expected_value === 'function') {
          this.expected_memo = this.expected_value();
        } else {
          this.expected_memo = this.expected_value;
        }
      }

      return this.expected_memo;
    };
  },

  run: function(tests) {
    if (typeof window === 'undefined') {
      Riot.formatter = new Riot.Formatters.Text();
      alert = print;
      Riot.runAndReport(tests);
    } else {
      Riot.formatter = new Riot.Formatters.HTML();
      var onload = window.onload;
      window.onload = function() {
        if (onload) { window.onload(); }
        Riot.runAndReport(tests);
      };
    }
  },

  runAndReport: function(tests) {
    var benchmark = Riot.Benchmark.run(1, this.withThis(Riot, tests));
    Riot.formatter.separator();
    Riot.summariseAllResults();
    Riot.formatter.line(benchmark);
  },

  functionBody: function(fn) {
    return fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
  },

  withThis: function(that, fn) {
    return function() { eval('with (that) {\n' + Riot.functionBody(fn) + '\n}\n'); }
  },

  context: function(title, callback) {
    var context = new Riot.Context(title, callback, this.setupFunction, this.teardownFunction);
    this.setupFunction = undefined;
    this.teardownFunction = undefined;
    return context.run();
  },

  given: function(title, callback) {
    title = 'Given ' + title;
    return Riot.context(title, callback);
  },

  setup: function(setupFunction) {
    this.setupFunction = setupFunction;
  },

  teardown: function(teardownFunction) {
    this.teardownFunction = teardownFunction;
  },

  summariseAllResults: function() { return this.summarise(this.results); },

  summarise: function(results) {
    var failures = 0;
    for (var i = 0; i < results.length; i++) {
      if (!results[i].pass) { failures++; }
    }
    this.formatter.line(results.length + ' assertions: ' + failures + ' failures');
  },

  addResult: function(context, assertion, pass) {
    var result = {
      assertion: assertion,
      pass:      pass,
      context:   context
    };
    this.results.push(result);
  }
};
