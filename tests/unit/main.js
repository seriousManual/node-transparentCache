var expect = require('chai').expect;
var sinon = require('sinon');

var cachify = require('../../');

describe('main', function() {

    function FooClass() {}

    FooClass.prototype.one = sinon.stub().returns('one');
    FooClass.prototype.two = sinon.stub().returns('two');

    var fooObject = new FooClass();

    var fooObjectOneStub = fooObject.one;
    var fooObjectTwoStub = fooObject.two;

    var cached = cachify(fooObject, {'one':[]});

    cached.one();
    cached.one();
    cached.one();

    cached.two();
    cached.two();
    cached.two();

    it('should return the same object', function() {
        expect(cached).to.be.an.instanceOf(FooClass);
    });

    it('should be called only once', function() {
        expect(fooObjectOneStub.args.length).to.equal(1);
    });

    it('should be called thrice', function() {
        expect(fooObjectTwoStub.args.length).to.equal(3);
    });

});