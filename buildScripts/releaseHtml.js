// Make release HTML from index.html

//================================================================
// Settings
//================================================================

const releaseFile = 'compiled/index.html';
const indexFile   = 'htmlRoot/index.html';

//================================================================
// Code
//================================================================

const fs      = require('fs');
const re      = /(<!-- scripts -->)[\S\s]*?(<!-- \/scripts -->)/;
let   content = fs.readFileSync(indexFile, 'utf-8');
content       = content.replace(re, '$1\n' + 
					"\t\t\t<script type='application/javascript' "+
					"src='release.js'></script>\n" + 
					'\t\t$2'
				);

content       = content.replace(/(<!-- qqEnging -->)[\S\s]*?(<!-- \/qqEnging -->)/, '');

fs.writeFileSync(releaseFile, content, {
	encoding : 'utf-8',
	flag     : 'w'
});
