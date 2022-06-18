var d3 = require("d3-selection");
var scale = require("d3-scale");

let text = "Itwasafterdinner.Youweretalkingtomeacrossthetableaboutsomethingorother,agreyhoundyouhadseenthatdayorasongyouliked,andIwaslookingpastyouoveryourbareshoulderatthethreeorangeslyingonthekitchencounternexttothesmallelectricbeangrinder,whichwasalsoorange,andtheorangeandwhitecruetsforvinegarandoil.Allofwhichconvergedintoarandomstilllife,sofastenedtogetherbythehaspofcolor,andsofixedbehindtheanimatedforegroundofyourtalkingandsmiling,gesturingandpouringwine,andthecamberofyourshouldersthatIcouldfeelitbeingpaintedwithinme,brushedonthewallofmyskull,whilethetoneofyourvoiceliftedandfellinitsflight,andthethreeorangesremainedfixedonthecounterthewaystarsaresaidtobefixedintheuniverse.Thenallthemomentsofthepastbegantolineupbehindthatmomentandallthemomentstocomeassembledinfrontofitinalongrow,givingmereasontobelievethatthiswasamomentIhadrescuedfromthemillionsthatrushoutofsightintoadarknessbehindtheeyes.EvenafterIhaveforgottenwhatyearitis,mymiddlename,andthemeaningofmoney,Iwillstillcarryinmypocketthesmallcoinofthatmoment,mintedinthekingdomthatwepacethrougheveryday.PoemByBillyCollins1998"

let fontSize = 20;
let charWidth = fontSize * 0.5;
let lineHeight = fontSize * 0.75;
let width = Math.round(fontSize/30*602);
let height = Math.round(fontSize/30*610);
let cols = 40;
let rows = Math.ceil(text.length/cols);
let avgLum;

let canvas = d3.select('#canvas').append('canvas')
	.attr('width', width)
	.attr('height', height);

let context = canvas.node().getContext('2d');
drawImage();


function drawImage() {

  // draw the image in Canvas
  base_image = new Image();
  base_image.src = 'images/brooke2.jpg';
  base_image.onload = function(){
  	let scaleX = width/base_image.width;
  	let scaleY = height/base_image.height;
    context.drawImage(base_image, 0, 0, base_image.width * scaleX, base_image.height * scaleY);

	// create an array of arrays to store our lum values
	let charValues = [];
	for(let i = 0; i<cols*rows; i++){
		let newArray = [];
		charValues.push(newArray);
	}

    // get image data
	let imgData = context.getImageData(0, 0, width, height);
	let data = imgData.data;

	// loop through the pixels
	for(let i = 0; i < data.length; i+=4){

		let r = data[i];
		let g = data[i+1];
		let b = data[i+2];

		// calculate perceived lum
		let lum = 0.299*r + 0.587*g + 0.114*b;

		// assign the pixel to a poem character by 
		// pretending the chars are a grid of rectangles
		let pixel = i/4;
		let x = pixel % width;
		let y = Math.floor(pixel/width);

		let gridX = Math.floor(x/width*cols);
		let gridY = Math.floor(y/height*rows);
		let poemChar = gridY * cols + gridX;

		charValues[poemChar].push(lum);
	}

	// find the average lum per character;
	avgLum = charValues.map(function(pixelArray){
		return pixelArray.reduce((a, b) => a + b) / pixelArray.length;
	});

	drawPoem('#poem1', 2.2);
	//drawPoem('#poem2', 2.5);
  }
}

function drawPoem(sel, pow){

	let xPos = 0;
	let yPos = -5;

	// after playing around with it with some side-by-sides
	// I got a sharper image from having lum be non-linear
	avgLum = avgLum.map(lum => Math.pow(lum, pow));

	let lumMin = Math.min(...avgLum);
	let lumMax = Math.max(...avgLum)

	let poem = d3.select(sel)
		.style('width', `${width}px`)
		.style('height', `${height}px`);

	let weightScale = scale.scaleLinear()
		.domain([lumMin, lumMax])
		.range([200, 900]);

	let opacityScale = scale.scaleLinear()
		.domain([lumMin, lumMax])
		.range([0.2, 1]);

	// draw each character as an
	// absoutely positioned div
	for(let i = 0; i < text.length; i++){

	  let div = poem.append('div').html(text.charAt(i))
	  	.style('font-size', `${fontSize}px`)
	 		.style('left', `${xPos}px`)
	  	.style('top', `${yPos}px`)
	  	.style('font-weight', weightScale(avgLum[i]))
	  	.style('opacity', opacityScale(avgLum[i]));

	  // increment x and y pos of next character
	  if((i + 1) % cols == 0){
	    xPos = 0;
	    yPos = yPos + lineHeight;
	  }
	  else {
	    xPos += charWidth;
	  }
	}
}