var cachify = require('../');

function one(a, callback) {
    console.log('actual invocation');
    setTimeout(function() {
        callback('|' + a + '|');
    }, 100);
}

var oneCached = cachify(one, {parameters:[0]});

oneCached('a', function() {
    console.log(arguments);
});

oneCached('a', function() {
    console.log(arguments);
});

setTimeout(function() {
    oneCached('a', function() {
        console.log(arguments);
    });

    oneCached('a', function() {
        console.log(arguments);
    });

    oneCached('a', function() {
        console.log(arguments);
    });
}, 200);
