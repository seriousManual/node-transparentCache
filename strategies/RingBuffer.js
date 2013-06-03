var util = require('util');

var Strategy = require('./Strategy');

function RingBuffer(options) {
    Strategy.call(this, options);

    this._options.size = this._options.size || 10;

    this._ring = [];
    this._cache = {};
}

util.inherits(RingBuffer, Strategy);

RingBuffer.prototype.get = function(name) {
    if(this._cache[name]) {
        return this._cache[name];
    }

    return undefined;
};

RingBuffer.prototype.set = function(name, value) {
    if(!this._cache[name]) {
        if(this._ring.length >= this._options.size) {
            var toDelete = this._ring.pop();
            delete this._cache[toDelete];
        }

        this._ring.unshift(name);
    }

    this._cache[name] = value;
};

RingBuffer.prototype.flush = function() {
    this._ring = [];
    this._cache = {};
};

RingBuffer.prototype.size = function() {
    return this._ring.length;
};

module.exports = RingBuffer;