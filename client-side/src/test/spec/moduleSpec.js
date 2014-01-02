/**
 * Created by Alexey Ostrovsky.
 * Date: 04.04.13
 * Time: 14:33
 */

define(['modules/module', 'core/options'], function (module, options) {

    return describe('Base module - module.js', function () {
        var m;

        beforeEach(function () {
            $('#sandbox').html();
            m = module.createInstance();
        });


        it('returns object', function () {
            expect(Object.prototype.toString.call(m)).toEqual('[object Object]');
        });

        it('loadOptions method returns opctions from options.js', function () {
            expect(m.loadOptions()).toEqual(options);
        });

        it('getOptions method returns options filed value', function () {
            var opts = {test:'get'};
            m.options = opts;

            expect(m.getOptions()).toEqual(opts);
        });

        it('setOptions method sets argument in options', function () {
            var opts = {test:'set'};
            m.setOptions(opts);

            expect(m.options).toEqual(opts);
        });

//        After module.js minification class is renamed to shorter value
//        it('getClass method returns right object class', function () {
//            expect(m.getClass()).toEqual('Module');
//        });

        it('getClass method returns right class from inherited object', function () {
            var obj = m.createInstance();

            function NewObject(){
                this.constructor = arguments.callee; // set constructor
            }
            NewObject.prototype = obj;

            var newObject = new NewObject();

            expect(newObject.getClass()).toEqual('NewObject');
        });


        it('createInstance method creates the same class instance as object', function () {
            var obj = m.createInstance();

            expect(obj.getClass()).toEqual(m.getClass());
        });

        it('createInstance method creates the same class instance as object inherited from other object ', function () {
            var obj = m.createInstance();

            function NewObject(){}
            NewObject.prototype = obj.createInstance();
            NewObject.prototype.constructor = NewObject;

            var newObject = new NewObject();

            expect(newObject instanceof NewObject).toEqual(true);
            expect(newObject.constructor.name).toEqual('NewObject');
        });

    });

});