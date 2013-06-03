//TODO: accept a strategy that implements the way the cache values are stored
//TODO: e.g. plain Object, LRU-Cache, ringBuffer...

//TODO: invalidate
//TODO: objects as parameters

function cachify(client, config) {
    config = config || {};

    var cache = {};

    Object.keys(config).forEach(function(augmentFunctionName) {
        var _previous = client[augmentFunctionName];

        var me = function() {
            var collectedRelevantArguments = cachify._collectRelevantArguments(me._cacheData, [].slice.apply(arguments));
            collectedRelevantArguments.unshift(augmentFunctionName);

            var cacheName = cachify._createCacheName(collectedRelevantArguments);
            var cacheContent = cachify._lookupCache(cache, cacheName);

            if(cacheContent !== null) {
                return cacheContent;
            } else {
                var returnValue = _previous.apply(client, arguments);

                cachify._addToCache(cache, cacheName, returnValue);

                return returnValue;
            }
        };

        me._cacheData = config[augmentFunctionName];

        client[augmentFunctionName] = me;
    });

    return client;
}

cachify._createCacheName = function(listOfArguments) {
    return listOfArguments.join('_');
};

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

cachify._lookupCache = function(cache, name) {
    if(cache[name]) {
        return cache[name];
    }

    return null;
};

cachify._addToCache = function(cache, name, value) {
    cache[name] = value;
};

module.exports = cachify;