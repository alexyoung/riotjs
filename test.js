load('riot.js');

Riot.run(function() {
  context('basic riot functionality', function() {
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

    given('some objects that need type checks', function() {
      asserts('a string should be a String', 'String').kindOf('String');
      asserts('an array should be an Array', [1, 2, 3]).kindOf('Array');
      asserts('an array should be an Array', null).typeOf('null');
      asserts('an array should be an Array', null).typeOf('wrong');
    });
  });

  given('yet another context', function() {
    asserts('equals should compare strings as expected', 'test string').equals('test string');
  });
});

