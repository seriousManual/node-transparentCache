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