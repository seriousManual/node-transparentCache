# node-transparentCache

[![Build Status](https://travis-ci.org/zaphod1984/node-transparentCache.png)](https://travis-ci.org/zaphod1984/node-transparentCache)

## Installation

```$ npm install transparentcache```



## Invocation

transparentcache exposes one single function that can be used to cache the output of object members.
It follows the memoize pattern and accepts a configuration that specifies which parameters are acutally relevant for the cache name.

### options

* `cachingStrategy` specifies the strategy that is used to cache the method output, see "Strategies" below
* `methods` a hash which keys are the names of the methods to cache, its values are pointing to the index of the parameters that are relevant for the cache name. e.g. `{foo:[0]}`specifies that the function `foo` should be cached and that only the first parameter should be considered for caching.

## Examples

### Sync Caching

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

### Async Caching

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

A second optional constuctor parameter can be assigned to specify the the configuration of the caching strategy.

Four strategies are built-in:
* Plain: Simple key-value storage
* RingBuffer: Stores a finite number and kicks out the first inserted, accepts an additional options object that specifies the size. Accepts the parameter `size` (default: 10)
* Lru: Stores a finit number and kicks out the last recently used, accepts an additional options object that specifies the size. Accepts the parameter `size` (default: 10).
* Timeout: Stores cache values for a defined span of time. Accepts the parameter `ttl` which is the lifetime of a cache object in milliseconds. (default: 5 minute)
