/*jslint white: false plusplus: false onevar: false browser: true evil: true*/
/*global window: true*/
var Riot = {
  all_results: [],
  results: [],
  current_context: '',
  debug: false,
  wants_aliases: true,

  aliases: {
    'context': 'Riot.context',
    'given':   'Riot.context',
    'asserts': 'Riot.asserts'
  },

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
      if (Riot.wants_aliases) {
        Riot.alias();
      }

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
        this.line("  [PASS] " + message);
      };

      this.fail = function(message) {
        this.line("  [FAIL] " + message);
      };

      this.context = function(name) {
        this.line("* " + name);
      };

      this.separator = function() {
        this.line('--------------------------------------------------');
      };
    }
  },

  Context: function(name, callback) {
    this.name     = name;
    this.callback = callback;

    this.run = function() {
      var context = this;
      Riot.current_context = this.name;
      Riot.reset();
      Riot.formatter.context(this.name);
      context.callback();
      Riot.current_context = '';
      Riot.reset();
    };
  },

  Assertion: function(name, expected) {
    this.name          = name;
    this.expectedValue = expected;

    this.fail = function(message) {
      Riot.addResult(this.current_context, this.name, false);
      Riot.formatter.fail(message);
    };

    this.pass = function() {
      Riot.addResult(this.current_context, this.name, true);
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
        this.expectedValue();
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
        this.fail('was not true');
      }
    };

    this.isNull = function() {
      if (this.expected() === null) {
        this.pass();
      } else {
        this.fail('was not null');
      }
    };

    this.expected = function() {
      if (typeof this.expectedMemo === 'undefined') {
        if (typeof this.expectedValue === 'function') {
          this.expectedMemo = this.expectedValue();
        } else {
          this.expectedMemo = this.expectedValue;
        }
      }

      return this.expectedMemo;
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
    var benchmark = Riot.Benchmark.run(1, tests);
    Riot.formatter.separator();
    Riot.summariseAllResults();
    Riot.formatter.line(benchmark);
  },

  alias: function() {
    var errors = '';
    for (var key in this.aliases) { if (this.aliases.hasOwnProperty(key)) {
      try {
        eval(key);
        errors += 'Unable to alias: ' + key + ' as ' + this.aliases[key];
      } catch (exception) {
        eval(key + ' = ' + this.aliases[key]);
      }
    }}

    if (errors.length > 0) { alert('Riot warning: ' + errors); }
  },

  context: function(title, callback) {
    return new Riot.Context(title, callback).run();
  },

  asserts: function(name, result) {
    return new Riot.Assertion(name, result);
  },

  reset: function() {
    this.results = [];
  },

  summariseResults:    function() { return this.summarise(this.results); },
  summariseAllResults: function() { return this.summarise(this.all_results); },

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
    this.all_results.push(result);
  }
};
