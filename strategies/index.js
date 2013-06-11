var Lru = require('./Lru');
var Plain = require('./Plain');
var RingBuffer = require('./RingBuffer');
var Timeout = require('./Timeout');

module.exports = {
    Lru: Lru,
    Plain: Plain,
    RingBuffer: RingBuffer,
    Timeout: Timeout
};