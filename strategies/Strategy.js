function Strategy(options) {
    this._options = options || {};
}

Strategy.prototype.get = function(name) {
    throw new Error('get not implemented');
};

Strategy.prototype.set = function(name, value) {
    throw new Error('set not implemented');
};

Strategy.prototype.flush = function() {
    throw new Error('set not implemented');
};

Strategy.prototype.size = function() {
    throw new Error('set not implemented');
};

module.exports = Strategy;