if (typeof load != 'undefined') {
  load('riot.js');
}

Riot.run(function() {
  context('Basic riot functionality', function() {
    given('some simple equality tests', function() {
      asserts('a simple truth test should return true', true).isTrue();
      asserts('isNull is null', null).isNull();
    });

    given('another context', function() {
      asserts('equals should compare strings as expected', 'test string').equals('test string');
    });

    given('a context concerned with functions', function() {
      asserts('asserts() should allow functions to be compared', function() {
        return 'test string';
      }).equals('test string');
    });

    given('an example that requires a variable', function() {
      var user = { name: 'Grumble' };

      should('get evaluated before the assertions', user.name).equals('Grumble');
    });

    given('some objects that need type checks', function() {
      asserts('a string should be a String', 'String').kindOf('String');
      asserts('an array should be an Array', [1, 2, 3]).kindOf('Array');
      asserts('an array should be an Array', null).typeOf('null');
    });

    given('some exceptions', function() {
      asserts('this should raise ExampleError', function() { throw('ExampleError'); }).raises('ExampleError');
    });
  });

  given('yet another context', function() {
    asserts('equals should compare strings as expected', 'test string').equals('test string');
  });
});
