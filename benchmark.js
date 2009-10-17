Benchmark = {
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
    console.log(this.displayResults());
  }
};
