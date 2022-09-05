let makeMosaic = require('./makeMosaic.js');

let height = 450;
let width = height * 4/3;
let size = 5;

const sketch = (s) => {

	let capture;
	let offset = 0;
	let vidWidth = width;

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

let thresholds = [0, 50, 100, 150, 200, 250, 255];
let svg = d3.select('#svg-container')
	.append('svg')
	.attr("width", width)
	.attr("height", height)
	.attr("viewBox", [0, 0, width, height])

let color = d3.scaleSequential([0,1], d3.interpolateMagma);

const projection = d3.geoIdentity().scale(size);

let path = d3.geoPath(projection);

function drawLines(lums){

	let contours = d3.contours()
		.size([width/size, height/size])
		.smooth(true);

	svg.selectAll('*').remove();

	let g = svg.append('g')
		.attr('stroke', 'white')

	for (const threshold of thresholds) { 

		g.append('path')
			.attr('d', path(contours.contour(lums, threshold)))
			.attr('fill', color(threshold/255));

	}


}

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));