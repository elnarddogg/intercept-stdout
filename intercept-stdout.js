// Borrowed.
// https://gist.github.com/benbuckman/2758563


var toArray	= require('lodash.toarray'),
	util			= require('util');

// intercept stdout, passes thru callback
// also pass console.error thru stdout so it goes to callback too
// (stdout.write and stderr.write are both refs to the same stream.write function)
// returns an unhook() function, call when done intercepting
module.exports = function (callback) {

	var old_stdout_write = process.stdout.write,
	old_console_error = console.error;

	process.stdout.write = (function(write) {
		return function(string, encoding, fd) {
			var args = toArray(arguments);
			args[0] = interceptor( string );
			write.apply(process.stdout, args);
		};
	}(process.stdout.write));

	console.error = (function(log) {
		return function() {
			var args = toArray(arguments);
			args.unshift('\x1b[31m[ERROR]\x1b[0m');
			console.log.apply(console.log, args);
		};
	}(console.error));

	function interceptor(string) {
		// only intercept the string
		var result = callback(string);
		if (typeof result == 'string') {
			string = result.replace( /\n$/ , '' ) + (result && (/\n$/).test( string ) ? '\n' : '');
		}
		return string;
	}

	// puts back to original
	return function unhook() {
		process.stdout.write = old_stdout_write;
		console.error = old_console_error;
	};

};
