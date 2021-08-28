#!/usr/bin/env node
const fs = require('fs');
const { GoogleSpreadsheet } = require('google-spreadsheet');

let config = JSON.parse(fs.readFileSync('./config.json'));
const doc = new GoogleSpreadsheet(config.sheet);
doc.useApiKey(config.key);

(async function() {

		await doc.loadInfo();
		let rows = await doc.sheetsByIndex[0].getRows();

		let rowArray = [];

		rows.forEach(row => {

			let rowObj = {
				date: row.date,
				cat: row.cat,
				title: row.title,
				image: row.image,
				link: row.link,
				highlight: row.highlight,
				hide: row.hide
			}

			rowArray.push(rowObj);
		})

		let finalData = {
			projects: rowArray
		}

		fs.writeFileSync('./data/data.json', JSON.stringify(finalData))

}());

