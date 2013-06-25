var expect = require('chai').expect;
var sinon = require('sinon');

var cachify = require('../');
var strategies = require('../strategies');

describe('unit', function() {

    it('should build the correct cacheName', function() {
        expect(cachify._createCacheName([1,2,3])).to.equal('1_2_3');
        expect(cachify._createCacheName(['abc', 'asdf'])).to.equal('abc_asdf');

        expect(cachify._createCacheName([{a:1}, 'asdf'])).to.equal('{"a":1}_asdf');
        expect(cachify._createCacheName(['abc', [1,2]])).to.equal('abc_[1,2]');
    });

    it('should collect the correct arguments', function() {
        expect(cachify._collectRelevantArguments([0], ['abc', [1,2]])).to.deep.equal(['abc']);
        expect(cachify._collectRelevantArguments([0, 1], ['abc', [1,2]])).to.deep.equal(['abc', [1,2]]);
        expect(cachify._collectRelevantArguments([], ['abc', [1,2]])).to.deep.equal([]);
    });

    describe('strategies', function() {

        describe('factory method', function() {

            it('should throw on unknown strategy name', function() {
                expect(function() {
                    cachify.createStrategy('foo', {});
                }).to.throw;
            });

            it('should create the correct backend', function() {
                expect(cachify.createStrategy('Plain')).to.be.an.instanceOf(strategies.Plain);
            })

        });

        describe('plain', function() {
            var myPlain = new strategies.Plain();

            it('should get and set', function() {
                myPlain.set('a', 'b');
                expect(myPlain.size()).to.equal(1);
                expect(myPlain.get('a')).to.equal('b');
            });

            it('should flush', function() {
                myPlain.set('a', 'b');
                expect(myPlain.size()).to.equal(1);

                myPlain.flush();
                expect(myPlain.size()).to.equal(0);
            });
        });

        describe('ringBuffer', function() {
            var myRing = new strategies.RingBuffer({size:3});

            it('should get and set', function() {
                myRing.set('a', 'b');
                expect(myRing.size()).to.equal(1);
                expect(myRing.get('a')).to.equal('b');
            });

            it('should flush', function() {
                myRing.set('a', 'b');
                expect(myRing.size()).to.equal(1);

                myRing.flush();
                expect(myRing.size()).to.equal(0);
            });

            it('should move out older keys', function() {
                myRing.flush();

                myRing.set('a', 'aa');
                myRing.set('b', 'bb');
                myRing.set('c', 'cc');
                myRing.set('d', 'dd');
                expect(myRing.size()).to.equal(3);

                expect(myRing.get('a')).to.be.undefined;
                expect(myRing.get('b')).to.equal('bb');
                expect(myRing.get('c')).to.equal('cc');
                expect(myRing.get('d')).to.equal('dd');

            });
        });

        describe('LRU', function() {
            var myLru = new strategies.Lru({size:3});

            it('should get and set', function() {
                myLru.set('a', 'b');
                expect(myLru.size()).to.equal(1);
                expect(myLru.get('a')).to.equal('b');
            });

            it('should flush', function() {
                myLru.set('a', 'b');
                expect(myLru.size()).to.equal(1);

                myLru.flush();
                expect(myLru.size()).to.equal(0);
            });

            it('should move out the least used keys when adding new keys', function() {
                myLru.flush();

                myLru.set('a', 'aa');
                myLru.set('b', 'bb');
                myLru.set('c', 'cc');
                expect(myLru.size()).to.equal(3);

                myLru.get('a');
                myLru.get('b');

                myLru.set('d', 'dd');

                expect(myLru.get('a')).to.equal('aa');
                expect(myLru.get('b')).to.equal('bb');
                expect(myLru.get('c')).to.be.undefined
                expect(myLru.get('d')).to.equal('dd');
            });
        });

        describe('Timeout', function() {
            var myTimeout = new strategies.Timeout({ttl:50});

            it('should get and set', function() {
                myTimeout.set('a', 'b');
                expect(myTimeout.size()).to.equal(1);
                expect(myTimeout.get('a')).to.equal('b');
            });

            it('should flush', function() {
                myTimeout.set('a', 'b');
                expect(myTimeout.size()).to.equal(1);

                myTimeout.flush();
                expect(myTimeout.size()).to.equal(0);
            });

            it('should return the correct value within the timeout and after the timeout', function(done) {
                myTimeout.flush();

                myTimeout.set('a', 'aa');
                expect(myTimeout.size()).to.equal(1);

                setTimeout(function() {
                    expect(myTimeout.get('a')).to.equal('aa');
                }, 20);

                setTimeout(function() {
                    expect(myTimeout.get('a')).to.be.undefined;
                    expect(myTimeout._cache['a']).to.be.undefined;

                    done();
                }, 100);

            });
        });
    });
});