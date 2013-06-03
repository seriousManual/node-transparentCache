var expect = require('chai').expect;

var cachify = require('../../');

describe('main', function() {

    function FooClass() {}
    var cached = cachify(new FooClass());

    it('should return the same object', function() {
        expect(cached).to.be.an.instanceOf(FooClass);
    });

});