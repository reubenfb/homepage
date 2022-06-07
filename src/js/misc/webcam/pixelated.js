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

		let squares = makeMosaic(size, width, height, pixels);

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

	function makeMosaic(size, width, height, pixels){

		let len = (width/size) * (height/size);

		let finalPixels = [];
		for(let i = 0; i < len; i++){
			finalPixels.push([0, 0, 0]);
		}

		for(let i = 0; i < pixels.length; i+=4){

			let r = pixels[i];
			let g = pixels[i+1];
			let b = pixels[i+2];

			let pixel = i/4;
			//console.log(pixel)
			let x = pixel % width;
			let y = s.floor(pixel/width);
			let gridX = s.floor(x/size);
			let gridY = s.floor(y/size);
			let pos = gridX + gridY*(width/size);

			finalPixels[pos][0] += r;
			finalPixels[pos][1] += g;
			finalPixels[pos][2] += b;

		}

		return finalPixels.map(px => {
			return px.map(num => s.round(num/(size * size)))
		});
	}

};

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));

