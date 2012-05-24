function CancelError(message, arg) {
    this.name = "CancelError";
    this.message = (message || "");
    this.arg = arg;
}
CancelError.prototype = Error.prototype;

module.exports = CancelError;