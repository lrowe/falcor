var gets = require("./../../get");
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = gets.getWithPathsAsPathMap;

/**
 * Checks cache for the paths and reports if in progressive mode.  If
 * there are missing paths then return the cache hit results.
 *
 * @param {GetResponse} getResponse -
 * @param {Model} model - The model that the request was made with.
 * @param {Array} requestedMissingPaths -
 * @param {Boolean} progressive -
 * @param {Boolean} isJSONG -
 * @param {Function} onNext -
 * @param {Function} onError -
 * @param {Function} onCompleted -
 * @param {Object} seed - The state of the output
 * @private
 */
module.exports = function checkCacheAndReport(getResponse, model, requestedPaths, observer,
                                              progressive, isJSONG, seed,
                                              errors) {

    // checks the cache for the data.
    var results;
    if (isJSONG) {
        results = getWithPathsAsJSONGraph(model, requestedPaths, seed);
    } else {
        results = getWithPathsAsPathMap(model, requestedPaths, seed);
    }

    // We must communicate critical errors from get that are critical
    // errors such as bound path is broken or this is a JSONGraph request
    // with a bound path.
    if (results.criticalError) {
        if (model._eventLog) {
            model._eventLog(
                "GetResponse", "onError", getResponse, [results.criticalError]
            );
        }
        observer.onError(results.criticalError);
        return null;
    }

    // We are done when there are no missing paths or the model does not
    // have a dataSource to continue on fetching from.
    var valueNode = results.values[0];
    var hasValues = results.hasValue;
    var completed = !results.requestedMissingPaths ||
                    !results.requestedMissingPaths.length ||
                    !model._source;
    var hasValueOverall = Boolean(valueNode.json || valueNode.jsonGraph);

    // Copy the errors into the total errors array.
    if (results.errors) {
        var errs = results.errors;
        var errorsLength = errors.length;
        for (var i = 0, len = errs.length; i < len; ++i, ++errorsLength) {
            errors[errorsLength] = errs[i];
        }
    }

    // If there are values to report, then report.
    // Which are under two conditions:
    // 1.  This request for data yielded at least one value (hasValue) and  the
    // request is progressive
    //
    // 2.  The request if finished and the json key off
    // the valueNode has a value.
    if (hasValues && progressive || hasValueOverall && completed) {
        if (model._eventLog) {
            model._eventLog(
                "GetResponse", "onNext", getResponse, [valueNode]
            );
        }
        try {
            observer.onNext(valueNode);
        } catch (e) {
            throw e;
        }
    }

    // if there are missing paths, then lets return them.
    if (completed) {
        if (errors.length) {
            if (model._eventLog) {
                model._eventLog(
                    "GetResponse", "onError", getResponse, [errors]
                );
            }
            observer.onError(errors);
        } else {
            if (model._eventLog) {
                model._eventLog(
                    "GetResponse", "onCompleted", getResponse, []
                );
            }
            observer.onCompleted();
        }

        return null;
    }

    // Return the results object.
    return results;
};
