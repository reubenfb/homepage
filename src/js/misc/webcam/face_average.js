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

		s.angleMode(s.DEGREES)
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

		}

		s.loadPixels();
		let pixels = s.pixels;
		increment++;

		for(head of heads){
			let angle = calculateAngle(head.eye1, head.eye2) - calculateAngle(faceResult[39], faceResult[42])
			let scale = lengthOfLine(faceResult[39], faceResult[42])/lengthOfLine(head.eye1, head.eye2)
			s.push();
			s.translate(-(faceResult[39]._x - width), faceResult[39]._y);
			s.rotate(angle);
			s.scale(scale);
			s.imageMode(s.CENTER);
			s.tint(255,255/(maxHeads + 1))
			s.image(head.image, head.translate.transX, head.translate.transY);
			s.pop();
		}
	};

	function drawFace(result){

		if(result[0]){

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

			if(heads.length < maxHeads && increment > 20 + 10 * (headNum + 1)){

				let box = result[0].alignedRect._box;
				let head = s.get(-(box._x - width) - box._width, box._y, box._width, box._height);

				heads[headNum] = {
					eye1: {
						_x: faceResult[39]._x,
						_y: faceResult[39]._y
					},
					eye2: {
						_x: faceResult[42]._x,
						_y: faceResult[42]._y
					},
					translate: {
						transX: faceResult[39]._x - (box._x + box._width/2),
						transY: (box._y + box._height/2) - faceResult[39]._y
					},
					image: head
				};
				headNum++;
			}
		}
	}
};

function calculateAngle(p1, p2){
	return Math.atan2(p2._y - p1._y, p2._x - p1._x) * 180 / Math.PI;
}

function lengthOfLine(p1, p2){
	let a = p1._x - p2._x;
	let b = p1._y - p2._y;
	return Math.sqrt(a*a + b*b);
}

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));