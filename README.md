# Dancing☆Onigiri (CW Edition)

[![Maintainability](https://api.codeclimate.com/v1/badges/9558f21e17a47a4dc987/maintainability)](https://codeclimate.com/github/cwtickle/danoniplus/maintainability)
[![CodeQL](https://github.com/cwtickle/danoniplus/workflows/CodeQL/badge.svg)](https://github.com/cwtickle/danoniplus/actions?query=workflow%3ACodeQL)
[![GitLab Community](https://img.shields.io/gitlab/issues/open/cwtickle/danonicw?gitlab_url=https%3A%2F%2Fgitlab.com%2F&label=Community&logo=gitlab)](https://gitlab.com/cwtickle/danonicw/-/issues)  
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/cwtickle/danoniplus?sort=semver)](https://github.com/cwtickle/danoniplus/security/policy)
[![GitHub All Releases](https://img.shields.io/github/downloads/cwtickle/danoniplus/total?color=%23ff3399&label=downloads%20%28recently%29)](https://github.com/cwtickle/danoniplus/releases)
[![GitHub](https://img.shields.io/github/license/cwtickle/danoniplus)](https://github.com/cwtickle/danoniplus/blob/develop/LICENSE)  
![AboutDanOni](http://cw7.sakura.ne.jp/danoni/wiki/danonitop.png)
 
*Dancing Onigiri "CW Edition"* is a rhythm game. 
You can create original game data by combining a set of published sources with music files and sequences (text file). See the [wiki](https://github.com/cwtickle/danoniplus-docs/wiki) for details.

The source released here is the **HTML5 (HTML Living Standard) version** of the rhythm game *"Dancing Onigiri"* that was previously released as Flash.

Dancing☆Onigiri (CW Edition)は、ブラウザで動作するキーボードを使ったリズムゲームです。  
公開しているソース一式と、音楽ファイル・譜面データ(テキスト)を組み合わせることで  
オリジナルのゲームデータを作ることができます。詳細は[Wiki](https://github.com/cwtickle/danoniplus/wiki)をご覧ください。 

ここで公開しているソースは、以前Flashとして公開していたリズムゲーム  
「Dancing☆Onigiri」の **HTML5 (HTML Living Standard)** 版です。  
これまでのParaFla版に比べ、さまざまな機能強化を行っています。  

## Demo
- [Demo1](https://cw7.sakura.ne.jp/danoni/2013/0237_Cllema.html) クレマ / Kinoshita Tamaki  
- [Demo2](https://cw7.sakura.ne.jp/danoni/2017/0305_ShiningStar.html) シャイニングスター / MaouDamashii 
- [Demo3](https://cw7.sakura.ne.jp/danoni/2018/0315_PetitMagie.html) プチ・マギエ / Napi  

## How to Play / 遊び方
This is a rhythm game, using Keyboard on the website.   
There are many playstyles in the *Dancing Onigiri*. For example, 5keys, 7keys, 11keys, etc.  
The details are as follows.  
-> [How to Play](https://github.com/cwtickle/danoniplus-docs/wiki/AboutGameSystem)

リズムに合わせてやってくる矢印・フリーズアローを、ステップゾーン上で押すリズムゲームです。  
キーボードを使って遊びます。  
下記は7keyの例ですが、他にも5keyや11keyなど多様なプレイスタイルがあります。  

詳細は下記をご覧ください。  
-> [How to Play](https://github.com/cwtickle/danoniplus/wiki/AboutGameSystem)

![HowtoPlay](http://cw7.sakura.ne.jp/danoni/wiki/howtoplay1.png)  
(The image is under development. / 画像は開発中のものです）

### Rule / ゲームのルール
When you press the keyboard with good timing *:D Perfect!!* *:) O.K.* and life will go up.
On the other hand, if you remove the timing *:( Bad*, *:_( Miss*, *:( N.G.* will be, life falls.
If the life of the life gauge remains by the end of the game or it is over the quota, the game is cleared.

タイミング良くキーボードを押すと(・∀・)ｲｲ!!や(ﾟ∀ﾟ)ｷﾀｰ!!となり、ライフが上がります。  
一方、タイミングを外すと(´・ω・\`)ｼｮﾎﾞｰﾝ、(\`Д´)ｳﾜｧﾝ、(・A・)ｲｸﾅｲとなり、ライフが下がります。  
ゲーム終了までにライフゲージのライフが残っているか、ノルマ以上であればゲームクリアです。  

## Works / 公開作品
- [Dancing☆Onigiri 難易度表 for.js](http://dodl4.g3.xrea.com/) 
- [多鍵データベース](http://apoi108.sakura.ne.jp/danoni/ta/index.php)
- [Dancing☆Onigiri サイト一覧](https://cw7.sakura.ne.jp/danonidb/)  
- [Dancing☆Onigiri 作品一覧](https://cw7.sakura.ne.jp/lst/)  

## How to Make / 作り方
- [How to make chart overview](https://github.com/cwtickle/danoniplus-docs/wiki/HowtoMake) / [譜面の作成概要](https://github.com/cwtickle/danoniplus/wiki/HowtoMake)
- [ParaFla!ソース利用者向け移行方法 (Japanese Only)](https://github.com/cwtickle/danoniplus/wiki/forParaFlaUser)

### How to Install / 導入方法
- Download from [Changelog](https://github.com/cwtickle/danoniplus-docs/wiki/Changelog-latest). You can also install from npm.
    - [Releases](https://github.com/cwtickle/danoniplus/releases)からダウンロードします。npmからの導入も可能です。
```
npm i danoniplus
```
- When directly specifying the version name, specify the version after @ as shown below.
    - バージョン名を直接指定するときは下記のように @以降をバージョン指定します。
```
npm i danoniplus@26.1.2
```

## System requirements / 動作環境
- Windows, Mac OS, Linux, Android, iPad OS
- Google Chrome, Microsoft Edge, Opera, Vivaldi, Safari (WebKit), Firefox (Gecko) 

## Difference from Flash Version / Flash版との差異 (Japanese Only)
*Dancing Onigiri "CW Edition"* basically conforms to the specifications of *ParaFla!* Version, but the details are different from the conventional ones. See below for details.

Dancing☆Onigiri (CW Edition)では基本的にParaFla!版の仕様に準拠していますが、  
細かい点が従来と異なります。詳細は下記をご覧ください。  
- [Difference from Flash Version / Flash版との差異 (Japanese)](https://github.com/cwtickle/danoniplus/wiki/DifferenceFromFlashVer)  

## How to Contribute / 開発者の方へ  
If you would like to cooperate with the development, please see below. Even if you don't have a GitHub account, you can cooperate!

開発にご協力いただける方は、下記をご覧ください。GitHubアカウントの無い方でも協力できます！  
- [How to Contribute / 貢献の仕方](https://github.com/cwtickle/danoniplus/blob/develop/.github/CONTRIBUTING.md)   
- [GitLab community for requests and bug reports / 要望・不具合報告(GitLab Issues)](https://gitlab.com/cwtickle/danonicw/-/issues)
- [Contributors / コントリビューター](https://github.com/cwtickle/danoniplus/blob/develop/CONTRIBUTORS.md)

## Community / コミュニティ
- [Dancing☆Onigiri Discord server](https://discord.gg/TegbHFY7zg)
- [Gitter for score reporting / 得点報告(Gitter)](https://app.gitter.im/#/room/#danonicw_freeboard:gitter.im)
- [Twitter #danoni](https://twitter.com/search?q=%23danoni&src=typed_query&f=live)

## Related Tools Repository / 関連リポジトリ・ツール
### Dancing☆Onigiri
- [Dancing☆Onigiri エディター(CW Edition 対応)](https://github.com/superkuppabros/danoni-editor) @superkuppabros
- [ダンおに曲データjs化ツール](https://github.com/suzme/danoni-base64) @suzme
- [ダンおに矢印色ツール](https://github.com/suzme/danoni-colorpicker) @suzme
- [Dancing☆Onigiri Chart Reverser](https://github.com/cwtickle/danoniplus-reverser) @cwtickle
- [Dancing☆Onigiri Chart Converter](https://github.com/cwtickle/danoniplus-converter) @cwtickle
- [ダンおにゲージ計算機 (Gauge Calculator)](http://www.omission0.com/other/gauge_calculator/) @goe0

### Kirizma / キリズマ
- [キリズマ譜面データ変換機](https://github.com/suzme/kirizma-converter) @suzme
- [キリズマ歌詞表示作成ツール](https://github.com/prlg25/kirizma_lyric) @prlg25
- [キリズマ難易度表](https://github.com/suzme/kirizma) @suzme

### Punching◇Panels
- [Punching◇Panels](https://github.com/cwtickle/punching-panels) @cwtickle
- [Punching◇Panels エディター](https://github.com/suzme/punpane-editor) @suzme
- [Punching◇Panels 難易度表](https://github.com/suzme/punpane) @suzme

## License / ライセンス
This software is released under the MIT License, see LICENSE.  
