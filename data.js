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

            var host = null,
                s    = null;

            if(secure) {
                s = this.secureUrl || this.settings.secureUrl;
            } else {
                s = this.unsecureUrl || this.settings.unsecureUrl;
            }

            if(!a.isNull(s[2])) {
                host = s[0] + ":" + s[1] + "/" + s[2] + "/" + path;
            } else {
                host = s[0] + ":" + s[1] + "/" + path;
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
        put: function(path, data, success, error) {
            var that = this,
                request = ajax({
                    type        : "PUT",
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
        head: function(path, data, success, error) {
            var that = this,
                request = ajax({
                    type        : "HEAD",
                    url         : that.getHost(path),
                    data        : (!a.isNull(data)) ? a.parser.json.stringify(data) : null
                });
            return request;
        },
        filePost: function(path, data, success, error, xhr) {
            var that = this,
                request = $.ajax({
                    url: that.getHost(path),
                    type: 'POST',
                    xhr: xhr,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false
                });
            return request;
        },
        filePut: function(path, data, success, error, xhr) {
            var that = this,
                request = $.ajax({
                    url: that.getHost(path),
                    type: 'PUT',
                    xhr: xhr,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false
                });
            return request;
        },
        receive: function(data) {
            return data;
        },
        send: function(data) {
            return data;
        },
        make: function(type, path, data, success, error, xhr) {
            var that = this;

            return this[type](path, this.send(data), success, error, xhr)
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

DataHelper.prototype.put = function(path, data, success, error) {
    this.settings.make("put", path, data, success, error);
};

DataHelper.prototype.delete = function(path, data, success, error) {
    this.settings.make("delete", path, data, success, error);
};

DataHelper.prototype.file = function(type, path, data, success, error, xhr) {
    if(type.toLocaleLowerCase() === "post") {
        this.settings.make("filePost", path, data, success, error, xhr);
    } else {
        this.settings.make("filePut", path, data, success, error, xhr);
    }
};

DataHelper.prototype.head = function(path, data, success, error) {
    this.settings.make("head", path, data, success, error);
};