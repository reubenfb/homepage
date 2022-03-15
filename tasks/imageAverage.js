#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');

function cropImages() {
	fs.readdir('us_cropped/input', (err, files)=>{

		files.forEach(img=>{
			let finalName = img.replace('.jpg', '.png');
			sharp(`us_cropped/input/${img}`)
			  .resize({
			  	width: 1200,
			  	height: 750,
			  	fit: 'contain',
			  	background: { r: 255, g: 255, b: 255}
			  })
			  .toFile(`us_cropped/output/${finalName}`, err=>{})
		});
	});
};

function averageImages(){

	let imageData = [];
	for(let i = 0; i < 1200*750; i++){
		imageData.push({'r': 0, 'g': 0, 'b': 0});
	}

	fs.readdir('us_cropped/output/', (err, files)=>{

		files = files.filter(file => file.includes('.png'));

		files.forEach((img,i)=>{
			sharp(`us_cropped/output/${img}`)
			.raw()
			.toBuffer({resolveWithObject: true})
			.then(buffer => {
				let adder = buffer.data.length == 2700000 ? 3 : 4;
				for(let j = 0; j<1200*750*adder; j+=adder){
					imageData[j/adder].r += buffer.data[j];
					imageData[j/adder].g += buffer.data[j+1];
					imageData[j/adder].b += buffer.data[j+2];
				}
			})
			.catch((err) => console.error(img, err))
			.then(()=>{

				let imageBuffer = [];

				if(i == files.length - 1){
					imageData.forEach(pixel=>{
						imageBuffer.push(Math.round(pixel.r/files.length))
						imageBuffer.push(Math.round(pixel.g/files.length))
						imageBuffer.push(Math.round(pixel.b/files.length))
					});

					imageBuffer = Buffer.from(imageBuffer);

					const image = sharp(imageBuffer, {
					  raw: {
					    width: 1200,
					    height: 750,
					    channels: 3
					  }
					}).toFile('public/images/choroplethAvg.png');

				}
			})
		})
	})
}

cropImages();
averageImages();