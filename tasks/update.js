#!/usr/bin/env node

var tabletop = require('tabletop');
var fs = require('fs');
require('colors');

console.error(('spreadsheet.js').green.inverse);

tabletop.init({ 
  key: 'https://docs.google.com/spreadsheets/d/1nbqzUvQCPOOT-gubvmmICjMheZJAwUKkZF8KnrUY6Ts/edit?usp=sharing',
  callback: writeData,
  simpleSheet: false
});

let finalData = {};


function writeData(data, tabletop){

	let finalData = {
		projects: data.projects.elements
	}
	
	fs.writeFileSync('./data/data.json', JSON.stringify(finalData))
}

