let started = false;

// obj that contains line commands
let commands = {
	speeds: [],
	currentPositions: [0,0,0,0,0,0,0,0],
	goalPositions: [],
	wiggleAngle: [0,0,0,0,0,0,0,0],
	happyWiggleDirection: [0,0,0,0,0,0,0,0],
	sadArcDirection: [0,0,0,0,0,0,0,0]
}

// event handler to trigger serial communication
document.querySelector('h1').addEventListener('click', async () => {
	started = true;
	const port = await navigator.serial.requestPort();
	await port.open({ baudRate: 115200 });

	const textEncoder = new TextEncoderStream();
	const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
	const writer = textEncoder.writable.getWriter();

	setInterval(sendMessage, 10);

	async function sendMessage(){
		let message = stitchMessage(2);
		await writer.write(message);
		console.log(message);
	}

});

const sketch = (s) => {

	let height = 480;
	let width = height * 4/3;
	let vidWidth = width;
	const pixelDensity = 2;

	let webcamHeight = 120;
	let webcamWidth = webcamHeight * 4/3;

	if(webcamWidth % 1 !== 0){
		console.error('Bad webcam aspect ratio')
	}

	if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
		vidWidth = height * 3/4;
		webcamWidth = webcamHeight * 3/4;
		document.querySelector('#canvas-container').style.transform = 'scale(1.5)';
	}

	// count the loops so we don't detect faces constantly
	let drawLoops = 0;

	// p5.js canvas and it's HTML <canvas/> element
	let p5Canvas;
	let p5CanvasElement;
	// p5.js capture and it's HTML <video/> element
	let capture;
	let captureElement;

	// storage variables for faceapi
	let faceResult = null;
	let faceExpression = 'neutral';
	let mouthAngles = [];
	let expressionValues = [0, 0, 0];
	let displaySize = { width: width, height: height };
	let positionBounds = [0,180];

	// open wide positions
	let perfectPositions = [90, 0, 90, 0, 135, 45, 135, 45];

	// set initial random speeds and goal positions
	for(let i = 0; i < perfectPositions.length; i++){
		commands.speeds.push(getRandomInt(1, 9));
		commands.goalPositions.push(getRandomInt(0, 180));
	}

	// config for positioning and length of the lines
	let longLength = 200 - 28;
	let shortLength = 141 - 28;

	let sideCenters = [
		{'x': 320, 'y': 140},
		{'x': 420, 'y': 240},
		{'x': 320, 'y': 340},
		{'x': 220, 'y': 240},
		{'x': 370, 'y': 190},
		{'x': 370, 'y': 290},
		{'x': 270, 'y': 290},
		{'x': 270, 'y': 190}
	]

	let points = [
		{'x': 244, 'y': 140, 'len': longLength},
		{'x': 420, 'y': 175, 'len': longLength},
		{'x': 396, 'y': 340, 'len': longLength},
		{'x': 220, 'y': 305, 'len': longLength},
		{'x': 395, 'y': 215, 'len': shortLength},
		{'x': 382, 'y': 278, 'len': shortLength},
		{'x': 245, 'y': 265, 'len': shortLength},
		{'x': 258, 'y': 202, 'len': shortLength}
	]

	s.setup = () => {

		p5Canvas = s.createCanvas(width, height);
		p5CanvasElement = p5Canvas.elt;
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		captureElement = capture.elt;
		captureElement.setAttribute('playsinline', '');
		capture.size(vidWidth, height);
		capture.hide();
		faceapi.matchDimensions(p5Canvas, displaySize);

		s.frameRate(40);
		s.angleMode(s.DEGREES);
		s.textSize(14);
		s.textFont('Courier New');
		s.strokeCap(s.SQUARE);
		loadModels();
		s.noLoop();

	};

	s.draw = async () => {

		s.clear();
		s.rect(80,0,480,480);
		drawLoops++;

		// for performance, only re-detect face every 4 loops
		if(drawLoops % 4 == 0){
			faceapi.detectAllFaces(captureElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
				.then(result => detectFace(faceapi.resizeResults(result, displaySize)));
			drawLoops = 0;
		}

		// add webcam
		s.push();
		//flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, width - webcamWidth, height - webcamHeight, webcamWidth, webcamHeight);
		s.pop();

		// draw mood above webcam
		if(faceResult){
			s.noStroke();
			s.textAlign(s.CENTER);
			s.text(faceExpression.toUpperCase(), webcamWidth/2, height - webcamHeight - 5);
		}

		// CODE TO ACTUALLY MOVE THE LINES
		s.stroke(50)
		s.strokeWeight(3)

		for (let i = 0; i < points.length; i++){

			// only start moving if facial recognition is working, and the button has been clicked
			if(faceResult && started){
				// if mouth is open, interrupt movement and head to perfectPositions
				if(faceExpression === 'open'){
					commands.happyWiggleDirection[i] = 0;
					commands.sadArcDirection[i] = 0;
					commands.goalPositions[i] = perfectPositions[i];
					commands.speeds[i] = getRandomInt(3,7);
				}

				// figure out if you need to increment up or down
				let direction = commands.goalPositions[i] > commands.currentPositions[i] ? 1 : -1;

				// move in that direction 
				commands.currentPositions[i] += (speedMap(commands.speeds[i]) * direction);

				// check to see if the next step would be in the same direction
				let newDirection = commands.goalPositions[i] > commands.currentPositions[i] ? 1 : -1;

				//if you've overshot, set currentPosition to goalPosition
				if(newDirection != direction){

					commands.currentPositions[i] = commands.goalPositions[i];

					// if you're not open mouthed, set a new goal and speed based on expression
					if(faceExpression !== 'open'){
						getNewCommands(faceExpression, i);
					}
				}
			}

			// DRAW AND ROTATE LINES
			s.push();
			s.translate(points[i].x, points[i].y);
			s.rectMode(s.CENTER);
			s.noStroke();
			s.fill(0.8*255);
			s.rect(0,0,25.2,35.7);

			let offsetX = points[i].x - sideCenters[i].x;
			let offsetY = points[i].y - sideCenters[i].y;
			let offset = Math.sqrt(Math.pow(offsetX,2) + Math.pow(offsetY,2));

			let direction = offsetX * offsetY;

			if(offsetY <= offsetX) {
				offset = -offset;
			}

			if(offsetY < 0 && offsetX < 0){
				offset = -offset;
			}


			let draw = [];

			// top to bottom
			// 2, 4, 1, 3, 5,7, 8, 6

			//X 1 on top of 5, 7, 8
			//X 2 on top of 3, 5, 6, 8
			//X 3 on top of 5, 6, 7
			//X 4 on top of 1, 6, 7, 8
			//X 5 on top of 6
			//X 6 all clear
			//X 7 on top of 8 
			//X 8 all clear

			if(draw.indexOf(i) > -1){
				let firstSlice = Math.abs(-points[i].len/2 - offset) + 3;
				let secondSlice = Math.abs(points[i].len/2 - offset) + 3;
				s.fill(0.8*255, 0.8*255, 0, 0.5*255);
				s.arc(0, 0, firstSlice*2, firstSlice*2, -90, 90);
				s.arc(0, 0, secondSlice*2, secondSlice*2, 90, 270);
			}

			s.stroke(50);
			s.strokeWeight(3);
			s.rotate(commands.currentPositions[i]);

			s.line(0, -points[i].len/2 - offset, 0, points[i].len/2 - offset);
			s.pop();

		};

	};

	function detectFace(result){

		if(result[0]){
			if(!faceResult){
				faceResult = result[0].landmarks.positions;
			}
			else {
				// smoothed recording of facial landmarks
				for(let i = 0; i < result[0].landmarks.positions.length; i++){
					faceResult[i]._x = smoothVal(faceResult[i]._x, result[0].landmarks.positions[i]._x, 0.2);
					faceResult[i]._y = smoothVal(faceResult[i]._y, result[0].landmarks.positions[i]._y, 0.2);
				}
			}

			// add a bunch of bad vibe variables together for sad
			let sad = result[0].expressions.sad +
					  result[0].expressions.fearful +
					  result[0].expressions.angry +
					  result[0].expressions.disgusted;

			// smoothed recording of happy/neutral/sad expressions
			expressionValues[0] = smoothVal(expressionValues[0], result[0].expressions.happy, 0.2);
			expressionValues[1] = smoothVal(expressionValues[1], result[0].expressions.neutral, 0.2);
			expressionValues[2] = smoothVal(expressionValues[2], sad, 0.2);

			// pull the most likely expressions
			faceExpression = getTopExpression(expressionValues);

			// calculcate the two mouth angles to see if open
			mouthAngles[0] = 180 - calculateAngle(faceResult[51], faceResult[48]);
			mouthAngles[1] = calculateAngle(faceResult[51], faceResult[54]);

			if(mouthAngles[0] > 30 && mouthAngles[1] > 30){
				faceExpression = 'open';
			}

		}
		else {
			// if no face detected, set expression back to neutral
			faceExpression = 'neutral';
		}
	}

	// load face-api models
	function loadModels(){
	  Promise.all([
	  	faceapi.nets.tinyFaceDetector.load('../miscFiles/face-api-files/'),
	    faceapi.nets.faceLandmark68Net.load('../miscFiles/face-api-files/'),
	    faceapi.nets.faceExpressionNet.load('../miscFiles/face-api-files/')
	  ])
	  // noLoop() was called in setup, pausing draw() while we load, we resume here once models are loaded
	  .then(()=>{
	  	s.loop();
	  })
	}

	// generate new goals/speeds based on expressions
	function getNewCommands(expression, i){

		let newGoal;
		let newSpeed;

		// tight, fast wiggles if happy
		if(expression === 'happy'){

			commands.sadArcDirection[i] = 0;
			newSpeed = getRandomInt(7, 9);

			// if just arriving at happy, set a random wiggle
			if(commands.happyWiggleDirection[i] === 0){
				commands.wiggleAngle[i] = getRandomInt(15, 35);
				newGoal = getRandomInt(75, 105);
				commands.happyWiggleDirection[i] = Math.random() < 0.5 ? -1 : 1;
			}
			// otherwise, oscillate the wiggle angle
			else {
				newGoal = commands.currentPositions[i] + (commands.wiggleAngle[i] * commands.happyWiggleDirection[i]);
				commands.happyWiggleDirection[i] = -commands.happyWiggleDirection[i];
			}
		}
		// slow, big arcs if sad
		else if(expression === 'sad'){

			commands.happyWiggleDirection[i] = 0;
			newSpeed = getRandomInt(1, 2);
			
			// if just arriving at sad, set a random big arc
			if(commands.sadArcDirection[i] === 0){
				commands.wiggleAngle[i] = getRandomInt(150, 180);
				commands.sadArcDirection[i] = Math.random() < 0.5 ? -1 : 1;
				// pick an edge to start on based on which direction the first arc will go
				newGoal = commands.sadArcDirection[i] > 0 ? 
					getRandomInt(0, 180 - commands.wiggleAngle[i]) :
					getRandomInt(commands.wiggleAngle[i], 180);

			}
			// otherwise, oscillate the arc
			else {
				newGoal = commands.currentPositions[i] + (commands.wiggleAngle[i] * commands.sadArcDirection[i]);
				commands.sadArcDirection[i] = -commands.sadArcDirection[i];
			}

		}
		// if neutral, do default 
		else {
			commands.happyWiggleDirection[i] = 0;
			commands.sadArcDirection[i] = 0;
			newGoal = getRandomInt(20, 160);
			newSpeed = getRandomInt(3, 7);
		}

		commands.goalPositions[i] = newGoal;
		commands.speeds[i] = newSpeed;

	}

	// get top expression out of expressions array
	function getTopExpression(smoothedValues){

		let valuesArray = [
			{ expression: 'happy', value: smoothedValues[0] },
			{ expression: 'neutral', value: smoothedValues[1] },
			{ expression: 'sad', value: smoothedValues[2] }
		]

		let sortedArray = valuesArray.sort((a, b) => b.value - a.value);
		return sortedArray[0].expression;

	}

	// function to smooth value readings over time
	function smoothVal(oldVal, newVal, fade){
		return oldVal * fade + newVal * (1 - fade);
	}

	// generate a random integer given bounds
	function getRandomInt(min, max){
		// make it inclusive of max as well
		max = max + 1;
		return Math.floor(Math.random() * (max - min)) + min;
	}

	// map 1-9 speed values to actual increments
	function speedMap(speed){
		return s.map(speed, 1, 9, 0.6, 5.4);
	}

	// calculate angle between two points
	function calculateAngle(p1, p2){
		return Math.atan2(p2._y - p1._y, p2._x - p1._x) * 180 / Math.PI;
	}

};

// stitch together commands for serial communication
// this one is initialized outside of sketch
function stitchMessage(servos){
	let string = '';

	for(let i = 0; i < servos; i++){
		string += commands.goalPositions[i] + ',';
		string += commands.speeds[i];
		if(i !== (servos - 1)){
			string += ',';
		}
		else {
			string += '\n';
		}
	}
	return string;
}

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));