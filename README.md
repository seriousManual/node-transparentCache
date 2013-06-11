# node-transparentCache

[![Build Status](https://travis-ci.org/zaphod1984/node-transparentCache.png)](https://travis-ci.org/zaphod1984/node-transparentCache)

## Invocation
```javascript
var cachify = require('transparentCache');

function FooClass(b) {
    this._a = 'foo';
    this._b = b;

    this.three = function() {
        console.log( 'three invoked' );
        return 'three';
    }
}

//two should not be cached!
FooClass.prototype.two = function() {
    console.log('two actually invoked');
    return 'two';
};

FooClass.prototype.one = function(a, b) {
    console.log( 'one actually invoked' );
    return '|' + b + '|' + this._a + '|' + this._b + '|' + this.two();
};

var fooObject = new FooClass('b');

var fooObjectCached = cachify(fooObject, {'one':[1], 'three':[]});

console.log( fooObjectCached.one(1,2) );
console.log( fooObjectCached.one(2,2) );
console.log( fooObjectCached.one(1,2) );

console.log( fooObjectCached.two() );
console.log( fooObjectCached.two() );

console.log( fooObjectCached.three() );
console.log( fooObjectCached.three() );
```

yields the following output:
```
one actually invoked
|2|foo|b|
|2|foo|b|
|2|foo|b|
two actually invoked
two
two actually invoked
two
three invoked
three
three
```

It also caches asynchronous function calls:
```javascript
function FooClass(b) {}

FooClass.prototype.one = function(a, callback) {
    console.log('actual invocation');
    setTimeout(function() {
        callback('|' + a + '|');
    }, 500);
};

var fooObject = new FooClass('b');

var fooObjectCached = cachify(fooObject, {'one':[0]});

fooObjectCached.one('a', function() {
    console.log(arguments);
});

fooObjectCached.one('a', function() {
    console.log(arguments);
});

setTimeout(function() {
    fooObjectCached.one('a', function() {
        console.log(arguments);
    });

    fooObjectCached.one('a', function() {
        console.log(arguments);
    });

    fooObjectCached.one('a', function() {
        console.log(arguments);
    });
}, 1000);
```

which yields:
```
actual invocation
actual invocation
{ '0': '|a|' }
{ '0': '|a|' }
{ '0': '|a|' }
{ '0': '|a|' }
{ '0': '|a|' }
```

## Strategies

One can specify several caching strategies.
Strategies can be created by either doing it by hand:
```javascript
var strategy = new cachify.strategies.Plain();
```
or using the factory method:
```javascript
var strategy = cachify.createStrategy('Plain');
```

Three strategies are built-in:
* Plain: Simple key-value storage
* RingBuffer: Stores a finite number and kicks out the first inserted, accepts an additional options object that specifies the size
* Lru: Stores a finit number and kicks out the last recently used, accepts an additional options object that specifies the size
* Timeout: Stores cache values for a defined span of time
