/**
 * @file This file contains utility functions to assist with logging.
 *
 * You can change the log level at any time during execution by setting the LOGLEVEL variable
 * in your script to the desired value. Valid values for LOGLEVEL are:
 * - LOGLEVEL_ERROR
 * - LOGLEVEL_WARNING
 * - LOGLEVEL_INFO
 * - LOGLEVEL_DEBUG
 * - LOGLEVEL_TRACE
 *
 * This script is a JavaScript version of the original JScript-Logging from Sparx, and with more logical
 * log levels (ERROR - WARNING - INFO - DEBUG - TRACE instead of ERROR - INFO - WARNING - DEBUG - TRACE).
 * See also https://www.sparxsystems.com/forums/smf/index.php/topic,11082.msg149186.html.
 */

// LOGLEVEL values
var LOGLEVEL_ERROR = 0;
var LOGLEVEL_WARNING = 1;
var LOGLEVEL_INFO = 2;
var LOGLEVEL_DEBUG = 3;
var LOGLEVEL_TRACE = 4;

// The level to log at; change if needed in your own script.
var LOGLEVEL = LOGLEVEL_INFO;

/**
 * Logs a message at the ERROR level. The message will be displayed if LOGLEVEL is set to 
 * LOGLEVEL_ERROR or above.
 *
 * @param {string} message The message to log
 */
function LOGError(message) {
	if (LOGLEVEL >= LOGLEVEL_ERROR)
		Session.Output(_LOGGetDisplayDate() + " [ERROR]: " + message);
}

/**
 * Logs a message at the INFO level. The message will be displayed if LOGLEVEL is set to 
 * LOGLEVEL_INFO or above.
 *
 * @param {string} message The message to log
 */
function LOGInfo(message) {
	if (LOGLEVEL >= LOGLEVEL_INFO)
		Session.Output(_LOGGetDisplayDate() + " [INFO]: " + message);
}

/**
 * Logs a message at the WARNING level. The message will be displayed if LOGLEVEL is set to 
 * LOGLEVEL_WARNING or above.
 *
 * @param {string} message The message to log
 */
function LOGWarning(message) {
	if (LOGLEVEL >= LOGLEVEL_WARNING)
		Session.Output(_LOGGetDisplayDate() + " [WARNING]: " + message);
}

/**
 * Logs a message at the DEBUG level. The message will be displayed if LOGLEVEL is set to 
 * LOGLEVEL_DEBUG or above.
 *
 * @param {string} message The message to log
 */
function LOGDebug(message) {
	if (LOGLEVEL >= LOGLEVEL_DEBUG)
		Session.Output(_LOGGetDisplayDate() + " [DEBUG]: " + message);
}

/**
 * Logs a message at the TRACE level. The message will be displayed if LOGLEVEL is set to 
 * LOGLEVEL_TRACE or above.
 *
 * @param {string} message The message to log
 */
function LOGTrace(message) {
	if (LOGLEVEL >= LOGLEVEL_TRACE)
		Session.Output(_LOGGetDisplayDate() + " [TRACE]: " + message);
}

/**
 * Returns the current date/time in a format suitable for logging.
 *
 * @return {string} The current date/time
 * @private
 */
function _LOGGetDisplayDate() {
	var now = new Date();

	// Pad hour value
	var hours = now.getHours();
	if (hours < 10)
		hours = "0" + hours;

	// Pad minute value
	var minutes = now.getMinutes();
	if (minutes < 10)
		minutes = "0" + minutes;

	// Pad second value
	var seconds = now.getSeconds();
	if (seconds < 10)
		seconds = "0" + seconds;

	var displayDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
	displayDate += " " + hours + ":" + minutes + ":" + seconds;

	return displayDate;
}