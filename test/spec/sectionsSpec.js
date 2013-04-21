/**
 * Created by Alexey Ostrovsky.
 * Date: 04.04.13
 * Time: 14:33
 */

define(['modules/sections'], function (sections) {

    return describe('Модуль подсчета секций - sections.js', function () {

        var TEST_SECTION =
                '<section class="source_section">' +
                        '<h2>Первый блок</h2>' +
                        '<section class="source_example" style="background-color:#F2F4F6">' +
                        '<div class="insert-ucard_avatar"></div>' +
                        '</section>' +
                        '</section>';

        var MIN = 0;
        var MAX = 100;
        var rand = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
        var str = '';
        var s = {};

        for (var i = 0; i < rand; i++) {
            str += TEST_SECTION;
        }

        beforeEach(function () {

            $('#sandbox').html(str);

            s = sections.createInstance();
        });

        afterEach(function () {
            s = sections.createInstance();
        });

        it('возвращает массив', function () {
            expect(Object.prototype.toString.call(s.getSections())).toEqual('[object Array]');
        });

        it('метод getSections возвращает поле sections', function () {
            var arr = [1, 2, 3];
            s.sections = arr;

            expect(s.getSections()).toEqual(arr);
        });

        it('метод addSections добавляет элемент в поле sections', function () {
            arr = [1, 2, 3];
            s.sections = arr;
            s.addSection(4);

            expect(s.getSections()).toEqual([1, 2, 3, 4]);
        });

        it('метод getQuantity возвращает размер поля sections', function () {
            expect(s.getQuantity()).toEqual(s.sections.length);
        });

        it('метод scanDOM заполняет поле sections секциями из DOM-дерева', function () {
            expect(s.getQuantity()).toEqual(rand);
        });


    });

});