"use strict";

/**
 * HelperState
 * ---
 * Create states easily
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

/*
------------------------------------------------------------------------------------------------------------------------
StateHelper : helpers
------------------------------------------------------------------------------------------------------------------------
*/

/*
 * Callbacks
 */

function __converterDefault(data) {
	return data;
};

// Before and after load
function __preLoadDefault(result) {
	result.done();
};
function __postLoadDefault(result) {
	result.done();
};
function __preUnloadDefault(result) {
	result.done();
};
function __postUnloadDefault(result) {
	result.done();
};

// On unload
function __unloadDefault(result) {
	result.done();
};

function __appendDefault($dom) {
	return function(content) {
		var el = $(document).find($dom).get(0);
		if(a.isNull(el)) {
			alert("id: " + id + " does not exist");
		}

		$(document).find($dom).append(content);
	};
};
function __prependDefault($dom) {
	return function(content) {
		var el = $(document).find($dom).get(0);
		if(a.isNull(el)) {
			alert("id: " + id + " does not exist");
		}

		$(document).find($dom).prepend(content);
	};
};
function __replaceDefault($dom) {
	return function(content) {
		var el = $(document).find($dom).get(0);
		if(a.isNull(el)) {
			alert("id: " + id + " does not exist");
		}

		$(document).find($dom).html(content)
	};
};


/*
------------------------------------------------------------------------------------------------------------------------
StateHelper : main
------------------------------------------------------------------------------------------------------------------------
*/

/**
 * Principal Scope : StateHelper
 * @type {{}}
 */
var StateHelper = function(settings) {
	var defaultSettings = {
		// State basic configuration
		state : {
			prefix : null,
			parent : null,
			include: {
				html: null,
				css : null,
				js  : null
			}
		},
		// Basics datas load by all state
		data      : {},
		// Basics callbacks functions used
		functions : {
			// Data
			converter : __converterDefault,
			// load callbacks
			preLoad   : __preLoadDefault,
			postLoad  : __postLoadDefault,
			// unload
			unload    : __unloadDefault,
			// unload callbacks
			preUnload : __preUnloadDefault,
			postUnload: __postUnloadDefault
		},
		// Default listeners
		listeners    : [],
		// Temporary variables or functions set for a state by user
		temporary    : {
			variables: {},
			listeners: [],
			functions: {}
		},
		// Define or override insertion methods
		insertMethods: {
			append : __appendDefault,
			prepend: __prependDefault,
			replace: __replaceDefault
		},
		// Save state
		save : false,
		// Temporary state would be to save in AppStormJS
		currentState : {},
		// Valid State Insertion ?
		validate : 0
	};

	if(a.isNull(settings)) {
		settings = {};
	}

	defaultSettings = a.merge(defaultSettings, settings);

	for(var n in defaultSettings) {
		this[n] = defaultSettings[n];
	}

	return this;
};

/**
 * saveState
 * ---
 * Add a state to the system
 *
 * @param state
 * @returns {StateHelper}
 */
StateHelper.prototype.saveState   = function(state) {
	if(!a.isNull(this.state.parent)) {
		var prefixDefault = this.state.prefix,
			parentDefault = this.state.parent;
		// We create new id if needed
		if(prefixDefault != null) {
			parentDefault = prefixDefault + "-" + parentDefault;
		}
		state.parent = parentDefault;
	}

	a.state.add(state);

	return this;
};

/**
 * insert
 * ---
 * Can be the final function. If save is true we save the current state.
 *
 * @param el
 * @param method
 * @returns {*}
 */
StateHelper.prototype.insert = function(el, method) {
	// If the state are not valid we stop execution
	if(!this.validate) {
		return null;
	}

	// We load all temporary functions (set by user for the current state)
	var converter  = this.temporary.functions.converter;

	// Load Before and After id's of state
	var loadBefore = this.temporary.variables.loadBefore,
		loadAfter  = this.temporary.variables.loadAfter;

	// Callbacks functions
	var preLoad    = this.temporary.functions.preLoad,
		postLoad   = this.temporary.functions.postLoad,
		preUnload  = this.temporary.functions.preUnload,
		postUnload = this.temporary.functions.postUnload;

	// We load default functions
	var preLoadDefault    = this.functions.preLoad,
		postLoadDefault   = this.functions.postLoad,
		preUnloadDefault  = this.functions.preUnload,
		postUnloadDefault = this.functions.postUnload;

	// We load default and custom listeners
	var defaultListeners = this.listeners,
		listeners       = this.temporary.listeners;
	// We push default listeners in our listerners
	for(var i in defaultListeners) {
		listeners.push(defaultListeners[i]);
	}

	// Use custom converter
	if(!a.isNull(converter)) {
		this.currentState.converter = converter;
	}

	// Use custom preLoad or loadBefore
	this.currentState.preLoad = function(result) {
		// We load state's Id
		if(!a.isNull(loadBefore) && a.isArray(loadBefore)) {
			for(var i=0; i < loadBefore.length; i++) {
				if(a.isString(loadBefore[i])) {
					a.state.loadById(loadBefore[i]);
				}
			}
		}

		// We add all appstorm events
		if(!a.isNull(listeners)) {
			for(var i = 0; i < listeners.length; i++) {
				var type = listeners[i].type,
					on   = listeners[i].on,
					func = listeners[i].func;

				if (type == "appstorm") {
					a.message.addListener(on, func);
				}
			}
		}

		// We call a specific postLoad if needed
		if(!a.isNull(preLoad)) {
			if(!preLoad(result)) result.fail(); else result.done();
		} else {
			preLoadDefault(result);
		}
	}

	// Use custom postLoad or loadAfter
	this.currentState.postLoad = function(result) {
		// We load state's Id
		if(!a.isNull(loadAfter) && a.isArray(loadAfter)) {
			for(var i=0; i < loadAfter.length; i++) {
				if(a.isString(loadAfter[i])) {
					a.state.loadById(loadAfter[i]);
				}
			}
		}

		// We add all jquery listeners
		if(!a.isNull(listeners)) {
			for(var i = 0; i < listeners.length; i++) {
				var type = listeners[i].type,
					on   = listeners[i].on,
					func = listeners[i].func;

				if(type == "jquery") {
					$(on[0]).on(on[1], func);
				}
			}
		}

		// We call a specific postLoad if needed
		if(!a.isNull(postLoad)) {
			if(!postLoad(result)) result.fail(); else result.done();
		} else {
			postLoadDefault(result);
		}
	}

	// Use custom preUnload
	this.currentState.preUnload = function(result) {
		// We remove all jquery listeners
		if(!a.isNull(listeners)) {
			for(var i = 0; i < listeners.length; i++) {
				var type = listeners[i].type,
					on   = listeners[i].on,
					func = listeners[i].func;

				if(type == "jquery") {
					$(on[0]).off(on[1], func);
				}
			}
		}

		if(!a.isNull(preUnload)) {
			if(!preUnload(result)) result.fail(); else result.done();
		} else preUnloadDefault(result);
	}

	// Use custom postUnload
	this.currentState.postUnload =  function(result) {
		// We remove all appstorm listeners
		if(!a.isNull(listeners)) {
			for(var i = 0; i < listeners.length; i++) {
				var type = listeners[i].type,
					on   = listeners[i].on,
					func = listeners[i].func;

				if (type == "appstorm") {
					a.message.removeListener(on, func);
				}
			}
		}

		// We call a specific postUnload if needed
		if(!a.isNull(postUnload)) {
			if(!postUnload(result)) result.fail(); else result.done();
		} else {
			postUnloadDefault(result);
		}
	}

	// Get the good insertion method
	// If we can't find it we use replace method
	if(!a.isNull(this.insertMethods[method])) {
		this.currentState.load = this.insertMethods[method](el);
	} else {
		this.currentState.load = this.insertMethods["replace"](el);
	}

	var state = this.currentState;

	// We save the current state
	if(this.save) {
		// Reset currentState and associated variables, functions.
		this.currentState = {};
		this.temporary.variables = {};
		this.temporary.listeners = [];
		this.temporary.functions = {};
		this.validate = 0;

		// Save State
		this.saveState(state);
	}

	return state;
};

/**
 * Append
 * ---
 * Method to append content in specific dom element.
 *
 * @param el
 * @returns {{}}
 */
StateHelper.prototype.append = function(el) {
	return this.insert(el, "append");
};

/**
 * replace
 * ---
 * Replace to replace content in a specific dom element.
 *
 * @param el
 * @returns {{}}
 */
StateHelper.prototype.replace = function(el) {
	return this.insert(el, "replace");
};

/**
 * addState
 * ---
 * Minimal configuration to add a state.
 *
 * @param id
 * @param hash
 * @param htmlTemplate
 * @param data
 * @returns {StateHelper}
 */
StateHelper.prototype.addState = function(id, hash, htmlTemplate, data) {
	// We load defaults options
	var dataDefault   = this.data;
	var include       = this.state.include;
	var prefixDefault = this.state.prefix;

	// We validate include and we push data
	var include  = {};
	include.html = htmlTemplate;

	// We add dataDefault to data
	for(var d in dataDefault) {
		data[d] = dataDefault[d];
	}

	// We create new id if needed
	if(prefixDefault != null) {
		id = prefixDefault + "-" + id;
	}

	// We generate a minimal state
	this.currentState = {
		id        : id,
		hash      : hash,
		include   : include,
		data      : data,
		converter : this.functions.converter,
		preLoad   : this.functions.preLoad,
		postLoad  : this.functions.postLoad,
		preUnload : this.functions.preUnload,
		postUnload: this.functions.postUnload
	};

	// The state is valid to be include
	this.validate = 1;

	return this;
};

/**
 * setParent
 * ---
 * Define a parent for a state.
 *
 * @param stateId
 * @returns {StateHelper}
 */
StateHelper.prototype.setParent = function(stateId) {
	this.state.parent = stateId;
	return this;
};

/**
 * setInclude
 * ---
 * Add resources files to a specific state.
 *
 * @param name
 * @param files
 * @returns {StateHelper}
 */
StateHelper.prototype.setInclude = function(name, files) {
	if(a.isNull(this.currentState.include[name])) {
		this.currentState.include[name] = [];
	}

	if(a.isString(files)) {
		this.currentState.include[name] = files;
	} else if (a.isArray(files)) {
		for(var f in files) {
			this.currentState.include[name].push(files[f]);
		}
	}

	return this;
};

/**
 * setFunction
 * ---
 * setFunction override basics callbacks of settings.
 *
 * @param name
 * @param func
 * @returns {StateHelper}
 */
StateHelper.prototype.setFunction = function(name, func) {
	if(!a.isFunction(func)) {
		a.console.error(name, "It's not a function");
	}

	this.temporary.functions[name] = func;
	return this;
};

/**
 * setListener
 * ---
 * setListener define new listener for a specific state.
 *
 * @param type
 * @param name
 * @param func
 * @returns {StateHelper}
 */
StateHelper.prototype.setListener = function(type, name, func) {
	if(a.isNull(type) || (type != "appstorm" && type != "jquery")) {
		a.console.error("This type is not define in StateHelper! Sorry.");
	}

	this.temporary.listeners.push({type: type, on: name, func: func});
	return this;
};

/**
 * setLoadBefore
 * ---
 * Set a temporary variables of state's id need to load before state loading
 *
 * @param idList
 * @returns {StateHelper}
 */
StateHelper.prototype.setLoadBefore = function(idList) {
	this.temporary.variables.loadBefore = idList;
	return this;
};

/**
 * setLoadAfter
 * ---
 * Set a temporary variables of state's id need to load after state loading
 *
 * @param idList
 * @returns {StateHelper}
 */
StateHelper.prototype.setLoadAfter = function(idList) {
	this.temporary.variables.loadAfter = idList;
	return this;
};