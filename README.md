# Dancing☆Onigiri(for HTML5)

リズムゲームDancing☆Onigiri(for HTML5)のソース作成場所です。
Flash版の同ゲームのHTML5版を制作しています。

## サンプル (sample - under construction)
[sample1]  
[sample2]  
[sample3]  

[sample1]:http://cw7.sakura.ne.jp/work/danonijs/test/danoni1.html "sample1"  
[sample2]:http://cw7.sakura.ne.jp/work/danonijs/test/danoni2.html "sample2"  
[sample3]:http://cw7.sakura.ne.jp/work/danonijs/test/danoni3.html "sample3"  

## Flash版との差異について
[Flash版との差異]:http://cw7.sakura.ne.jp/work/danonijs/test/danoni_flash_vs_html5.html "Flash版との差異"  

## 簡単な作り方 (how-to-make)　※作成中
以下の階層になるようにフォルダを準備します。

[root]

　├ [img]　←　画像一式
 
  ├ [js]
  
  |   ・danoni_main.js　←　メインソース
  
  |   ・danoni_custom.js　←　作品別の設定(デフォルトはdanoni_custom.jsが呼ばれる)
  
  ├ [css]
  
  └ [danoni]
  
      ・work1.html　←　作品ごとにhtmlを分ける(同じレベルならフォルダで分けても良い)
      
      ・work2.html

Dan☆Oniで使用されているエディターを利用し、譜面を作成します。

譜面はサンプルのページにある下記の部分を置き換えてください。

<input type="hidden" name="dos" id="dos" value='ここに譜面データを入れる'>

