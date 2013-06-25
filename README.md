# node-transparentCache

[![Build Status](https://travis-ci.org/zaphod1984/node-transparentCache.png)](https://travis-ci.org/zaphod1984/node-transparentCache)

## Installation

```$ npm install transparentcache```



## transparentcache(client, [options])

transparentcache exposes one single function that can be used to cache the output of object members or the output of single function.
It follows the memoize pattern and accepts a configuration that specifies which parameters are acutally relevant for the reidentification of a cache member.

### options (object)

* `cachingStrategy` specifies the strategy that is used to cache the method output, see "Strategies" below. (default: Plain)
* `methods` a hash which keys are the names of the methods to cache, its values are pointing to the index of the parameters that are relevant for the cache name. e.g. `{foo:[0]}` specifies that the function `foo` should be cached and that only the first parameter should be considered for caching.

### options (function)

* `cachingStrategy` specifies the strategy that is used to cache the method output, see "Strategies" below. (default: Plain)
* `parameters` an array that specifies which function parameters are responsible for the caching. e.g. `[0]` states that only the first argument should be considered for the cache identifcation name

## Examples

For more detailed examples check the `examples` folder where examples for the caching of asynchronous object members, synchronous object members and asynchronous functions are located.

### Sync Caching

```javascript
var cachify = require('../');

function one (a, b) {
    console.log( 'one actually invoked' );
    return '|' + b + '|' + a + '|' + b + '|';
}

var oneCached = cachify(one, {parameters:[0]});

console.log( oneCached(1, 2) );
console.log( oneCached(1, 3) );
console.log( oneCached(1, 4) );
console.log( oneCached(1, 5) );
console.log( oneCached(2, 2) );
console.log( oneCached(2, 999) );
```

yields the following output:
```
one actually invoked
|2|1|2|
|2|1|2|
|2|1|2|
|2|1|2|
one actually invoked
|2|2|2|
|2|2|2|
```

## Cachingstrategies

Cachingstrategies are responsible to implement the way in that the cache values are stored.

### Creation

Strategies can be created by either doing it by hand:
```javascript
var strategy = new cachify.strategies.Plain();
```

or using the factory method:
```javascript
var strategy = cachify.createStrategy('Plain');
```

A second optional constuctor parameter can be assigned to specify the the configuration of the caching strategy.

### Strategies

Four strategies are built-in:
* Plain: Simple key-value storage
* RingBuffer: Stores a finite number and kicks out the first inserted, accepts an additional options object that specifies the size. Accepts the parameter `size` (default: 10)
* Lru: Stores a finit number and kicks out the last recently used, accepts an additional options object that specifies the size. Accepts the parameter `size` (default: 10).
* Timeout: Stores cache values for a defined span of time. Accepts the parameter `ttl` which is the lifetime of a cache object in milliseconds. (default: 5 minutes)
