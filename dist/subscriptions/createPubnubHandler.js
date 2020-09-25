"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPubnubHandler = void 0;
function createPubnubHandler(options) {
    var pubnub = options.pubnub;
    var handlersBySubscriptionId = {};
    pubnub.addListener({
        message: function (message) {
            var subscriptionChannel = message.channel;
            var handler = handlersBySubscriptionId[subscriptionChannel];
            if (handler) {
                // Send along { result: {...}, more: true|false }
                handler(message.message);
            }
        }
    });
    var fetchOperation = options.fetchOperation;
    return function (operation, variables, cacheConfig, observer) {
        var channelName;
        // POST the subscription like a normal query
        fetchOperation(operation, variables, cacheConfig).then(function (response) {
            channelName = response.headers.get("X-Subscription-ID");
            handlersBySubscriptionId[channelName] = function (payload) {
                // TODO Extract this code
                // When we get a response, send the update to `observer`
                var result = payload.result;
                if (result && result.errors) {
                    // What kind of error stuff belongs here?
                    observer.onError(result.errors);
                }
                else if (result) {
                    observer.onNext({ data: result.data });
                }
                if (!payload.more) {
                    // Subscription is finished
                    observer.onCompleted();
                }
            };
            pubnub.subscribe({ channels: [channelName] });
        });
        return {
            dispose: function () {
                delete handlersBySubscriptionId[channelName];
                pubnub.unsubscribe({ channels: [channelName] });
            }
        };
    };
}
exports.createPubnubHandler = createPubnubHandler;
