let makeMosaic = require('./makeMosaic.js');

const sketch = (s) => {

	let capture;
	let width = 600;
	let height = width * 0.75;
	let size = 30;

	if(height % size != 0 || width % size != 0){
		console.error("Square size doesn't fit cam dimensions");
		return;
	}

	s.setup = () => {
		s.createCanvas(width, height*2);
		s.pixelDensity(1);
		capture = s.createCapture(s.VIDEO);
		capture.hide();
	};

	s.draw = () => {
		s.push();
		// flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, 0, height, width, height);
		s.pop();

		s.loadPixels();
		let pixels = s.pixels;
		pixels = pixels.slice(pixels.length/2, pixels.length);

		let squares = makeMosaic(size, size, width, height, pixels);

		s.noStroke();
		let xPos = 0;
		let yPos = 0;

		for(let i = 0; i < squares.length; i++){

			//fill(0.299*squares[i][0] + 0.587*squares[i][1] + 0.114*squares[i][2]);
			s.fill(squares[i][0], squares[i][1], squares[i][2])
			s.square(xPos, yPos, size);
			xPos += size;

			if(xPos >= width){
				xPos = 0;
				yPos += size;
			}
		}
	};

};

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));