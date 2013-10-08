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

// On Data
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

/*
 * FinalInsertion, Call on load.
 */
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
// Default function used
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
var StateHelper = function(settings){
	defaultSettings = {
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
		// Temporary variables or functions set for a state by user
		temporary    : {
			variables: {},
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
	}

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

StateHelper.prototype.insert = function(el, method) {
	// If the state are not valid we stop execution
	if(!this.validate) {
		return null;
	}

	// We load all temporary functions (set by user for the current state)
	var converter  = this.temporary.functions.converter;

	var loadBefore = this.temporary.variables.loadBefore;
	var loadAfter  = this.temporary.variables.loadAfter;

	var preLoad    = this.temporary.functions.preLoad;
	var postLoad   = this.temporary.functions.postLoad;

	// We load default functions
	var preLoadDefault  = this.functions.preLoad;
	var postLoadDefault = this.functions.postLoad;

	// Use custom converter
	if(!a.isNull(converter)) {
		this.currentState.converter = converter;
	}

	// Use custom preLoad or loadBefore
	if(!a.isNull(preLoad) || !a.isNull(loadBefore)) {
		this.currentState.preLoad = function(result) {
			if(!a.isNull(loadBefore) && a.isArray(loadBefore)) {
				for(i=0; i < loadBefore.length; i++) {
					if(a.isString(loadBefore[i])) {
						a.state.loadById(loadBefore[i]);
					}
				}
			}

			if(!a.isNull(preLoad)) {
				if(!preLoad(result)) result.fail(); else result.done();
			} else {
				preLoadDefault(result);
			}
		}
	}

	// Use custom postLoad or loadAfter
	if(!a.isNull(postLoad) || !a.isNull(loadAfter)) {
		this.currentState.postLoad = function(result) {
			if(!a.isNull(loadAfter) && a.isArray(loadAfter)) {
				for(i=0; i < loadAfter.length; i++) {
					if(a.isString(loadAfter[i])) {
						a.state.loadById(loadAfter[i]);
					}
				}
			}

			if(!a.isNull(postLoad)) {
				if(!postLoad(result)) result.fail(); else result.done();
			} else {
				postLoadDefault(result);
			}
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
 * Method to append content in specific dom element
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
 * Replace to replace content in a specific dom element
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
 * Minimal configuration to add a state
 *
 * @param id
 * @param hash
 * @param htmlTemplate
 * @param data
 * @returns {this}
 */
StateHelper.prototype.addState = function(id, hash, htmlTemplate, data) {
	// We load defaults options
	var include       = this.state.include;
	var dataDefault   = this.data;
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

StateHelper.prototype.setParent = function(stateId) {
	this.state.parent = stateId;
	return this;
};

StateHelper.prototype.setInclude = function(name, files) {
	if(a.isString(files)) {
		this.currentState.include[name] = files;
	} else if (a.isArray(files)) {
		for(var f in files) {
			this.currentState.include[name].push(files[f]);
		}
	}

	return this;
};

StateHelper.prototype.setFunction = function(name, func) {
	if(!a.isFunction(func)) {
		a.console.error(name, "It's not a function");
	}

	this.temporary.functions[name] = func;
	return this;
};

StateHelper.prototype.setLoadBefore = function(idList) {
	this.temporary.variables.loadBefore = idList;
	return this;
};

StateHelper.prototype.setLoadAfter = function(idList) {
	this.temporary.variables.loadAfter = idList;
	return this;
};

/*
 ------------------------------------------------------------------------------------------------------------------------
 jQuery Like
 ------------------------------------------------------------------------------------------------------------------------
 */

/**
 * use
 * ---
 * load a StateHelper configuration
 *
 * @param stateHelper
 * @returns {$.fn}
 */
$.fn.use = function(stateHelper) {
	this.stateHelper = stateHelper;
	return this;
};

/**
 * parent
 * ---
 * jQuery binding to StateHelper.setParent
 *
 * @param el
 * @returns {$.fn}
 */
$.fn.parent = function(el) {
	this.stateHelper = this.stateHelper.setParent(el);
	return this;
};

/**
 * addState
 * ---
 * jQuery binding to StateHelper.addState
 *
 * @param id
 * @param hash
 * @param htmlTemplate
 * @param data
 * @returns {*|jQuery|HTMLElement}
 */
$.fn.addState = function(id, hash, htmlTemplate, data) {
	this.stateHelper  = this.stateHelper.addState(id, hash, htmlTemplate, data);
	return this;
};

/**
 * postLoad
 * ---
 * jQuery binding to StateHelper.postLoad
 *
 * @param func
 * @returns {$.fn}
 */
$.fn.postLoad  = function(func) {
	this.stateHelper = this.stateHelper.setFunction("postLoad", func);
	return this;
};

$.fn.file = function(name, files) {
	if(name == "html" || name == "js" || name == "css") {
		this.stateHelper = this.stateHelper.setInclude(name, files);
	}
	return this;
};


/**
 * converter
 * ---
 * jQuery binding to StateHelper.converter
 *
 * @param func
 * @returns {$.fn}
 */
$.fn.converter = function(func) {
	this.stateHelper = this.stateHelper.setFunction("converter", func);
	return this;
};

/**
 * loadAfter
 * ---
 * jQuery binding to StateHelper.setLoadAfter
 *
 * @param idList
 * @returns {$.fn}
 */
$.fn.loadAfter = function(idList) {
	this.stateHelper = this.stateHelper.setLoadAfter(idList);
	return this;
};

/**
 * loadBefore
 * ---
 * jQuery binding to StateHelper.setLoadBefore
 *
 * @param idList
 * @returns {$.fn}
 */
$.fn.loadBefore = function(idList) {
	this.stateHelper = this.stateHelper.setLoadBefore(idList);
	return this;
}

/**
 * append
 * ---
 * She define the method of content integration and she can also save the state directly
 *
 * @returns {$.fn}
 */
$.fn.append = function() {
	var el  = $(this).selector;
	this.stateHelper.append(el);
	return this;
};

/**
 * replace
 * ---
 * She define the method of content integration and she can also save the state directly
 *
 * @returns {$.fn}
 */
$.fn.replace = function() {
	var el  = $(this).selector;
	this.stateHelper.replace(el);
	return this;
};

/**
 * save
 * ---
 * Final methods, she save the current state, if the user have not define automatic save.
 *
 * @returns {{}}
 */
$.fn.save = function() {
	this.stateHelper.saveState(this.stateHelper.currentState);
	return this.currentState;
};