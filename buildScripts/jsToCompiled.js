// Compile JS from index.html to one JS-file

//================================================================
// Settings
//================================================================

const from        = 'htmlRoot/index.html';
const output      = 'build/compiled.js';

//================================================================
// Code
//================================================================

const fs          = require('fs');
const file        = fs.readFileSync(from, 'utf-8');
const regexp      = /<script src='(.*?)'>/ig;
let   script      = regexp.exec(file);
const files       = []; 

while ( script ) {
	files.push( script[1] );
	script = regexp.exec(file);
}

fs.writeFileSync(output, "// Made by jsToCompiled.js\n'use strict';\n", {
	encoding : 'utf-8',
	flag     : 'w'
});
for ( let file of files ) {
	let toWrite = '\n// ' + file + '\n' +
			fs.readFileSync('htmlRoot/'+file, 'utf-8');
	fs.writeFileSync(output, toWrite, {
		encoding : 'utf-8',
		flag     : 'a'
	});
}
