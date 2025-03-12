
/**
 * jsdelivrのdanoni_main.jsを取得するスクリプトサンプル
 *
 * - このファイルを danoni_main.js と差し替えて、
 *   jsフォルダに「version.txt」を格納することで jsdelivr のファイルを取りに行くようになります。
 * - version.txt にはバージョン名 (x.y.z形式) を入れて下さい。
 * - カレントパス指定には対応していないので、version.txtのパスは必要に応じて変えてください。
 */

// バージョン情報を取得してスクリプトタグを生成
const randTime = Date.now();
fetch(`../js/version.txt?${randTime}`)
  .then(response => response.text())
  .then(version => {
    const script = document.createElement('script');
    script.src = `https://cdn.jsdelivr.net/npm/danoniplus@${version}/js/danoni_main.min.js`;
    document.head.appendChild(script); // スクリプトをヘッダーに追加
    console.log(`Loaded version: ${version}`);
  })
  .catch(error => {
    console.error('Failed to load version:', error);
  });
