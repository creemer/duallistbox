require.config({
    paths: {
        bootstrap_dualist: "../app/slideshow/contrib/bootstrap-duallist/jquery.bootstrap-duallistbox.min",
        text: "../app/slideshow/contrib/text",
    },
	shim: {
    	'bootstrap_dualist': {
    		deps: ['jquery']
    	}
	}
});

define([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    "css!../app/slideshow/css/appTemplate.css",
    "text!../app/slideshow/js/templates/AppTmp.html",
    "bootstrap_dualist",
    "css!../app/slideshow/contrib/bootstrap-duallist/bootstrap-duallistbox.min.css",
], function(_, Backbone, mvc, $, SimpleSplunkView, AppTmpTemplate){

    var SlideshowSetupView = SimpleSplunkView.extend({
        initialize: function() {
            var _this = this;
            this.helper_prefix = document.getElementById('dualList').name;
            this.available_apps = null;
            this.defaultTokenModel = splunkjs.mvc.Components.getInstance('default', {create: true});
            this.retrieveApps();

            var demoform = document.getElementById('demoform');
            demoform.addEventListener('submit', function(event) {
                event.preventDefault();
                //console.log('coisen fields', $('#dualList').val());

                let data = _this.saveDataToJsonFromHTMLCollection();
                _this.defaultTokenModel.set('dataContainer', data);
            })
        },

        /**
         * Get the list of available apps.
         */
        retrieveApps: function(){
        	
        	// Prepare the arguments
            var params = new Object();
            params.output_mode = 'json';
            params.count = '-1';
            
            var uri = Splunk.util.make_url('/splunkd/services/apps/local');
            uri += '?' + Splunk.util.propToQueryString(params);
            
            // Fire off the request
            $.ajax({
                url: uri,
                type: 'GET',
                success: function(result) {
                    this.available_apps = result.entry;
                    this.render();
                }.bind(this),
                error: function(jqXHR, textStatus){
                	alert("The list of apps could not be loaded");
                }.bind(this)
            });
        
        },

        saveDataToJsonFromHTMLCollection: function() {
            let result = [];
            let id = '[name="'+ this.helper_prefix +'_helper1"]';

            // беру HTMLCollection -> конвертирую в миассив -> пробегаю по массиву возвращая innerHTML
            let options = [].slice.call(document.querySelector(id).children).map(function(item) {
                    return item.innerHTML;
                });
          

            this.available_apps.forEach(function(item) {
                if(_.contains(options, item.name)) {
                    result.push(item);
                }
            })

            return JSON.stringify(result);
        },


        appendToList: function(list) {
            this.available_apps.forEach(function(item) {
                list.append('<option value="'+ item.name +'">'+ item.name +'</option>');
            })
            list.bootstrapDualListbox('refresh');
        },

        render: function() {
            if(this.available_apps !== null) {
                var demo1 = $('#dualList').bootstrapDualListbox();

                this.appendToList(demo1);
            } else {
                return '<h2>There is no data set recieved from server</h2>';
            }
            console.log('AJAX', this.available_apps);
            /* this.$el.html(_.template(AppTmpTemplate,{
                available_apps: this.available_apps,
            }) ); */
            
            return;
        } 
    })

    return SlideshowSetupView;
})