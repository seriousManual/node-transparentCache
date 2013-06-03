var util = require('util');

var Strategy = require('./Strategy');

function Plain(options) {
    Strategy.call(this, options);

    this._cache = {};
}

util.inherits(Plain, Strategy);

Plain.prototype.get = function(name) {
    if(this._cache[name]) {
        return this._cache[name];
    }

    return undefined;
};

Plain.prototype.set = function(name, value) {
    this._cache[name] = value;
};

Plain.prototype.flush = function() {
    this._cache = {};
};

Plain.prototype.size = function() {
    return Object.keys(this._cache).length;
};

module.exports = Plain;