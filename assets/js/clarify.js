/*!
* SourceJS - Front-end documentation engine
* @copyright 2013-2015 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/sourcejs/wiki/MIT-License
* */

sourcejs.amd.require([
    "jquery",
    'text!/api/options',
    "sourceModules/utils",
    "sourceLib/lodash",
    "text!sourceTemplates/clarifyPanel.inc.html"
], function ($, options, u, _, clarifyPanelTpl){
    var triesLimit = 2;
    var triesCount = 0;

    var handler = function() {
        var $panelTemplate = $(_.template(clarifyPanelTpl, {
            showApiTargetOption: window.sourceClarifyData.showApiTargetOption,
            specUrl: window.sourceClarifyData.specUrl,
            tplList: window.sourceClarifyData.tplList,
            sectionsIDList: window.sourceClarifyData.sectionsIDList || []
        }));

        var enableCheckboxes = function(param){
            if (u.getUrlParameter(param)) {
                $panelTemplate.find('.js-source_clarify_panel_option-checkbox[name="'+param+'"]').attr('checked', true);
            }
        };

        // Restoring options from URL
        var checkboxes = ['nojs','fromApi','apiUpdate'];

        checkboxes.forEach(function(item){
            enableCheckboxes(item);
        });

        var template = u.getUrlParameter('tpl') ? u.getUrlParameter('tpl') : 'default';
        $panelTemplate.find('.js-source_clarify_panel_select-tpl').val(template);

        var sections = u.getUrlParameter('sections') ? u.getUrlParameter('sections').split(',') : undefined;
        if (sections) {
            sections.forEach(function(item){
                $panelTemplate.find('.js-source_clarify_panel_sections > option[data-section="' + item + '"]').attr('selected', true);
            });
        }

        // Import template
        $('.js-source_clarify_panel').replaceWith($panelTemplate);

        // Activating changes
        $('.js-source_clarify_panel_go').on('click', function(e){
            e.preventDefault();

            var currentUrl = window.location.href.split('?')[0];
            var clarifyBaseUrl = currentUrl + '?clarify=true';
            var constructedParams = '';

            $('.js-source_clarify_panel_option-checkbox').each(function(){
                var t = $(this);

                if (t.is(':checked')){
                    constructedParams += '&' + t.attr('name') + '=true'
                }
            });

            var selectedTpl = $('.js-source_clarify_panel_select-tpl').val();
            if (selectedTpl !== 'default'){
                constructedParams += '&tpl=' + selectedTpl;
            }

            var selectedSections = [];
            $('.js-source_clarify_panel_sections > option:selected').each(function(){
                var t = $(this);

                selectedSections.push(t.attr('data-section'));
            });

            if (selectedSections.length > 0){
                constructedParams += '&sections=' + selectedSections.join(',');
            }

            location.href = clarifyBaseUrl + constructedParams;
        });
    };

    var renderClarify = function(){
        // If we have data from Clarify output
        if (window.sourceClarifyData){
            handler();
        } else {
            if (triesCount < triesLimit) {
                triesCount++;
                setTimeout(renderClarify, 1000);
            } else {
                console.log('Clarify panel failed to receive expected data from clarify, check your tpl.');
            }
        }
    };

    renderClarify();
});
