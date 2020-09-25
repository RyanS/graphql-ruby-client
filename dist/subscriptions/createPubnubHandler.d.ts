import Pubnub from "pubnub";
interface PubnubHandlerOptions {
    pubnub: Pubnub;
    fetchOperation: Function;
}
declare function createPubnubHandler(options: PubnubHandlerOptions): (operation: object, variables: object, cacheConfig: object, observer: {
    onNext: Function;
    onError: Function;
    onCompleted: Function;
}) => {
    dispose: () => void;
};
export { createPubnubHandler, PubnubHandlerOptions };
