var util = require('util');

var lruCache = require('lru-cache');

var Strategy = require('./Strategy');

function Lru(options) {
    Strategy.call(this, options);

    this._options.size = this._options.size || 10;

    this._cache = lruCache(this._options.size);
}

util.inherits(Lru, Strategy);

Lru.prototype.get = function(name) {
    return this._cache.get(name);
};

Lru.prototype.set = function(name, value) {
    return this._cache.set(name, value);
};

Lru.prototype.flush = function(name, value) {
    this._cache.reset();
};

Lru.prototype.size = function() {
    return this._cache.keys().length;
};

module.exports = Lru;