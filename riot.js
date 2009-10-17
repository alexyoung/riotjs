Riot = {
  all_results: [],
  results: [],
  results_id: 'test-results',
  current_context: '',
  debug: false,

  aliases: {
    'context': 'Riot.context',
    'given':   'Riot.context',
    'asserts': 'Riot.asserts',
  },

  Benchmark: {
    results: [],

    addResult: function(start, end) {
      this.results.push(end - start);
    },

    displayResults: function() {
      var total = 0,
          seconds = 0;
      for (i = 0; i < this.results.length; i++) {
        total += this.results[i];
      }
      seconds = total / 1000;
      return this.results.length + ' benchmarks ran in ' + total + 'ms (' + seconds + ' seconds)';
    },

    run: function(times, callback) {
      this.results = [];
      for (i = 0; i < times; i++) {
        var start = new Date();
        callback();
        var end = new Date();
        this.addResult(start, end);
      }
      return this.displayResults();
    }
  },

  run: function(tests) {
    var onload = window.onload;
    window.onload = function() {
      if (onload) window.onload();
      var benchmark = Riot.Benchmark.run(1, tests);
      Riot.display('<hr />');
      Riot.summariseAllResults();
      Riot.display('<p>' + benchmark + '</p>');
    }
  },

  alias: function() {
    for (var key in this.aliases) {
      try {
        eval(key)
      } catch (exception) {
        eval(key + ' = ' + this.aliases[key]);
      }
    }
  },

  context: function(title, callback) {
    new Context(title, callback).run();
  },

  asserts: function(name, result) {
    return new Assertion(name, result);
  },

  reset: function() {
    this.results = [];
  },

  summariseResults:    function() { return this.summarise(this.results); },
  summariseAllResults: function() { return this.summarise(this.all_results); },

  summarise: function(results) {
    var passes   = 0,
        failures = 0;
    for (i = 0; i < results.length; i++) {
      results[i].pass ? (passes += 1) : (failures += 1);
    }
    this.display('<p class="summary">' + results.length + ' assertions: ' + failures + ' failures</p>');
  },

  addResult: function(context, assertion, pass) {
    var result = {
      assertion: assertion,
      pass:      pass,
      context:   context
    };
    this.results.push(result);
    this.all_results.push(result);
  },

  display: function(html) {
    var results = document.getElementById(this.results_id);
    results.innerHTML += html;
  },

  displayMessage: function(message, pass) {
    var message   = (pass ? '[PASS] ' : '[FAIL] ') + message,
        className = pass ? 'pass' : 'fail';
    this.display('<p class="' + className + '">' + message + '</p>');
  }
};

function Context(name, callback) {
  this.name     = name;
  this.callback = callback;
}

Context.prototype.run = function() {
  var context = this;
  Riot.current_context = this.name;
  Riot.reset();
  Riot.display('<h3>' + this.name + '</h3>');
  context.callback();
  Riot.current_context = '';
  Riot.reset();
}

function Assertion(name, expected) {
  this.name          = name;
  this.expectedValue = expected;
}

Assertion.prototype.fail = function(message) {
  Riot.addResult(this.current_context, this.name, false);
  Riot.displayMessage(message, false);
}

Assertion.prototype.pass = function() {
  Riot.addResult(this.current_context, this.name, true);
  Riot.displayMessage(this.name, true);
}

Assertion.prototype.equals = function(expected) {
  if (expected == this.expected()) {
    this.pass();
  } else {
    this.fail(expected + ' does not equal: ' + this.expected());
  }
}

Assertion.prototype.typeOf = function(expected) {
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

  if (t == expected.toLowerCase()) {
    this.pass();
  } else {
    this.fail(expected + ' is not a type of ' + this.expected());
  }
}
Assertion.prototype.kindOf = Assertion.prototype.typeOf;

Assertion.prototype.isTrue = function() {
  if (this.expected() == true) {
    this.pass();
  } else {
    this.fail('was not true');
  }
}

Assertion.prototype.isNull = function() {
  if (this.expected() === null) {
    this.pass();
  } else {
    this.fail('was not null');
  }
}

Assertion.prototype.expected = function() {
  if (typeof this._expected === 'undefined') {
    if (typeof this.expectedValue === 'function') {
      this._expected = this.expectedValue();
    } else {
      this._expected = this.expectedValue;
    }
  }

  return this._expected;
}

Riot.alias();
