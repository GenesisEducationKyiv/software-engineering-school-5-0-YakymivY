"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAIL_SERVICE_NAME = exports.MAIL_PACKAGE_NAME = exports.protobufPackage = void 0;
exports.MailServiceControllerMethods = MailServiceControllerMethods;
const microservices_1 = require("@nestjs/microservices");
exports.protobufPackage = "mail";
exports.MAIL_PACKAGE_NAME = "mail";
function MailServiceControllerMethods() {
    return function (constructor) {
        const grpcMethods = ["sendConfirmationEmail"];
        for (const method of grpcMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcMethod)("MailService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods = [];
        for (const method of grpcStreamMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcStreamMethod)("MailService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}
exports.MAIL_SERVICE_NAME = "MailService";
//# sourceMappingURL=mail.js.map