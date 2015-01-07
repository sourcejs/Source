/*!
* SourceJS - Front-end documentation engine
* @copyright 2013-2015 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

require([
    "jquery",
    "sourceModules/utils",
    "text!sourceTemplates/clarifyPanel.inc.html"
    ], function ($, u, clarifyPanelTpl){

    // If we have data from Clarify output
    if (window.sourceClarifyData){
        var $panelTemplate = $(clarifyPanelTpl);

        $panelTemplate.find('.js-source_clarify_return-link').attr('href', window.sourceClarifyData.specUrl);

        var prepareTplList = function(){
            var output = '';
            var tplList = window.sourceClarifyData.tplList;

            for (var i = 0; i < tplList.length; i++){
                var currentTpl = tplList[i];

                output += '<option data-tpl-name="'+currentTpl+'">'+currentTpl+'</option>'
            }

            return output;
        };

        var prepareSectionsList = function(){
            var output = '';
            var sectionsList = window.sourceClarifyData.sectionsIDList || [];

            sectionsList.forEach(function(current){
                output += '<option data-section="' + current.id + '">' + current.visualID + '. ' + current.header + '</option>';
            });

            return output;
        };

        var enableCheckboxes = function(param){
            if (u.getUrlParameter(param)) {
                $panelTemplate.find('.js-source_clarify_panel_option-checkbox[name="'+param+'"]').attr('checked', true);
            }
        };

        // Filing select containers
        $panelTemplate.find('.js-source_clarify_panel_select-tpl').append(prepareTplList());
        $panelTemplate.find('.js-source_clarify_panel_sections').append(prepareSectionsList());

        // Restoring options from URL
        var checkboxes = ['nojs','fromApi','apiUpdate'];

        checkboxes.forEach(function(item){
            enableCheckboxes(item);
        });

        var tepmplate = u.getUrlParameter('tpl') ? u.getUrlParameter('tpl') : 'default';
        $panelTemplate.find('.js-source_clarify_panel_select-tpl').val(tepmplate);

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
    } else {
        console.log('Clarify panel failed to receive expected data from clarify, check your tpl.');
    }
});
