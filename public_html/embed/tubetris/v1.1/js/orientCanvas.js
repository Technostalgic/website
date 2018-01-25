var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

function expandCanvas(ratio){
	//param: ratio - 
	//expands the canvas to fit the whole screen of the browser/iframe
	//without stretching or distorting it at all
	if(screenWidth / screenHeight > ratio){
		//squish vertically
		canvas.height = screenHeight;
		canvas_resizeWidth(ratio);
	}
	else{
		//squish horizontally
		canvas.width = screenWidth;
		canvas_resizeHeight(ratio);
	}
	
	//adjust global variables to new canvas size
	width = canvas.width;
	height = canvas.height;
	adjustment = {
		x: canvas.width / dwidth,
		y: canvas.height / dheight
	};
	canvas.height = screenHeight;
	disableImageSmoothing();
}
function canvas_resizeWidth(ratio){
	canvas.width = canvas.height * ratio;
}
function canvas_resizeHeight(ratio){
	canvas.height = canvas.width / ratio;
}

expandCanvas(aspectratio);