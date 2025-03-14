
/**
 * jsdelivrのdanoni_main.jsを取得するスクリプトサンプル
 *
 * - このファイルを danoni_main.js と差し替えて、
 *   ___version にバージョン名を格納することで jsdelivr のファイルを取りに行くようになります。
 * - ___version にはバージョン名 (x.y.z形式) を入れて下さい。
 */

// 適用するバージョン名
const __version = `40.5.2`;

// バージョン情報を取得してスクリプトタグを生成
const __script = document.createElement('script');
__script.src = `https://cdn.jsdelivr.net/npm/danoniplus@${__version}/js/danoni_main.min.js`;
document.head.appendChild(__script); // スクリプトをヘッダーに追加
console.log(`Loaded version: ${__version}`);
