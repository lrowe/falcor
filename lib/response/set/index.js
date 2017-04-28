var setValidInput = require("./setValidInput");
var validateInput = require("./../../support/validateInput");
var SetResponse = require("./SetResponse");
var ModelResponse = require("./../ModelResponse");

module.exports = function set() {
    var out = validateInput(arguments, setValidInput, "set");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }

    var argsIdx = -1;
    var argsLen = arguments.length;
    var args = [];
    while (++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    var response = new SetResponse(this, args);
    if (this._eventLog) {
        this._eventLog("Model", "set", this, args, response);
    }
    return response;
};
