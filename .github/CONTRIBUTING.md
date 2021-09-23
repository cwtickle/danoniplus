# How to Contribute / 要望・不具合報告について
## [Japanese]
要望・不具合報告がある場合、以下のいずれかの方法で行うことができます。

- リポジトリをForkして編集した後、Pull Requestを「cwtickle/danoniplus」の「develop」ブランチへ送る。
- 当リポジトリのIssueもしくは[Gitter](https://gitter.im/danonicw/community)に要望・不具合内容を報告する。  
※Gitterは「Twitterアカウント」を持っている方でも参加可能です。  
　Gitter内では、Github同様のmarkdownが使えます。お気軽にどうぞ！
- 要望・不具合内容をティックル宛([@cw_tickle](https://twitter.com/cw_tickle))へ直接連絡する。

## [English]
If you have a request or defect report, you can do it in one of the following ways.

- Fork and edit the repository, send Pull Request to "cwtickle / danoniplus" "develop" branch.
1. Fork it
1. Create your feature branch (git checkout -b my-new-feature)
1. Commit your changes (git commit -am 'Added some feature')
1. Push to the branch (git push origin my-new-feature)
1. Create new Pull Request to develop branch
- Report the request / problem contents to [Gitter](https://gitter.im/danonicw/community).  
※ Gitter can participate even if you have "Twitter account".  
　 In Gitter, you can use markdown similar to Github. Feel free to help yourself!
- Contact the tickle directly ([@cw_tickle](https://twitter.com/cw_tickle)) with the request / problem content.

# ソースのコーディングルール
細かい縛りは入れない予定ですが、コード作法の混在を防ぐため、必要なルールは決めていきます。  

## 変数・定数
定数・変数名はわかりやすく、名前で判断がつくように。  
forループを除き、danoni_main.js内は極力const/letで宣言する。  

|カテゴリ|命名ルール|
|----|----|
|定数|"C_(カテゴリ)_(名前)"の形式。全て英大文字、数字、アンダースコアのみを使用。|
|グローバルオブジェクト|変数の頭に"g_"をつける。<br>極力単独のグローバル変数を作成せず、既存カテゴリのオブジェクトのプロパティとして定義する。|
|関数の引数|アンダースコア始まりのキャメル表記。 例)_count, _folderName<br>デフォルト引数も検討する。<br>引数が増える場合は、(構造体)オブジェクトとして定義することを検討。|

## ソース構造
### [Japanese]
- 構造はシンプルに。画面別になるように区分けして書く。  
- 繰り返しが多いときは関数化を検討する。  
- コメントは処理単位ごとに簡潔に記述。ただの英訳は極力避ける。  
- 画面の見取りがわかるように詳細設定やロジックは別関数化し、実行内容を明確にする。  

### [English]
- The structure is simple. It divides and writes so that it may become another screen.
- Consider functionalization when there are many iterations.
- Comments are described briefly for each processing unit. Avoid plain English translation as much as possible.
- Make detailed settings and logic separate functions so that you can see screen sketches, and clarify the contents of execution.

## 画面の構成
- [タイトル]-[設定・オプション]-[キーコンフィグ]-[譜面読込]-[メイン]-[リザルト]  
- 各画面に Init がついたものが画面の基本構成(ルート)を表す。  

## スプライトの親子関係
- 基本的にdiv要素で管理。最下層を[difRoot]とし、createSprite()でdiv子要素を作成していく。  
- clearWindow()で[difRoot]以外の全てのスプライトを削除できる。  
- 特定のスプライトに限り削除する場合は deleteChildspriteAll() で実現。  

## インデント、改行
- タグ区切り、Java/ActionScript(K&Rスタイルの改版)
