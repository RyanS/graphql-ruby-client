import { ApolloLink, Observable, FetchResult, NextLink, Operation } from "apollo-link";
import Pubnub from "pubnub";
declare type RequestResult = Observable<FetchResult<{
    [key: string]: any;
}, Record<string, any>, Record<string, any>>>;
declare class PubnubLink extends ApolloLink {
    pubnub: Pubnub;
    handlersBySubscriptionId: {
        [key: string]: Function;
    };
    constructor(options: {
        pubnub: Pubnub;
    });
    request(operation: Operation, forward: NextLink): RequestResult;
    _getSubscriptionChannel(operation: Operation): any;
    _createSubscription(subscriptionChannel: string, observer: {
        next: Function;
        complete: Function;
    }): void;
}
export default PubnubLink;
