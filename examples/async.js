var cachify = require('../');

function FooClass(b) {}

FooClass.prototype.one = function(a, callback) {
    console.log('actual invocation');
    setTimeout(function() {
        callback('|' + a + '|');
    }, 100);
};

var fooObject = new FooClass('b');

var fooObjectCached = cachify(fooObject, {methods:{'one':[0]}});

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
}, 200);
