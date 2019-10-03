"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConnectionProblem extends Error {
    constructor(message, originalError, config) {
        super(message);
        this.message = message;
        this.originalError = originalError;
        this.config = config;
        this.name = 'ClientNotReachable';
        this.message = message;
        this.stack = new Error().stack;
    }
}
exports.ConnectionProblem = ConnectionProblem;
//# sourceMappingURL=behaviorClient.js.map