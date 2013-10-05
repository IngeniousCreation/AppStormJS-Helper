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
a.merge = function() {
	var ar  = arguments,
		res = {};
	for(var i=0, l=ar.length; i<l; ++i) {
		var o = ar[i];
		for(var j in o) {
			if(!res[j]) {
				res[j] = o[j];
			}
		}
	}
	return res;
};


/*
------------------------------------------------------------------------------------------------------------------------
	StateHelper : helpers
------------------------------------------------------------------------------------------------------------------------
 */

function __converterDefault(data) {
	console.log(data);
	return data;
};
function __postLoadDefault(result) {
	alert("lol");
	result.done();
};


function __appendDefault($dom) {
	console.log($dom);
	return function(content) {
		console.log(content);
		var el = $(document).find($dom).get(0);
		if(a.isNull(el)) {
			alert("id: " + id + " does not exist");
		}
		a.page.template.append(el, content);
	};
};
function __replaceDefault($dom) {
	console.log($dom);
	return function(content) {
		console.log(content);
		var el = $(document).find($dom).get(0);
		if(a.isNull(el)) {
			alert("id: " + id + " does not exist");
		}
		a.page.template.replace(el, content);
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
		// Configuration Part
		options       : {
			state : {
				prefix : null,
				parent : null,
				include: {
					html: null,
					css : null,
					js  : null
				}
			},
			data      : {},
			functions : {
				converter: __converterDefault,
				postLoad : __postLoadDefault
			}
		},
		insertMethods: {
			append : __appendDefault,
			replace: __replaceDefault
		},
		// Save state
		save : false,
		// Current State Part
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
StateHelper.saveState   = function(state) {
	if(!a.isNull(this.options.state.parent)) {
		var prefixDefault = this.options.state.prefix,
			parentDefault = this.options.state.parent;
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
 * Append
 * ---
 * Method to append content in specific dom element
 *
 * @param el
 * @returns {{}}
 */
StateHelper.append = function(el) {
	if(!this.validate) {
		return;
	}

	var tmp = {};

	this.currentState.load = this.insertMethods.append(el);
	tmp = this.currentState;

	this.currentState = {};
	this.validate = 0;

	if(this.save) {
		this.saveState(tmp);
	}

	return tmp;
}

/**
 * replace
 * ---
 * Replace to replace content in a specific dom element
 *
 * @param el
 * @returns {{}}
 */
StateHelper.replace = function(el) {
	if(!this.validate) {
		return;
	}

	var tmp = {};

	this.currentState.load = this.insertMethods.replace(el);
	tmp = this.currentState;

	this.currentState = {};
	this.validate = 0;

	if(this.save) {
		this.saveState(tmp);
	}

	return tmp;
}

/**
 * addState
 * ---
 * Minimal configuration to add a state
 *
 * @param id
 * @param hash
 * @param htmlTemplate
 * @param data
 * @returns {StateHelper}
 */
StateHelper.addState = function(id, hash, htmlTemplate, data) {
	// Function to transform single value of include to array
	var includeToArray = function(include) {
		var html = include.html,
			css  = include.css,
			js   = include.js;

		if(!a.isArray(html) && html != null) html = [html];
		if(!a.isArray(css)  && css != null)  css  = [css];
		if(!a.isArray(js)   && js  != null)   js  = [js];

		if(html == null) include.html = []; else include.html = [html];
		if(css == null)  include.js   = []; else include.js   = [js];
		if(js == null)   include.css  = []; else include.css  = [css];

		return include;
	};

	// We load defaults options
	var include        = this.options.state.include;
	var dataDefault    = this.options.data;
	var prefixDefault  = this.options.state.prefix;

	// We validate include and we push data
//	include = includeToArray(include);
	var include  = {};
	include.html = htmlTemplate;

	console.log(include);

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
		id       : id,
		hash     : hash,
		include  : include,
		data     : data,
		converter: this.options.functions.converter,
		postLoad : this.options.functions.postLoad
	};

	// The state is valid to be include
	this.validate = 1;

	return this;
};

/*
------------------------------------------------------------------------------------------------------------------------
	jQuery Like
------------------------------------------------------------------------------------------------------------------------
*/

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
	this.stateHelper.addState(id, hash, htmlTemplate, data);
	return this;
};

/**
 * append
 * ---
 * Final method, she define the method of content integration and she can also save the state directly
 *
 * @returns {{}}
 */
$.fn.append   = function() {
	var el  = $(this).selector;
	return this.stateHelper.append(el);
};

/**
 * replace
 * ---
 * Final method, she define the method of content integration and she can also save the state directly
 *
 * @returns {{}}
 */
$.fn.replace   = function() {
	var el  = $(this).selector;
	return this.stateHelper.replace(el);
};

$.fn.use       = function(stateHelper) {
	this.stateHelper = stateHelper;
	return this;
}

/*
------------------------------------------------------------------------------------------------------------------------
	Test Part
------------------------------------------------------------------------------------------------------------------------
 */


var $sh = new StateHelper({
	options: {
		state:{
			prefix: "music"
		}
	},
	save: true
});
console.log($sh);

$("div#layout").use($sh).addState("root", null, "templates/layout/default.html", null).append();

$sh.options.state.parent = "root";
$("div#content").addState("root", "/test", "templates/test/index.html", null).replace();


a.message.addListener("a.state.end", function(hash){
	console.log(hash);
});