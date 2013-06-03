var expect = require('chai').expect;
var sinon = require('sinon');

var cachify = require('../');

describe('unit', function() {

    it('should build the correct cacheName', function() {
        expect(cachify._createCacheName([1,2,3])).to.equal('1_2_3');
        expect(cachify._createCacheName(['abc', 'asdf'])).to.equal('abc_asdf');

        expect(cachify._createCacheName([{a:1}, 'asdf'])).to.equal('{"a":1}_asdf');
        expect(cachify._createCacheName(['abc', [1,2]])).to.equal('abc_[1,2]');
    });

});