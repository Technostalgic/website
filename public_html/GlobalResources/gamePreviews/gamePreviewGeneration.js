
class gpMetaData{
	constructor(title = "default", description = "default description", keys = null, thumb = null, thumbAnim = null){
		this.title = title;
		this.description = description;
		if(keys) this.keys = keys;
		if(thumb) this.createThumb(thumb);
		else this.createThumb("default.gif");
		if(thumbAnim) this.createThumbAnim(thumbAnim);
		else this.createThumbAnim();
	}
	
	createThumb(src){
		this.thumb = new Image();
		this.thumb.classList.add("gamePreview_thumb");
		var path = getRelativeHomePath() + "GlobalResources/gamePreviews/thumbnails/";
		this.thumb.src = path + src;
	}
	createThumbAnim(src){
		this.thumbAnim = new Image();
		this.thumbAnim.classList.add("gamePreview_thumbAnim");
		if(src){
			var path = getRelativeHomePath() + "GlobalResources/gamePreviews/thumbnails/";
			this.thumbAnim.src = path + src;
		}
		else this.thumbAnim.src = this.thumb.src;
	}
	
	createElement(){
		var r = document.createElement("div");
		r.classList.add("gamePreview");
		
		var gpThumbContainer = document.createElement("div");
		gpThumbContainer.classList.add("gamePreview_thumbContainer");
		if(this.thumb) gpThumbContainer.append(this.thumb);
		if(this.thumbAnim) gpThumbContainer.append(this.thumbAnim);
		r.append(gpThumbContainer);
		
		var gpControlContainer = document.createElement("div");
		gpControlContainer.classList.add("gamePreview_controlContainer");
		gpControlContainer.innerHTML = '\
			<div class="gamePreview_controlPlay">&#9658;</div>\
			<div class="gamePreview_controlSettings">&#9881;</div>\
			<div class="gamePreview_controlFavorite">&#9733;</div>';
		r.append(gpControlContainer);
		
		var gpTitle = document.createElement("span");
		gpTitle.classList.add("gamePreview_title");
		gpTitle.innerHTML = this.title;
		r.append(gpTitle);
		
		if(this.keys.highScoreKey){
			var gpHiScore = document.createElement("span");
			gpHiScore.id = this.keys.highScoreKey;
			gpHiScore.classList.add("gamePreview_highScore");
			gpHiScore.innerHTML = "High Score: ";
			r.append(gpHiScore);
		}
		
		r.append(document.createElement("hr"));
		
		var gpDescription = document.createElement("span");
		gpDescription.classList.add("gamePreview_description");
		gpDescription.innerHTML = this.description;
		r.append(gpDescription);
		
		return r;
	}
	
	static fromString(str){
		var data = str.split('\n');
		var r = new gpMetaData();
		var keys = {};
		
		for(var i = 0; i < data.length; i++){
			var spldat = data[i].split('=');
			switch(spldat[0]){
				case "title": r.title = spldat[1]; break;
				case "highScoreKey": keys.highScoreKey = spldat[1]; break;
				case "controlsKey": keys.controlsKey = spldat[1]; break;
				case "configKey": keys.configKey = spldat[1]; break;
				case "description": r.description = spldat[1]; break;
				case "thumb": r.createThumb(spldat[1]); break;
				case "thumbAnim": r.createThumbAnim(spldat[1]); break;
			}
		}
		r.keys = keys;
		
		return r;
	}
	static loadGamePreviewFromSource(src, callback){
		var path = getRelativeHomePath() + "GlobalResources/gamePreviews/metadata/";
		
		var report =
		$.ajax({
			url: path + src + ".ini",
			async: true,
			success: !!callback ? callback : function(data){this.element = gpMetaData.fromString(data);}
		}).status;
		if(report == 404){
			callback("");
		}
	}
}

function getRelativeHomePath(){
	var src = document.baseURI;
	var ups = "";
	var splURI = src.split('/');
	for(var i = splURI.length - 1; i >= 0; i--){
		if(splURI[i] == "public_html") break;
		ups += ".";
	}
	return ups + "/";
}
function loadAllGamePreviews(){
	var loaders = document.getElementsByClassName("loadGamePreview");
	for(var i = 0; i < loaders.length; i++){
		loaders[i].innerHTML = "";
		var mdFileName = "gpMeta_" + loaders[i].id.split('_')[1];
		var loadFunc = function(data){
			loaders[i].append(gpMetaData.fromString(data).createElement());
		}
		gpMetaData.loadGamePreviewFromSource(mdFileName, loadFunc);
	}
}

window.addEventListener("load", loadAllGamePreviews);