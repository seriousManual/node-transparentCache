//TODO: detect if the function is a synchronous or asynchronous function

var strategies = require('./strategies');

/**
 * wrapes methods of an object that are defined with a transparent caching layer
 * @param client the clients methods get wrapped
 * @param options configuration for the caching strategies
 * @returns {*}
 */
function cachify(client, options) {
    options = options || {};
    var cachingStrategy = options.cachingStrategy || new strategies.Plain();
    var methods = options.methods || {};
    var cacheErrors = options.cacheErrors || true;

    Object.keys(methods).forEach(function(augmentFunctionName) {
        var _previous = client[augmentFunctionName];

        var me = function() {
            var argsArray = [].slice.apply(arguments);

            var collectedRelevantArguments = cachify._collectRelevantArguments(me._cacheConfig, argsArray);
            collectedRelevantArguments.unshift(augmentFunctionName);

            var cacheName = cachify._createCacheName(collectedRelevantArguments);
            var cacheContent = cachingStrategy.get(cacheName);

            if(cachify._isAsyncCall(argsArray)) {
                _handleAsyncCall(cacheContent, cacheName, argsArray);
            } else {
                return _handleSyncCall(cacheContent, cacheName, argsArray);
            }
        };

        me._cacheConfig = methods[augmentFunctionName];

        client[augmentFunctionName] = me;

        /**
         * handles a synchronous call, saves the result to the cache and returns the corresponding value
         * @param cacheContent
         * @param cacheName
         * @param argsArray
         * @returns {*}
         * @private
         */
        function _handleSyncCall (cacheContent, cacheName, argsArray) {
            if(cacheContent !== undefined) {
                return cacheContent;
            } else {
                var returnValue = _previous.apply(client, argsArray);

                cachingStrategy.set(cacheName, returnValue);

                return returnValue;
            }
        }

        /**
         * handles an asynchronous call, saves the result to the cache and calls the callback with
         * call arguments
         * @param cacheContent
         * @param cacheName
         * @param argsArray
         * @private
         */
        function _handleAsyncCall (cacheContent, cacheName, argsArray) {
            var _callback = argsArray.pop();

            if(cacheContent !== undefined) {
                _callback.apply(client, cacheContent);
            } else {
                //inserting our own callback
                argsArray.push(function() {
                    var returnValue = [].slice.apply(arguments);

                    cachingStrategy.set(cacheName, returnValue);

                    _callback.apply(client, returnValue);
                });

                _previous.apply(client, argsArray);
            }
        }
    });

    client._cache = cachingStrategy;

    return client;
}

/**
 * detects if a call is asnchronous
 * we're expecting a call to ba asynchronous if the last argument is a function
 * @param argsArray
 * @returns {boolean}
 * @private
 */
cachify._isAsyncCall = function(argsArray) {
    return argsArray.length > 0 && typeof argsArray[argsArray.length-1] === 'function';
};

/**
 * creates the cachename
 * @param listOfArguments
 * @returns {string}
 * @private
 */
cachify._createCacheName = function(listOfArguments) {

    var tmp = listOfArguments.map(function(argument) {
        switch (typeof argument) {
            case 'string':
                return argument;

            case 'number':
                return argument + '';

            default:
                return JSON.stringify(argument);
        }
    });

    return tmp.join('_');
};

/**
 * determines the arguments that are relevant for the caching of the result of a function call
 * @param cacheData
 * @param allArguments
 * @returns {Array}
 * @private
 */
cachify._collectRelevantArguments = function(cacheData, allArguments) {
    var relevantArguments = [];
    var i = 0;
    allArguments.forEach(function(argument) {
        if(cacheData.indexOf(i) >= 0) {
            relevantArguments.push(argument);
        }

        i++;
    });

    return relevantArguments;
};

/**
 * factory method to create a strategy
 * @param name the name of the strategy
 * @param options the options that get handed to the strategy on invocation
 */
cachify.createStrategy = function(name, options) {
    if(strategies[name]) {
        return new strategies[name](options);
    }

    throw new Error('strategy ' + name + ' not found');
};

cachify.strategies = strategies;

module.exports = cachify;
