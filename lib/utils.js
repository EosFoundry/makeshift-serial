export var strfy = function (o) { return JSON.stringify(o, null, 2); };
export var Msg = function (n) {
    var name = n;
    return function (loggable) {
        process.stdout.write("".concat(name, " ==> "));
        if (typeof loggable !== 'string') {
            console.dir(loggable);
        }
        else {
            console.log(loggable);
        }
    };
};
