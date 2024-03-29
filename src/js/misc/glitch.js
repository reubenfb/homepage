const sketch = ( s ) => {

	let width = 300;
	s.glitches = [];
	let keyboard;

	s.setup = () => {
		s.createCanvas(width * 4, width * 2);
		
		keyboard = s.loadImage('images/recreating/keyboard.jpg', image => image.resize(width,width));

		// generate a new glitch instance for each image
		for(let i = 0; i<8; i++){
			s.glitches[i] = new Glitch(s);
		}
	};


	s.draw = () => {

		

		for(let i = 0; i < 8; i++){

			s.glitches[i].limitBytes(0.5, 1);

			let xPos = i % 4;
			let yPos = Math.floor(i/4);

			let quality = s.map(yPos, 0, 1, 1, 0, true);
			s.glitches[i].loadQuality(quality);
			s.glitches[i].loadImage(keyboard);

			s.glitches[i].resetBytes();
			let randCount = xPos;
			s.glitches[i].randomBytes(randCount);

			s.glitches[i].buildImage();
			s.image(s.glitches[i].image, xPos * width, yPos * width);
		}

	};

};

let myp5 = new p5(sketch);