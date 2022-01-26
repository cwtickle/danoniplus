# Dancing☆Onigiri (CW Edition)

[![Maintainability](https://api.codeclimate.com/v1/badges/9558f21e17a47a4dc987/maintainability)](https://codeclimate.com/github/cwtickle/danoniplus/maintainability)
[![CodeQL](https://github.com/cwtickle/danoniplus/workflows/CodeQL/badge.svg)](https://github.com/cwtickle/danoniplus/actions?query=workflow%3ACodeQL)
[![Join the chat at https://gitter.im/danonicw/community](https://badges.gitter.im/danonicw/community.svg)](https://gitter.im/danonicw/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)  
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/cwtickle/danoniplus?sort=semver)](https://github.com/cwtickle/danoniplus/security/policy)
[![GitHub All Releases](https://img.shields.io/github/downloads/cwtickle/danoniplus/total?color=%23ff3399&label=downloads%20%28recently%29)](https://github.com/cwtickle/danoniplus/releases)
[![GitHub](https://img.shields.io/github/license/cwtickle/danoniplus)](https://github.com/cwtickle/danoniplus/blob/develop/LICENSE)  
![AboutDanOni](http://cw7.sakura.ne.jp/danoni/wiki/danonitop.png)

Dancing☆Onigiri (CW Edition)は、ブラウザで動作するキーボードを使ったリズムゲームです。  
公開しているソース一式と、音楽ファイル・譜面データ(テキスト)を組み合わせることで  
オリジナルのゲームデータを作ることができます。詳細は[Wiki](https://github.com/cwtickle/danoniplus/wiki)をご覧ください。  
*Dancing Onigiri "CW Edition"* is a rhythm game. 
You can create original game data by combining a set of published sources with music files and sequences (text file). See the [wiki](../../wiki/Sidebar-En) for details.

ここで公開しているソースは、以前Flashとして公開していたリズムゲーム  
「Dancing☆Onigiri」の **HTML5 (HTML Living Standard)** 版です。  
これまでのParaFla版に比べ、さまざまな機能強化を行っています。  
The source released here is the **HTML5 (HTML Living Standard) version** of the rhythm game *"Dancing Onigiri"* that was previously released as Flash.
Compared to the previous ParaFla version, we have made various enhancements.

## Demo
- [Demo1](http://cw7.sakura.ne.jp/danoni/2013/0237_Cllema.html) クレマ / 木下たまき  
- [Demo2](http://cw7.sakura.ne.jp/danoni/2017/0305_ShiningStar.html) シャイニングスター / 魔王魂  
- [Demo3](http://cw7.sakura.ne.jp/danoni/2018/0315_PetitMagie.html) プチ・マギエ / Napi  

## How to Play / 遊び方
リズムに合わせてやってくる矢印・フリーズアローを、ステップゾーン上で押すリズムゲームです。  
キーボードを使って遊びます。  
This is a rhythm game, using Keyboard on the website.   
下記は7keyの例ですが、他にも5keyや11keyなど多様なプレイスタイルがあります。  
There are many playstyles in the *Dancing Onigiri*. For example, 5keys, 7keys, 11keys, etc.

詳細は下記をご覧ください。(The details are as follows.)  
-> [How to Play](../../wiki/AboutGameSystem)

![HowtoPlay](http://cw7.sakura.ne.jp/danoni/wiki/howtoplay1.png)  
(画像は開発中のものです）

### Rule / ゲームのルール
タイミング良くキーボードを押すと(・∀・)ｲｲ!!や(ﾟ∀ﾟ)ｷﾀｰ!!となり、ライフが上がります。  
一方、タイミングを外すと(´・ω・\`)ｼｮﾎﾞｰﾝ、(\`Д´)ｳﾜｧﾝ、(・A・)ｲｸﾅｲとなり、ライフが下がります。  
ゲーム終了までにライフゲージのライフが残っているか、ノルマ以上であればゲームクリアです。  
When you press the keyboard with good timing *:D Perfect!!* *:) O.K.* and life will go up.
On the other hand, if you remove the timing *:( Bad*, *:_( Miss*, *:( N.G.* will be, life falls.
If the life of the life gauge remains by the end of the game or it is over the quota, the game is cleared.

## Works / 公開作品
- [Dancing☆Onigiri 難易度表 for.js](http://dodl4.g3.xrea.com/) 
- [多鍵データベース](http://apoi108.sakura.ne.jp/danoni/ta/index.php)
- [Dancing☆Onigiri サイト一覧](https://cw7.sakura.ne.jp/danonidb/)  
- [Dancing☆Onigiri 作品一覧](https://cw7.sakura.ne.jp/lst/)  

## How to Make / 作り方
- [譜面の作成概要](https://github.com/cwtickle/danoniplus/wiki/HowToMake)
- [ParaFla!ソース利用者向け移行方法](https://github.com/cwtickle/danoniplus/wiki/forParaFlaUser)

## System requirements / 動作環境
ブラウザで動作します。(Using browser.)  
- Google Chrome, Opera, Vivaldi (WebKit), Firefox (Gecko)※  
※Firefoxの場合、環境により動作が安定しない場合があります。  

## Difference from Flash Version / Flash版との差異について
Dancing☆Onigiri (CW Edition)では基本的にParaFla!版の仕様に準拠していますが、  
細かい点が従来と異なります。詳細は下記をご覧ください。  
*Dancing Onigiri "CW Edition"* basically conforms to the specifications of *ParaFla!* Version,
but the details are different from the conventional ones. See below for details.
- [Flash版との差異](https://github.com/cwtickle/danoniplus/wiki/DifferenceFromFlashVer)  

## How to Contribute / 開発者の方へ 
開発にご協力いただける方は、下記をご覧ください。GitHubアカウントの無い方でも協力できます！  
If you would like to cooperate with the development, please see below. Even if you don't have a GitHub account, you can cooperate!
- [貢献の仕方 / How to Contribute](.github/CONTRIBUTING.md)   
- [要望・不具合報告用Gitter](https://gitter.im/danonicw/community)
- [コントリビューター / Contributors](CONTRIBUTORS.md)

## Community / コミュニティ
- [Dancing☆Onigiri Discordサーバー](https://discord.gg/TegbHFY7zg)
- [得点報告用Gitter](https://gitter.im/danonicw/freeboard)
- [Twitter #danoni](https://twitter.com/search?q=%23danoni%20OR%20%22%E3%83%80%E3%83%B3%E3%81%8A%E3%81%AB%E3%81%A3%E3%81%9F%E3%83%BC%22&src=typed_query&f=live)

## Related Tools Repository / 関連ツール
- [Dancing☆Onigiri エディター(CW Edition 対応)](https://github.com/superkuppabros/danoni-editor) @superkuppabros
- [ダンおに曲データjs化ツール](https://github.com/suzme/danoni-base64) @suzme
- [ダンおに矢印色ツール](https://github.com/suzme/danoni-colorpicker) @suzme
- [Dancing☆Onigiri Chart Reverser](https://github.com/cwtickle/danoniplus-reverser)
- [Dancing☆Onigiri Chart Converter](https://github.com/cwtickle/danoniplus-converter)
- [ダンおにゲージ計算機 (Gauge Calculator)](http://www.omission0.com/other/gauge_calculator/) @goe0
- [キリズマ譜面データ変換機](https://github.com/suzme/kirizma-converter) @suzme

## License / ライセンス
This software is released under the MIT License, see LICENSE.  
