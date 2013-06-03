node-transparentCache
=====================

[![Build Status](https://travis-ci.org/zaphod1984/node-transparentCache.png)](https://travis-ci.org/zaphod1984/node-transparentCache)

Invocation:
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