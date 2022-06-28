(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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


},{}],2:[function(require,module,exports){
let makeMosaic = require('./makeMosaic.js');

const sketch = (s) => {

	let capture;
	let height = 450;
	let width = height * 4/3;
	let offset = 0;
	let vidWidth = width;

	let size = 15;
	let speeds = Array(width/size * height/size).fill(0);
	let pixelDensity = 2;

	if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
		vidWidth = height * 3/4;
		offset = (width - vidWidth)/2;
		document.querySelector('#canvas-container').style.transform = 'scale(1.5)';
	}

	s.setup = () => {
		s.createCanvas(width, height*2);
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		capture.hide();
		s.angleMode(s.DEGREES);
		s.rectMode(s.CENTER);
	};

	s.draw = () => {

		s.push();
		// flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, offset, height, vidWidth, height);
		s.pop();

		s.loadPixels();
		let pixels = s.pixels;
		pixels = pixels.slice(pixels.length/2, pixels.length);

		let squares = makeMosaic(size, size, width, height, pixels, pixelDensity);

		let xPos = 0;
		let yPos = 0;

		s.noStroke();
		s.clear();

		let pow = 4;
		let lums = squares.map(char => 0.299*char[0] + 0.587*char[1] + 0.114*char[2]);
		lums = lums.map(lum => Math.pow(lum, pow));
		let lumMax = Math.max(...lums);
		let lumMin = Math.min(...lums);

		for(let i = 0; i < squares.length; i++){

			if(lumMax == 0){
				break;
			}
			
			let speed = s.map(lums[i], lumMin, lumMax, 0, 15, true);

			if(speed < 0.75) {
				speed = 360 - speeds[i];
			}

			speeds[i] = (speeds[i] + speed) % 360;

			let centerX = xPos + size/2;
			let centerY = yPos + size/2;

			s.push();
			s.fill(50);
			s.translate(centerX, centerY);
			s.rotate(speeds[i]);
			s.square(0,0,size);
			s.pop();

			xPos += size;

			if(xPos >= width){
				xPos = 0;
				yPos += size;
			}
		}
	};

};

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));
},{"./makeMosaic.js":1}]},{},[2]);
