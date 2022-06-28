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