"use strict";

/**
 * DataHelper
 * ---
 * Create easily data
 *
 * @author Florian Geoffroy <florian.geoffroy@gmail.com>
 */

var DataHelper = function(settings) {

    var defaultSettings = {
        configuration : "local",
        // Basics Parameters
        secureUrl  : ["https://localhost/", "80"],
        unsecureUrl: ["http://localhost/", "80"],
        // Basics callbacks
        success: function() {
            console.log("default success");
        },
        error: function() {
            console.log("default error");
        },
        getHost: function(path) {
            if(a.isArray(path)) {
                var secure = path[1];
                secure = secure || false;

                path = path[0]
            } else {
                var secure = false;
            }

            var that = this,
                host = null,
                s    = null;

            if(secure) {
                s = this.secureUrl;
            } else {
                s = this.unsecureUrl;
            }

            if(!a.isNull(path)) {
                host = s[0] + ":" + s[1] + "/" + s[2] + "/" + path;
            } else {
                host = s[0] + ":" + s[1] + "/" + s[2];
            }

            return host;
        },
        // Basics functions on datas
        post: function(path, data, success, error) {
            var that = this,
                request = ajax({
                    type        : "POST",
                    url         : that.getHost(path),
                    data        : (!a.isNull(data)) ? a.parser.json.stringify(data) : null
                });
            return request;
        },
        get: function(path, data, success, error) {
            var that = this,
                request = ajax({
                    type        : "GET",
                    url         : that.getHost(path),
                    data        : (!a.isNull(data)) ? a.parser.json.stringify(data) : null
                });
            return request;
        },
        delete: function(path, data, success, error) {
            var that = this,
            request = ajax({
                type        : "DELETE",
                url         : that.getHost(path),
                data        : (!a.isNull(data)) ? a.parser.json.stringify(data) : null
            });
            return request;
        },
        receive: function(data) {
            return data;
        },
        send: function(data) {
            return data;
        },
        make: function(type, path, data, success, error) {
            var that = this;

            this[type](path, this.send(data), success, error)
            .fail(function(data){
                if(!a.isNull(error)) {
                    error(that.receive(data));
                } else {
                    that.error();
                }
            })
            .done(function(data){
                if(!a.isNull(success)) {
                    success(that.receive(data));
                } else {
                    that.success();
                }
            });
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

DataHelper.prototype.get = function(path, data, success, error) {
    this.settings.make("get", path, data, success, error);
};

DataHelper.prototype.post = function(path, data, success, error) {
    this.settings.make("post", path, data, success, error);
};

DataHelper.prototype.delete = function(path, data, success, error) {
    this.settings.make("delete", path, data, success, error);
};