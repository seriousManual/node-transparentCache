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

    if(typeof client === 'object') {
        return cachify._augmentClient(client, options.methods || {}, cachingStrategy);
    } else if(typeof client === 'function') {
        return cachify._augmentFunction(client, options.parameters || [], cachingStrategy);
    } else {
        throw new Error('unknown client type');
    }
}

/**
 * augments a complete object
 *
 * @param client the object that should be augmented
 * @param cacheConfig the configuration that defines the cache dependencies
 * @param cachingStrategy the strategy that should be used
 * @returns {*}
 * @private
 */
cachify._augmentClient = function(client, cacheConfig, cachingStrategy) {
    Object.keys(cacheConfig).forEach(function(augmentFunctionName) {
        client[augmentFunctionName] = cachify._cacheMethod(client, client[augmentFunctionName],
            augmentFunctionName, cacheConfig[augmentFunctionName], cachingStrategy);
    });

    client._cache = cachingStrategy;

    return client;
};

/**
 * augments one single function
 *
 * @param method the method that should be cached
 * @param parameters the configuration of the caching dependency
 * @param cachingStrategy the caching strategy that's used
 * @returns {Function} the augmented function
 * @private
 */
cachify._augmentFunction = function(method, parameters, cachingStrategy) {
    var name = 'function[' + method.name + ']';

    var cachedFunction = cachify._cacheMethod(null, method, name, parameters, cachingStrategy);

    cachedFunction._cache = cachingStrategy;

    return cachedFunction;
};

/**
 * cache a single method, either belonging to a object or standalone
 * @param client null|{object}
 * @param innerFunction the function that should be cached
 * @param name name of the function
 * @param cacheConfig configuration that states which parameters are responsible
 * @param cachingStrategy the strategy thats used
 * @returns {Function}
 * @private
 */
cachify._cacheMethod = function(client, innerFunction, name, cacheConfig, cachingStrategy) {
    var me = function() {
        var argsArray = [].slice.apply(arguments);

        var collectedRelevantArguments = cachify._collectRelevantArguments(me._cacheConfig, argsArray);
        collectedRelevantArguments.unshift(name);

        var cacheName = cachify._createCacheName(collectedRelevantArguments);
        var cacheContent = cachingStrategy.get(cacheName);

        if(cachify._isAsyncCall(argsArray)) {
            return _handleAsyncCall(cacheContent, cacheName, argsArray);
        } else {
            return _handleSyncCall(cacheContent, cacheName, argsArray);
        }
    };

    me._cacheConfig = cacheConfig;

    return me;

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
            var returnValue = innerFunction.apply(client, argsArray);

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

            innerFunction.apply(client, argsArray);
        }
    }
};

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
