
class metaData{
	constructor(title = "default", description = "default description", thumb = null, thumbAnim = null){
		this.title = title;
		this.description = description;
		if(thumb){
			this.thumb = new Image();
			this.thumb.src = thumb;
		}
		if(thumbAnim){
			this.thumbAnim = new Image();
			this.thumbAnim.src = thumbAnim;
		}
	}
}

///ex:
//<li><div class="gamePreview">
//	<div class="gamePreview_thumbContainer">
//		<img class="gamePreview_thumb" src="./index_resources/tubetris_thumb.png">
//		<img class="gamePreview_thumbAnim" src="./index_resources/tubetris_thumbAnim.gif">
//	</div>
//	<div class="gamePreview_controlContainer">
//		<div class="gamePreview_controlPlay">&#9658;</div>
//		<div class="gamePreview_controlSettings">&#9881;</div>
//		<div class="gamePreview_controlFavorite">&#9733;</div>
//	</div>
//	<span class="gamePreview_title">Tubetris</span>
//	<span id="technostalgic_Tubetris_highScore" class="gamePreview_highScore">High Score: N/A <hr /></span>
//	<span class="gamePreview_description">
//		A Tetris remix that borrows gameplay elements inspired from the game 'Pipe Dream';
//		two classics mashed together to create an entirely new experience.
//	</span>
//</div></li>