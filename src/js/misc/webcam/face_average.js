const sketch = (s) => {

	let height = 450;
	let width = height * 4/3;
	let offset = 0;
	let vidWidth = width;
	const pixelDensity = 2;

	// p5.js canvas and it's HTML <canvas/> element
	let p5Canvas;
	let p5CanvasElement;
	// p5.js capture and it's HTML <video/> element
	let capture;
	let captureElement;
	// store dimenions formatted for faceapi
	let displaySize;
	let noseX = 0;
	let noseY = 0;
	let faceResult = null;

	let fade = 0.2;
	let increment = 0;
	let heads = [];
	let maxHeads = 4;
	let headNum = 0;
	let totalRuns = 0;

	// if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
	// 	vidWidth = height * 3/4;
	// 	offset = (width - vidWidth)/2;
	// 	document.querySelector('#canvas-container').style.transform = 'scale(1.5)';
	// }

	function loadModels(){
	  Promise.all([
	  	faceapi.nets.tinyFaceDetector.load('../miscFiles/face-api-files/'),
	    //faceapi.nets.ssdMobilenetv1.load('../miscFiles/face-api-files/'),
	    faceapi.nets.faceLandmark68Net.load('../miscFiles/face-api-files/')
	  ])
	  // noLoop() was called in setup, pausing draw() while we load, we resume here once models are loaded
	  .then(()=>{
	  	s.loop();
	  })
	}

	s.setup = () => {

		p5Canvas = s.createCanvas(width, height);
		p5CanvasElement = p5Canvas.elt;
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		captureElement = capture.elt;
		captureElement.setAttribute('playsinline', '');
		capture.size(width, height);
		capture.hide();
		displaySize = { width: width, height: height };
		faceapi.matchDimensions(p5Canvas, displaySize);

		// optional: match setInterval(..., 100) -> 10fps from the example
		s.frameRate(10);
		// trigger model loading
		loadModels();
		// pause P5's update loop until the video is ready ('play' event)
		s.noLoop();
		s.noFill()

	};

	s.draw = async () => {

		faceapi.detectAllFaces(captureElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
		//faceapi.detectAllFaces(captureElement).withFaceLandmarks()
			.then(result => drawFace(faceapi.resizeResults(result, displaySize)))

		s.clear();
		s.push();
		//flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, offset, 0, vidWidth, height);
		s.pop();

		if(faceResult){

			let eye1 = faceResult[39];
			let eye2 = faceResult[42];
			s.line(-(eye1._x -width), eye1._y, -(eye2._x - width), eye2._y)
			s.circle(-(eye1._x - width), eye1._y, 5)
			s.circle(-(eye2._x - width), eye2._y, 5)
			// for(let pos of faceResult){
			// 	s.circle(-(pos._x - width), pos._y, 5)
			// 	//s.circle(pos._x, pos._y, 5)
			// }
		}

		s.loadPixels();
		let pixels = s.pixels;
		increment++;

		for(let i = 0; i < heads.length; i++){
			if(heads[i]){
				if(i == 0){
					s.image(heads[0], 0, 0, 120, 120);
				}
				else if(i == 1){
					s.image(heads[1], width - 120, 0, 120, 120);
				}
				else if(i == 2){
					s.image(heads[2], width - 120, height - 120, 120, 120);
				}
				else {
					s.image(heads[3], 0, height - 120, 120, 120);
				}
			}
		}
	};

	function drawFace(result){

		if(result[0]){

			if(increment > 20 + (10 * (totalRuns + 1))){

				let box = result[0].alignedRect._box;
				let head = s.get(-(box._x - width) - box._width, box._y, box._width, box._height)

				heads[headNum] = head;
				totalRuns++
				headNum++;
				if(headNum === maxHeads){
					headNum = 0;
				}
			}


			if(!faceResult){
				faceResult = result[0].landmarks.positions;
			}
			else {
				for(let i = 0; i < result[0].landmarks.positions.length; i++){
					let newResult = result[0].landmarks.positions[i];
					faceResult[i]._x = faceResult[i]._x * fade + newResult._x * (1 - fade);
					faceResult[i]._y = faceResult[i]._y * fade + newResult._y * (1 - fade);
				}
			}
		}
	}
};

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));