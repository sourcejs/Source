/*
*
* Couch module and utils
*
* jquery.cocuh docs http://daleharvey.github.io/jquery.couch.js-docs/symbols/
* jquery.couchlib  http://<path_to_couchdb_server>/_utils/script/jquery.couch.js
*
* */

sourcejs.amd.define([
    'jquery',
    'sourceModules/module',
    'sourceModules/utils',
    'sourceLib/jquery.couch'
    ], function ($, module, utils, couch) {

'use strict';

    function Couch() {
        this.options.modulesOptions.couch = $.extend({

            server: 'http://127.0.0.1:5984'

        }, this.options.modulesOptions.couch);

        $.couch.urlPrefix = this.options.modulesOptions.couch.server;
    }

    Couch.prototype = module.createInstance();
    Couch.prototype.constructor = Couch;

    //Preparing remote storage object, and create it if its not ready
    Couch.prototype.prepareRemote = function (dbname, doc, id) {
        var _this = this;
        var dfd = new $.Deferred();

        var dbName = dbname;
        var storedData = doc;
        var specID = id;

        storedData['_id'] = specID;

        var db = $.couch.db(dbName);

        db.openDoc(specID, {
            success: function(data) {
                dfd.resolve(data);
            },
            error: function(status) {
                if (status === 404) {
                    console.log('creating new node');

                     $.when( _this.updateRemote(dbName, storedData) ).then(
                        function(data) {
                            dfd.resolve(data);
                        }
                    );
                }
            }
        });

        return dfd.promise();
    };


    /*

        fn(remote db name, actual data [, data to update] [, pass existing deffered] )

        Actual data storing is needed for sending updated data to remote,
        prepared object for sending must have same _id and _rev as remote stored object.

     */

    Couch.prototype.updateRemote = function (dbname, actualData, dataToUpdate, deffered) {
        var _this = this;

        var dbName = dbname;
        var dataToStore = actualData;
        var updateData = dataToUpdate;

        var db = $.couch.db(dbName);
        var dfd = typeof deffered !== 'object' ? new $.Deferred() : deffered;

        //If need to update
        if (typeof dataToUpdate === 'object') {
            dataToStore = $.extend(dataToStore, updateData);
        }

        db.saveDoc(dataToStore, {
            success: function(data) {
                //Server send response status
                var response = data;

                //If remote object succesfully updated
                if (response.ok) {
                    //Return updated data
                    dfd.resolve(dataToStore);
                } else {
                    console.log("Failed to update remote object");
                    dfd.reject("Failed to update remote object");
                }

            },
            error: function(status) {

                console.log("Failed to update remote object, maybe DB is not created?");

                //Create new db
                db.create({
                    success: function(data) {

                        if (data === 412) {
                            console.log("DB alreaty exist");
                            dfd.reject("DB alreaty exist");
                        } else if (data.ok) {
                            console.log("New DB created, trying to fill it");

                            //Try again
                            _this.updateRemote(dbName, dataToStore, updateData, dfd);
                        }
                    },
                    error: function(status) {
                        console.log("Failed to create db");
                        dfd.reject("Failed to create db");
                    }
                });
            }
        });

        return dfd.promise();
    };

    return new Couch();

});
