var util = require('util');

var Strategy = require('./Strategy');

function Timeout(options) {
    Strategy.call(this, options);

    this._options.ttl = this._options.ttl || (5 * 60 * 1000); //5 minutes

    this._cache = {};
}

util.inherits(Timeout, Strategy);

Timeout.prototype.get = function(name) {
    var cacheContent = this._cache[name];

    if(!this._cache[name]) {
        return undefined;
    }

    if(this._isOutdated(cacheContent)) {
        delete this._cache[name];

        return undefined;
    }

    return cacheContent.payload;
};

Timeout.prototype.set = function(name, value) {
    this._cache[name] = this._createCacheValue(value);
};

Timeout.prototype.flush = function() {
    this._cache = {};
};

Timeout.prototype.size = function() {
    return Object.keys(this._cache).length;
};

Timeout.prototype._isOutdated = function(cacheContent) {
    return new Date().getTime() - cacheContent.creation > this._options.ttl;
};

Timeout.prototype._createCacheValue = function(value) {
    return {payload: value, creation: new Date().getTime() };
};

module.exports = Timeout;