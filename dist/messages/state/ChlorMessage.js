"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChlorMessage = void 0;
class ChlorMessage {
    static decodeIntellichlorConfig(msg) {
        const data = {
            senderId: msg.senderId,
            installed: msg.readInt32LE() === 1,
            status: msg.readInt32LE(),
            poolSetPoint: msg.readInt32LE(),
            spaSetPoint: msg.readInt32LE(),
            salt: msg.readInt32LE() * 50,
            flags: msg.readInt32LE(),
            superChlorTimer: msg.readInt32LE()
        };
        return data;
    }
    static decodeSetIntellichlorConfig(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeSetEnableIntellichlorConfig(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
}
exports.ChlorMessage = ChlorMessage;
//# sourceMappingURL=ChlorMessage.js.map