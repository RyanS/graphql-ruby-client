"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// An Apollo Link for using graphql-pro's Pubnub subscriptions
//
var apollo_link_1 = require("apollo-link");
var PubnubLink = /** @class */ (function (_super) {
    __extends(PubnubLink, _super);
    function PubnubLink(options) {
        var _this = _super.call(this) || this;
        _this.pubnub = options.pubnub;
        _this.handlersBySubscriptionId = {};
        _this.pubnub.addListener({
            message: function (message) {
                var subscriptionChannel = message.channel;
                var handler = _this.handlersBySubscriptionId[subscriptionChannel];
                if (handler) {
                    // Send along { result: {...}, more: true|false }
                    handler(message.message);
                }
            }
        });
        return _this;
    }
    PubnubLink.prototype.request = function (operation, forward) {
        var _this = this;
        return new apollo_link_1.Observable(function (observer) {
            // Check the result of the operation
            forward(operation).subscribe({ next: function (data) {
                    // If the operation has the subscription header, it's a subscription
                    var subscriptionChannel = _this._getSubscriptionChannel(operation);
                    if (subscriptionChannel) {
                        // This will keep pushing to `.next`
                        _this._createSubscription(subscriptionChannel, observer);
                    }
                    else {
                        // This isn't a subscription,
                        // So pass the data along and close the observer.
                        observer.next(data);
                        observer.complete();
                    }
                } });
        });
    };
    PubnubLink.prototype._getSubscriptionChannel = function (operation) {
        var response = operation.getContext().response;
        // Check to see if the response has the header
        var subscriptionChannel = response.headers.get("X-Subscription-ID");
        return subscriptionChannel;
    };
    PubnubLink.prototype._createSubscription = function (subscriptionChannel, observer) {
        var _this = this;
        this.pubnub.subscribe({ channels: [subscriptionChannel], withPresence: true });
        this.handlersBySubscriptionId[subscriptionChannel] = function (payload) {
            // Sent the subscription update along to Apollo
            if (payload.result) {
                observer.next(payload.result);
            }
            // The server unsubscribed; unsubscribe
            if (!payload.more) {
                _this.pubnub.unsubscribe({ channels: [subscriptionChannel] });
                delete _this.handlersBySubscriptionId[subscriptionChannel];
                observer.complete();
            }
        };
    };
    return PubnubLink;
}(apollo_link_1.ApolloLink));
exports.default = PubnubLink;
