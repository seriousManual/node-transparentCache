var expect = require('chai').expect;
var sinon = require('sinon');

var cachify = require('../');

describe('integration', function() {

    describe('error case', function() {
        function FooClass() {}

        var fooObject = new FooClass();

        expect(function() {
            cachify(fooObject, {methods:{'bar':[]}});
        }).to.throw(Error, /method "bar" not found/);
    });

    describe('stdFunctionality (object)', function() {
        function FooClass() {
            this.three = sinon.stub().returns('three');
        }

        FooClass.prototype.one = sinon.stub().returns('one');
        FooClass.prototype.two = sinon.stub().returns('two');

        var fooObject = new FooClass();

        var fooObjectOneStub = fooObject.one;
        var fooObjectTwoStub = fooObject.two;
        var fooObjectThreeStub = fooObject.three;

        var cached = cachify(fooObject, {methods:{'one':[]}});

        cached.one();
        cached.one();
        cached.one();

        cached.two();
        cached.two();
        cached.two();

        cached.three();
        cached.three();
        cached.three();

        it('should still return the correct value', function() {
            expect(cached.one()).to.equal('one');
            expect(cached.two()).to.equal('two');
            expect(cached.three()).to.equal('three');
        });

        it('should return the same object', function() {
            expect(cached).to.be.an.instanceOf(FooClass);
        });

        it('should be called only once', function() {
            expect(fooObjectOneStub.callCount).to.equal(1);
        });

        it('should be called four times', function() {
            expect(fooObjectTwoStub.callCount).to.equal(4);
            expect(fooObjectThreeStub.callCount).to.equal(4);
        });
    });

    describe('std functionality (function)', function() {
        var one = sinon.stub().returns('one');

        var cached = cachify(one, {parameters:[0]});

        var res1 = cached(1,1);
        var res2 = cached(1,2);
        var res3 = cached(1,3);
        var res4 = cached(1,4);
        var res5 = cached(1,5);

        it('should only use the first argument to determine the cachevalue', function() {
            expect(one.callCount).to.equal(1);
        });

        it('should have the correct output', function() {
            expect(res1).to.equal('one');
            expect(res2).to.equal('one');
            expect(res3).to.equal('one');
            expect(res4).to.equal('one');
            expect(res5).to.equal('one');
        })
    });

    describe('scalar parameters', function() {
        function FooClass() {}

        FooClass.prototype.one = sinon.stub().returns('one');

        var fooObject = new FooClass();

        var fooObjectOneStub = fooObject.one;

        var cached = cachify(fooObject, {methods:{'one':[0]}});

        cached.one(1,1);
        cached.one(1,2);
        cached.one(1,3);
        cached.one(1,4);
        cached.one(1,5);

        it('should only use the first argument to determine the cachevalue', function() {
            expect(fooObjectOneStub.callCount).to.equal(1);
        });
    });

    describe('complex parameters (object)', function() {
        function FooClass() {}

        FooClass.prototype.one = sinon.stub().returns('one');

        var fooObject = new FooClass();

        var fooObjectOneStub = fooObject.one;

        var cached = cachify(fooObject, {methods:{'one':[0]}});

        cached.one({a:1});
        cached.one({a:2});
        cached.one({a:2});
        cached.one({a:1});

        it('should use complex values for cachenames', function() {
            expect(fooObjectOneStub.callCount).to.equal(2);
        });
    });

    describe('complex parameters (array)', function() {
        function FooClass() {}

        FooClass.prototype.one = sinon.stub().returns('one');

        var fooObject = new FooClass();

        var fooObjectOneStub = fooObject.one;

        var cached = cachify(fooObject, {methods:{'one':[0]}});

        cached.one([1,2]);
        cached.one([1,2]);
        cached.one([3,4]);
        cached.one([3,4]);

        it('should use complex values for cachenames', function() {
            expect(fooObjectOneStub.callCount).to.equal(2);
        });
    });

    describe('asynchronous calls', function() {
        function FooClass() {}

        FooClass.prototype.one = sinon.stub().callsArgWith(0, 'x');

        var fooObject = new FooClass();

        var fooObjectOneStub = fooObject.one;

        var cached = cachify(fooObject, {methods:{'one':[0]}});

        var calls = 0;

        it('should use complex values for cachenames', function() {
            cached.one(function() {
                calls++;
            });

            cached.one(function() {
                calls++;
            });

            cached.one(function() {
                calls++;
            });

            expect(calls).to.equal(3);
            expect(fooObjectOneStub.callCount).to.equal(1);
        });
    });

});