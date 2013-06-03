//TODO: factory method for strategy

var strategies = require('./strategies');

function cachify(client, config, cachingStrategy) {
    config = config || {};
    cachingStrategy = cachingStrategy || new strategies.Plain();

    Object.keys(config).forEach(function(augmentFunctionName) {
        var _previous = client[augmentFunctionName];

        var me = function() {
            var collectedRelevantArguments = cachify._collectRelevantArguments(me._cacheConfig, [].slice.apply(arguments));
            collectedRelevantArguments.unshift(augmentFunctionName);

            var cacheName = cachify._createCacheName(collectedRelevantArguments);
            var cacheContent = cachingStrategy.get(cacheName);

            if(cacheContent !== undefined) {
                return cacheContent;
            } else {
                var returnValue = _previous.apply(client, arguments);

                cachingStrategy.set(cacheName, returnValue);

                return returnValue;
            }
        };

        me._cacheConfig = config[augmentFunctionName];

        client[augmentFunctionName] = me;
    });

    return client;
}

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

module.exports = cachify;