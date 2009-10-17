Riot = {
  all_results: [],
  results: [],
  results_id: 'test-results',
  current_context: '',
  debug: false,

  run: function(tests) {
    var onload = window.onload;
    window.onload = function() {
      if (onload) window.onload();
      tests();
      Riot.display('<hr />');
      Riot.summariseAllResults();
    }
  },

  reset: function() {
    this.results = [];
  },

  summariseResults:    function() { return this.summarise(this.results); },
  summariseAllResults: function() { return this.summarise(this.all_results); },

  summarise: function(results) {
    var passes = 0,
        fails  = 0;
    for (i = 0; i < results.length; i++) {
      results[i].pass ? passes += 1 : fails += 1;
    }

    this.display('<p class="summary">' + results.length + ' assertions: ' + fails + ' failures</p>');
  },

  addResult: function(assertion, pass) {
    var result = {
      assertion: assertion,
      pass:      pass
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
  Riot.addResult('', this.name, false);
  Riot.displayMessage(message, false);
}

Assertion.prototype.pass = function() {
  Riot.addResult('', this.name, true);
  Riot.displayMessage(this.name, true);
}

Assertion.prototype.equals = function(expected) {
  if (expected == this.expected()) {
    this.pass();
  } else {
    this.fail(expected + ' does not equal: ' + this.expected());
  }
}

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

function context(title, callback) {
  var c = new Context(title, callback);
  c.run();
}

given = context;

function asserts(name, result) {
  return new Assertion(name, result);
}
