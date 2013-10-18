"use strict";

/**
 * DataHelper
 * ---
 * Create easily data
 *
 * @author Florian Geoffroy <florian.geoffroy@gmail.com>
 */

var DataHelper = function(settings) {

    // Default Settings
    var defaultSettings = {
        configuration : "local",
        // Basics Parameters
        secureUrl  : ["https://localhost/", "80"],
        unsecureUrl: ["http://localhost/", "80"],
        // Basics callbacks
        success    : function() {
            console.log("default success");
        },
        error      : function() {
            console.log("default error");
        },
        // Basics functions on datas
        send       : function(d, success, error) {

        },
        receive    : function(d, success, error) {

        },
        // Basics functions on login or register
        login      : function() {

        },
        register   : function() {

        },
        logout     : function() {

        }
    };

    // Set settings
    this.settings = $.extend(defaultSettings, settings);

};

/**
 * Use to call a defined function
 *
 * @param name
 * @param parameters
 */
DataHelper.prototype.use = function(name, parameters) {
    return this.settings[name].apply(this, parameters);
};

DataHelper.prototype.make = function(name, parameters) {
    var data = this.use("send", parameters);
};

var $apiPHP = new DataHelper({
    name          : "",
    configuration : "local",
    // Basics Parameters
    secureUrl  : ["/foodMaps/api/public/", "80"],
    unsecureUrl: ["/foodMaps/api/public/", "80"],
    send       : function(path, data, secure) {
        secure = secure || false;

        var that = this,
            host = null;

        if(secure) {
            host = this.settings.secureUrl[0] + path;
        } else {
            host = this.settings.unsecureUrl[0] + path;
        }

        $.post(host, data, function(data) {

        });
    }
});

$apiPHP.use("send", ["users/signin", {
    data : {
        username : "ll",
        password : "test"
    }
}]);
