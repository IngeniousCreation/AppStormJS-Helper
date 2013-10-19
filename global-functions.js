
/**
 * Global Functions
 * ---
 * Usefull functions, tips and tricks for appstorm
 *
 * @author Florian Geoffroy <florian.geoffroy@gmail.com>
 */

/*
 ------------------------------------------------------------------------------------------------------------------------
 Helpers
 ------------------------------------------------------------------------------------------------------------------------
 */

/**
 * isArray
 * ---
 * Check if an element is an array
 *
 * @param el
 * @returns {boolean}
 */
a.isArray = function(el) {
    if( Object.prototype.toString.call(el) === '[object Array]' ) {
        return true;
    } else {
        return false;
    }
};

/**
 * merge
 * ---
 * merge to objects
 *
 * @param defaultSettings
 * @param settings
 * @returns {{}}
 */
a.merge = function(defaultSettings, settings) {
    var	obj = {};

    for(var j in defaultSettings) {
        if(!obj[j]) {
            if(a.isObject(settings[j])) {
                obj[j] = a.merge(defaultSettings[j], settings[j]);
            } else if(!a.isNull(settings[j])) {
                obj[j] = settings[j];
            } else {
                obj[j] = defaultSettings[j];
            }
        }
    }

    return obj;
};

//a.message.addListener("a.state.begin", function(hash) {
//    if(!a.state.hashExists(hash.value)) {
//        window.location.hash = "#/error/404";
//    }
//});