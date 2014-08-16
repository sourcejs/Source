
/**
 * Filter pages_tree.json to get flat list of specs by #filter
 *
 * @param {json} obj            pages_tree.json
 * @param {string} lookup       #filter
 * @param {string} root         stop-argument: filter doesn't goes deeper
 */

var
    path = [],
    pathArr = [],
    recurLvl = -1
    ;

function getSpecs(obj, lookup, stopFlag) {
    if (arguments.length < 3) { console.log('This function requires 3 arguments: %s, %s, %s', 'collection @Object', 'filter @String', 'stop-flag @String') }

    recurLvl++;
    for (k in obj) {
        if (recurLvl < 2 && lookup && lookup.indexOf(k) === -1) continue;

//        console.log(path);
//        console.log('--> %s, recurLvl: %d', k, recurLvl)

        if (k === stopFlag) {
            pathArr.push( path.join('/') );

            if (recurLvl > 2) {
                recurLvl--;
//                console.log('--> Returned: ', recurLvl);
                return;
            }
        }

        path.push(k);

        if (getType(obj[k]) == 'Object') {
            getSpecs(obj[k], null, stopFlag);
        }

        path.pop();
    }

    recurLvl--;
}

function getType(obj) { return {}.toString.call(obj).slice(8,-1) }

module.exports = function (params) {
    getSpecs(params.obj, params.filter, params.flag);

    return pathArr;
};