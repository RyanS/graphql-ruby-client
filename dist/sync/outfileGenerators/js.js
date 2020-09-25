"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateOutfile(_type, clientName, keyValuePairs) {
    return "\n    /**\n     * Generated by graphql-ruby-client\n     *\n    */\n\n    /**\n     * Map local operation names to persisted keys on the server\n     * @return {Object}\n     * @private\n    */\n    var _aliases = " + keyValuePairs + "\n\n    /**\n     * The client who synced these operations with the server\n     * @return {String}\n     * @private\n    */\n    var _client = \"" + clientName + "\"\n\n    var OperationStoreClient = {\n      /**\n       * Build a string for `params[:operationId]`\n       * @param {String} operationName\n       * @return {String} stored operation ID\n      */\n      getOperationId: function(operationName) {\n        return _client + \"/\" + OperationStoreClient.getPersistedQueryAlias(operationName)\n      },\n\n      /**\n       * Fetch a persisted alias from a local operation name\n       * @param {String} operationName\n       * @return {String} persisted alias\n      */\n      getPersistedQueryAlias: function(operationName) {\n        var persistedAlias = _aliases[operationName]\n        if (!persistedAlias) {\n          throw new Error(\"Failed to find persisted alias for operation name: \" + operationName)\n        } else {\n          return persistedAlias\n        }\n      },\n\n      /**\n       * Satisfy the Apollo Link API.\n       * This link checks for an operation name, and if it's present,\n       * sets the HTTP context to _not_ include the query,\n       * and instead, include `extensions.operationId`.\n       * (This is inspired by apollo-link-persisted-queries.)\n      */\n      apolloLink: function(operation, forward) {\n        if (operation.operationName) {\n          const operationId = OperationStoreClient.getOperationId(operation.operationName)\n          operation.setContext({\n            http: {\n              includeQuery: false,\n              includeExtensions: true,\n            }\n          })\n          operation.extensions.operationId = operationId\n        }\n        return forward(operation)\n      },\n      /**\n       * Satisfy the Apollo middleware API.\n       * Replace the query with an operationId\n      */\n      apolloMiddleware: {\n        applyBatchMiddleware: function(options, next) {\n          options.requests.forEach(function(req) {\n            // Fetch the persisted alias for this operation\n            req.operationId = OperationStoreClient.getOperationId(req.operationName)\n            // Remove the now-unused query string\n            delete req.query\n            return req\n          })\n          // Continue the request\n          next()\n        },\n\n        applyMiddleware: function(options, next) {\n          var req = options.request\n          // Fetch the persisted alias for this operation\n          req.operationId = OperationStoreClient.getOperationId(req.operationName)\n          // Remove the now-unused query string\n          delete req.query\n          // Continue the request\n          next()\n        }\n      }\n    }\n\n    module.exports = OperationStoreClient\n    ";
}
exports.default = generateOutfile;