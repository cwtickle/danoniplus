'use strict';
/**
 * Dancing☆Onigiri カスタム用jsファイル
 * 
 * このファイルは、作品個別に設定できる項目となっています。
 * 譜面データ側で下記のように作品別の外部jsファイルを指定することで、
 * danoni_main.js の中身を変えることなく設定が可能です。
 * 
 * 設定例：
 * |customjs=danoni_custom-003.js|
 * 
 * ・グローバル変数、div要素、関数は danoni_main.js のものがそのまま利用できます。
 * ・danoni_main.jsの変数を直接書き換えると、動かなくなることがあります。
 * 　こまめのバックアップをおススメします。
 * ・ラベルなどのdiv要素を作る場合、「divRoot」の下にappendChild（div要素を追加）することで
 * 　画面遷移したときにきれいに消してくれます。
 */


/**
 * タイトル画面
 */
function customTitleInit(){

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0,0,0,g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle=grd;
	l0ctx.fillRect(0,0,g_sWidth,g_sHeight);

	
	// 背景の矢印オブジェクトを表示
	var lblArrow = createArrowEffect("lblArrow", g_headerObj["setColor"][0], (g_sWidth-500)/2, -15, 500, 180);
	lblArrow.style.opacity = 0.25;
	lblArrow.style.zIndex = 0;
	divRoot.appendChild(lblArrow);

	// 曲名文字描画（曲名は譜面データから取得）
	// TEST:試験的に矢印色の1番目と3番目を使ってタイトルをグラデーション
	var grd = l1ctx.createLinearGradient(0,0,g_sHeight,0);
	if(g_headerObj["setColor"][0]!=undefined){
		grd.addColorStop(0, g_headerObj["setColor"][0]);
	}else{
		grd.addColorStop(0, "#ffffff");
	}
	if(g_headerObj["setColor"][2]!=undefined){
		grd.addColorStop(1, g_headerObj["setColor"][2]);
	}else{
		grd.addColorStop(1, "#66ffff");
	}
	var titlefontsize = 64 * (12 / g_headerObj["musicTitle"].length);
	if(titlefontsize >= 64){
		titlefontsize = 64;
	}
	createLabel(l1ctx, g_headerObj["musicTitle"], g_sWidth/2, g_sHeight/2, 
		titlefontsize, "メイリオ", grd, "center");
}

/**
 * オプション画面(初期表示)
 */
function customOptionInit(){
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0,0,0,g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle=grd;
	l0ctx.fillRect(0,0,g_sWidth,g_sHeight);

}

/**
 * キーコンフィグ画面(初期表示)
 */
function customKeyConfigInit(){
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0,0,0,g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle=grd;
	l0ctx.fillRect(0,0,g_sWidth,g_sHeight);

}

/**
 * メイン画面(初期表示)
 */
function customMainInit(){
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0,0,0,g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle=grd;
	l0ctx.fillRect(0,0,g_sWidth,g_sHeight);

	// ここにカスタム処理を記述する
	
}

/**
 * メイン画面(フレーム毎表示)
 */
function customMainEnterFrame(){
	
}

/**
 * 結果画面(初期表示)
 */
function customResultInit(){
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	
	
}