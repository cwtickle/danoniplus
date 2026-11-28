# Release Notes の箇条書き生成プロンプト

`render-release-notes.mjs` の `--bullets` に渡す `release-bullets.json` を作るための指示です。
これは任意の工程です。使わない場合は PR 見出しがそのまま箇条書きになります。

## 役割
あなたは OSS『danoniplus』のリリースエンジニアです。`release-facts.json` の `items` を読み、
Release Notes の箇条書きの文言だけを整えた JSON を出力してください。

## 入力
`release-facts.json` の `items[]`。各項目は次のキーを持ちます。
- `id`: 項目の識別子 (例: `2333-1`)
- `category`: `new` / `improvements` / `bugfix` / `chores` / `unknown`
- `title`: PR の見出しから種別の接頭辞を除いた文言
- `body`: PR 本文の該当部分 (補足の根拠として読む。出力には書き写さない)

## ルール
1. 文言は `title` をベースにする。完全な原文コピーでなくてよく、簡潔・具体的になるよう軽く言い換えてよい。
2. 次の事実は書かない: `title` / `body` に無い推測、原因・影響範囲の断定、効果の誇張。
3. 同一の観点・関心事に属する項目は 1 行に統合する (`items` に複数の id を並べる)。
   観点が異なる項目は、同じ PR・同じ機能に関連していても別の行に分ける。**迷ったら統合しない。**
4. 統合してよいのは同じ `category` の項目だけ。`category` は変更しない。`unknown` の項目は出力に含めない (人が分類する)。
5. 文体は既存の Release Notes に合わせる: 「〜するよう変更」「〜を追加」「〜の問題を修正」「〜を作成」「〜に更新」。
   関数名・変数名・設定名はそのまま書く。文末に句点は付けない。
6. PR 番号 (`( PR #… )`) と Remarks は出力しない。スクリプトが付与・転記する。
7. 言い換える必要が無い項目は出力に含めなくてよい (既定で `title` が使われる)。

## 出力
JSON の配列のみを出力する (前置き・説明・コードフェンスは不要)。

```json
[
  { "category": "improvements", "text": "リングノートのみの譜面の場合、関係しない設定を無効化するよう変更", "items": ["2333-1"] },
  { "category": "chores", "text": "リリースPR作成用の GitHub Actions を作成", "items": ["2331-1", "2332-1"] }
]
```

- `category`: 項目の `category` と同じ値
- `text`: 箇条書きの文言
- `items`: この行にまとめる項目の `id` (1 つ以上)
- `remarksTitle` (任意): 統合した行の Remarks 見出し。省略時は `text`