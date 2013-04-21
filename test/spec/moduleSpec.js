/**
 * Created by Alexey Ostrovsky.
 * Date: 04.04.13
 * Time: 14:33
 */

define(['modules/module', 'core/options'], function (module, options) {

    return describe('Базовый модуль - module.js', function () {
        var m;

        beforeEach(function () {
            $('#sandbox').html();
            m = module.createInstance();
        });


        it('возвращает объект', function () {
            expect(Object.prototype.toString.call(m)).toEqual('[object Object]');
        });

        it('метод loadOptions возвращает опции из options', function () {
            expect(m.loadOptions()).toEqual(options);
        });

        it('метод getOptions возвращает значение поля options', function () {
            var opts = {test:'get'};
            m.options = opts;

            expect(m.getOptions()).toEqual(opts);
        });

        it('метод setOptions сетит значение в options', function () {
            var opts = {test:'set'};
            m.setOptions(opts);

            expect(m.options).toEqual(opts);
        });

        it('метод getClass правильно возвращает класс объекта', function () {
            expect(m.getClass()).toEqual('Module');
        });

        it('метод getClass правильно возвращает класс унаследованного объекта', function () {
            var obj = m.createInstance();

            function NewObject(){
                this.constructor = arguments.callee; // set constructor
            }
            NewObject.prototype = obj;

            var newObject = new NewObject();

            expect(newObject.getClass()).toEqual('NewObject');
        });


        it('метод createInstance создает инстанс того же класса, что и сам объект', function () {
            var obj = m.createInstance();

            expect(obj.getClass()).toEqual(m.getClass());
        });

        it('метод createInstance создает инстанс того же класса, что и сам объект, унаследованный от другого объекта', function () {
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