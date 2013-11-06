"use strict";
/**
 * jQuery Binding
 * ---
 * Binding javascript functions and object to jquery for friendly use
 *
 * @author Florian Geoffroy <florian.geoffroy@gmail.com>
 */

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
 * setParent
 * ---
 * jQuery binding to StateHelper.setParent
 *
 * @param el
 * @returns {$.fn}
 */
$.fn.setParent = function(el) {
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
 * preUnload
 * ---
 * jQuery bindong to StateHelper.setFunction("preUnload", fct)
 *
 * @param func
 * @returns {$.fn}
 */
$.fn.preLoad = function(func) {
	this.stateHelper = this.stateHelper.setFunction("preUnload", func);
	return this;
};

/**
 * postLoad
 * ---
 * jQuery binding to StateHelper.setFunction("postLoad", fct)
 *
 * @param func
 * @returns {$.fn}
 */
$.fn.postLoad  = function(func) {
	this.stateHelper = this.stateHelper.setFunction("postLoad", func);
	return this;
};

/**
 * preUnload
 * ---
 * jQuery binding to StateHelper.setFunction("preUnload", fct)
 *
 * @param func
 * @returns {$.fn}
 */
$.fn.preUnload = function(func) {
	this.stateHelper = this.stateHelper.setFunction("preUnload", func);
	return this;
};

/**
 * postUnload
 * ---
 * jQuery binding to StateHelper.setFunction("postUnload", fct)
 *
 * @param func
 * @returns {$.fn}
 */
$.fn.postUnload = function(func) {
	this.stateHelper = this.stateHelper.setFunction("postUnload", func);
	return this;
};

/**
 * addListener
 * ---
 * jQuery binding to StateHelper.setAddListener
 *
 * @param type appstorm | jquery
 * @param on   event to call. If it's jquery [dom, jQuery event]
 * @param func function
 * @returns {$.fn}
 */
$.fn.addListener = function(type, on, func) {
	this.stateHelper = this.stateHelper.setListener(type, on, func);
	return this;
};

/**
 * file
 * ---
 * jQuery binding to StateHelper.setInclude
 *
 * @param name
 * @param files
 * @returns {$.fn}
 */
$.fn.addFile = function(name, files) {
	if(name == "html" || name == "js" || name == "css") {
		this.stateHelper = this.stateHelper.setInclude(name, files);
	}
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
 * insertAfter
 * ---
 * She define the method of content integration and she can also save the state directly
 *
 * @returns {$.fn}
 */
$.fn.insertAfter = function() {
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
