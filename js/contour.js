(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let makeMosaic = require('./makeMosaic.js');

let height = 450;
let width = height * 4/3;
let size = 5;

const sketch = (s) => {

	let capture;
	let offset = 0;
	let vidWidth = width;

	if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
		vidWidth = height * 3/4;
		offset = (width - vidWidth)/2;
		document.querySelector('#canvas-container').style.transform = 'scale(1.5)';
	}
	
	s.setup = () => {
		s.createCanvas(width, height*2);
		s.pixelDensity(1);
		capture = s.createCapture(s.VIDEO);
		capture.hide();
	};

	s.draw = () => {
		s.push();
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, offset, height, vidWidth, height);
		s.pop();

		s.loadPixels();
		let pixels = s.pixels;
		pixels = pixels.slice(pixels.length/2, pixels.length);

		let squares = makeMosaic(size, size, width, height, pixels);
		let lums = squares.map(square => 0.299*square[0] + 0.587*square[1] + 0.114*square[2]);

		drawLines(lums)

	};

};

let uniqueColors = 6;
let thresholds = d3.range(0, 255, 255/(uniqueColors));

let svg = d3.select('#svg-container')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

let color = d3.scaleSequential([0,1], d3.interpolateViridis);
let path = d3.geoPath(d3.geoIdentity().scale(size));

function drawLines(lums){

	let contours = d3.contours()
		.size([width/size, height/size]);

	svg.selectAll('*').remove();

	let g = svg.append('g').attr('stroke', 'white');

	for (const threshold of thresholds) { 
		g.append('path')
			.attr('d', path(contours.contour(lums, threshold)))
			.attr('fill', color(threshold/255));
	}
}

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));
},{"./makeMosaic.js":2}],2:[function(require,module,exports){
module.exports = function makeMosaic(itemWidth, itemHeight, totalWidth, totalHeight, pixels, pixelDensity){

	pixelDensity = pixelDensity || 1;

	if(totalWidth % itemWidth != 0 || totalHeight % itemHeight != 0){
		console.error("Mosaic size doesn't fit cam dimensions");
		return;
	}

	let finalPixels = [];
	let len = totalWidth/itemWidth * totalHeight/itemHeight;

	for(let i = 0; i < len; i++){
		finalPixels.push([0, 0, 0]);
	}

	// logic to handle higher pixel densities, selecting 
	// top-left pixel in each "grid" of high density pixels

	let finalPx = 0;

	for(let i = 0; i < pixels.length; i+=4){

		let densePx = i/4;
		let row = Math.floor(densePx/(totalWidth * pixelDensity));

		if(densePx % pixelDensity == 0 && row % pixelDensity == 0){

			let x = finalPx % totalWidth;
			let y = Math.floor(finalPx/totalWidth);
			let gridX = Math.floor(x/itemWidth);
			let gridY = Math.floor(y/itemHeight);
			let pos = gridX + gridY*(totalWidth/itemWidth);

			finalPixels[pos][0] += pixels[i];
			finalPixels[pos][1] += pixels[i+1];
			finalPixels[pos][2] += pixels[i+2];

			finalPx++;
		}
	}


	return finalPixels.map(px => {
		return px.map(num => Math.round(num/(itemWidth * itemHeight)))
	});
}


},{}]},{},[1]);
