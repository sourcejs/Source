/**
 * Created by Alexey Ostrovsky.
 * Date: 15.01.13
 * Time: 17:02
 */
"use strict";

define([
    "core/options",
    "modules/innerNavigation",
    "plugins/lib/jquery.cookie",
    "modules/css"], function (options, innerNavigation, cookie, css) {
        var moduleCss = new css("bubble/bubble.css");

            function Bubble() {

            var _this = this;

            this.pathName = window.location.pathname;
            this.bubbleData = [];
            this.isOn = false;

            // элементы на странице
            this.demoSections = $(".source_example");
            this.demoSectionsClass = ".source_example";
            this.switchButtonClass = ".source_main_nav_ac-toggle-comments";
            this.page = $(".source_main");
            this.resMenuLink = 'Comments';

            /* вкл/выкл комментирования */
            innerNavigation.addMenuItem(this.resMenuLink, function() {
                _this.bindEvents();
            }, function() {
                _this.unbindEvents();
            });

            // шаблон баббла
            // TODO: переделать на templates
            this.bubbleTemplate = $("" +
                    "<div class='js-bbl'>" +
                    "<div class='js-bbl_form'>" +
                    "<textarea class='js-bbl_it' placeholder='Ваш комментарий'></textarea>" +
                    "<div class='js-bbl_sep'></div>" +
                    "<input class='js-bbl_name_it' placeholder='Подпишитесь, чтобы вас узнали'/>" +
                    "<div class='js-bbl_actions'>" +
                    "<button class='js-bbl_submit'>Сохранить</button>" +
                    "<a href='#' class='js-bbl_cancel'>Отмена</a>" +
                    "</div>" +
                    "</div>" +
                    "<div class='js-bbl_info'>" +
                    "<div class='js-bbl_tx'></div>" +
                    "<div class='js-bbl_name'></div>" +
                    "<div class='js-bbl_close'></div>" +
                    "</div>" +
                    "</div>"
            );

            this.bubbleTemplate.click(function(e){
                e.stopPropagation();
            });

            this.bubbleTemplate.find(".js-bbl_close, .js-bbl_cancel").click(function(e){
                e.preventDefault();

                var timestamp = $(this).closest(".js-bbl").attr("timestamp");

                _this.removeBubble(timestamp);
                e.stopPropagation();
            });

            /* TODO: вычистить это говнецо */
            this.bubbleTemplate.find(".js-bbl_submit").click(function(){
                var timestamp = $(this).closest(".js-bbl").attr("timestamp");
                var text = $(this).closest(".js-bbl").find(".js-bbl_it").val();
                var name = $(this).closest(".js-bbl").find(".js-bbl_name_it").val();
                var sec = _this.getSectionNum($(this).closest(".source_example"));
                var x = $(this).closest(".js-bbl").css("left");
                var y = $(this).closest(".js-bbl").css("top");

                $(this).closest(".js-bbl").find(".js-bbl_form").hide();
                $(this).closest(".js-bbl").find(".js-bbl_tx").text(text);
                $(this).closest(".js-bbl").find(".js-bbl_name").text(name);
                $(this).closest(".js-bbl").find(".js-bbl_info").addClass("js-bbl__show");
                $(this).closest(".js-bbl").addClass("js-bbl__on");


                _this.submitBubble(sec, x, y, text, name,  timestamp);
            });

        }

        /* возвращает n-й по счету section, начиная с нуля */
        Bubble.prototype.getSectionByNum = function (num) {
            return this.demoSections[num];
        };

        /* возвращает порядковый номер section-а по элементу */
        Bubble.prototype.getSectionNum = function (sec) {
            return this.demoSections.index(sec);
        };

        /* рисует один бабл в заданом блоке, с заданными координатами и текстом */
        Bubble.prototype.drawSingleBubble = function (section, x, y, timestamp, text, name) {
            var _this = this;

            var newBubble = this.bubbleTemplate.clone(true);

            newBubble.css({
                left:x,
                top:y
            })
                    .attr("timestamp", timestamp)
                    .appendTo(_this.getSectionByNum(section));


            if (name === "") {
                name = $.cookie("commentAuthor");
                newBubble.find(".js-bbl_name_it").val(name);
            }

            newBubble.find(".js-bbl_name").text(name);
            newBubble.find(".js-bbl_tx").text(text);

            newBubble.find(".js-bbl_it").trigger("focus");
            newBubble.addClass("js-bbl__on");

            if (text != "") {
                newBubble.find(".js-bbl_form").hide();
                newBubble.find(".js-bbl_info").addClass("js-bbl__show");
            }
        };

        /* рисует один бабл в заданом блоке, с заданными координатами и текстом */
        Bubble.prototype.createBubble = function (section, x, y, timestamp, text, name) {
            this.drawSingleBubble(section, x, y, timestamp, text, name);
        };

        /* прячем бабл по таймстемпу */
        Bubble.prototype.hideBubble = function (timestamp) {
            $(".js-bbl[timestamp=" + timestamp + "]").removeClass("js-bbl__on");
            setTimeout(function() {
                $(".js-bbl[timestamp=" + timestamp + "]").remove();
            }, 400);
        };

        /* сабмит бабла */
        Bubble.prototype.submitBubble = function (section, x, y, text, name, timestamp) {
            $.cookie("commentAuthor", name);

            this.pushBubbleData({section: section, x: x, y: y, text: text, name: name, timestamp: timestamp});
            this.setData();
        };

        /* удаляет бабл по таймстемпу */
        Bubble.prototype.removeBubble = function (timestamp) {
            var data = this.getBubbleData();
            var newData = [];
            for( var j = 0; j < data.length; j++) {
                if(data[j].timestamp != timestamp) {
                    newData.push(data[j]);
                }
            }

            this.setBubbleData(newData);
            this.setData();
            this.hideBubble(timestamp);
        };

        /* TODO: test case */
        Bubble.prototype.testDrawSingleBubble = function () {
            this.drawSingleBubble(0, 50, 50 , new Date().getTime(),  "Тест #1: бабл в первой секции", "Сергей")
        };

        /* рисует все бабблы из массива бабблов */
        Bubble.prototype.drawBubblesArray = function (bubbles) {
            if(typeof bubbles === 'undefined') {
                bubbles = this.bubbleData;
            }

            for (var i = 0; i < bubbles.length; i++) {
                this.drawSingleBubble(bubbles[i].section, bubbles[i].x, bubbles[i].y, bubbles[i].timestamp, bubbles[i].text, bubbles[i].name);
            }
        };

        /* TODO: test case */
        Bubble.prototype.testDrawBubblesArray = function () {
            var arr = [
                { section: 0, x:200, y:100, text:"Тест #2: 1-й бабл из очереди бабблов в 1-й секции", timestamp: new Date().getTime() },
                { section: 1, x:200, y:100, text:"Тест #2: 2-й бабл из очереди бабблов во 2-й секции", timestamp: new Date().getTime() },
                { section: 2, x:200, y:100, text:"Тест #2: 3-й бабл из очереди бабблов в 3-й секции", timestamp: new Date().getTime() },
                { section: 3, x:200, y:100, text:"Тест #2: 4-й бабл из очереди бабблов в 4-й секции", timestamp: new Date().getTime() }
            ];
            this.drawBubblesArray(arr);
        };

        Bubble.prototype.getPathToSpec = function () {
            var uri = this.pathName.split("/");
            uri[uri.length - 1] = "";

            return uri.join("/");
        };

        Bubble.prototype.getData = function () {
            var _this = this;

            $.ajax({
                url: options.pluginsDir + "bubble/getBubbles.php",
                context: _this,
                dataType: "JSON",
                type: "GET",
                data: {
                    pathToDataFile: _this.getPathToSpec()
                },
                /* TODO: sometimes request fails =((( */
                error: function() {
                    //console.log("Error: ", data);
                    this.setData();
                },
                success: function(data) {
                    if(data != null) {
                        this.setBubbleData(data.bubbleData);
                        this.drawBubblesArray();
                    }
                }/*,
                 complete: function(xhr, textStatus) {
                 console.log("Getting data finished with status: " + textStatus);
                 }*/
            });
        };

        Bubble.prototype.setData = function (data) {
            var _this = this;

            if(typeof data === 'undefined') {
                data = this.getBubbleData();
            }

            var sendData = {
                pathToDataFile:_this.getPathToSpec(),
                bubbleData: data
            };

            $.ajax({
                url: options.pluginsDir + "bubble/setBubbles.php",
                context: document.body,
                type: "GET",

                data: {sendData: JSON.stringify(sendData)},

                success: function() {
                    // callback
                }
            });
        };

        Bubble.prototype.getBubbleData = function () {
            return this.bubbleData;
        };

        Bubble.prototype.setBubbleData = function (data) {
            this.bubbleData = data;
        };

        Bubble.prototype.pushBubbleData = function (bubble) {
            this.bubbleData.push(bubble);
        };

        /* TODO: test case */
        Bubble.prototype.testSetData = function () {
            var testData = {
                0: { section: 0, x: 0, y: 160, text: "Тест #3: 1-й бабл из файла в 1-й секции" },
                1: { section: 1, x: 0, y: 160, text: "Тест #3: 2-й бабл из файла в 2-й секции" },
                2: { section: 2, x: 0, y: 160, text: "Тест #3: 3-й бабл из файла в 3-й секции" }
            };

            this.setData(testData);
        };


        Bubble.prototype.bindEvents = function () {
            var _this = this;

            this.page.on("click", _this.demoSectionsClass, function(e){
                e.preventDefault();

                var offset = $(this).offset();

                var relX = e.pageX - offset.left;
                var relY = e.pageY - offset.top;

                var num = _this.getSectionNum($(this));
                var timestamp = new Date().getTime();

                _this.createBubble(num, relX, relY, timestamp, "", "");
            });
        };

        Bubble.prototype.unbindEvents = function () {
            var _this = this;

            this.page.off("click", _this.demoSectionsClass);
        };

        /* init bubble.js */
        if(options.pluginsEnabled.bubble) {
            var bubble = new Bubble();
            bubble.getData();
        }
    }
);