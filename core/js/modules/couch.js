/*
*
* Couch module and utils
*
* jquery.cocuh docs http://daleharvey.github.io/jquery.couch.js-docs/symbols/
* jquery.couchlib  http://<path_to_couchdb_server>/_utils/script/jquery.couch.js
*
* */

define([
    'jquery',
    'modules/module',
    'modules/utils',
    'lib/jquery.couch'
    ], function ($, module, utils, couch) {

    function Couch() {
        this.options.modulesOptions.couch = $.extend({

            server: 'http://localhost:5984'

        }, this.options.modulesOptions.couch);

        $.couch.urlPrefix = this.options.modulesOptions.couch.server;
    }

    Couch.prototype = module.createInstance();
    Couch.prototype.constructor = Couch;

    Couch.prototype.prepareRemote = function (dbname, doc, id) {
        var _this = this,
            dfd = new $.Deferred(),

            dbName = dbname,
            storedData = doc,
            specID = id;

        storedData['_id'] = specID;

        var db = $.couch.db(dbName);

        db.openDoc(specID, {
            success: function(data) {
                dfd.resolve(data);
            },
            error: function(status) {
                if (status = 404) {
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

    //fn(remote db name, data to store remotely [, data to update] [, pass existing deffered] )
    Couch.prototype.updateRemote = function (dbname, doc, updateDoc, deffered) {
        var _this = this,

            dbName = dbname,
            remoteData = doc,
            newRemoteData = updateDoc;

        var db = $.couch.db(dbName);

        if (typeof deffered !== 'object') {
            var dfd = new $.Deferred();
        } else {
            var dfd = deffered;
        }

        //If need to update
        if (typeof updateDoc === 'object') {
            remoteData = $.extend(remoteData, newRemoteData);
        }

        db.saveDoc(remoteData, {
            success: function(data) {
                //Server send response status
                var response = data;

                //If remote object succesfully updated
                if (response.ok) {
                    //Return updated data
                    dfd.resolve(remoteData);
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
                            _this.updateRemote(dbName, remoteData, newRemoteData, dfd);
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