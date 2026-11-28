# リリース手順 (最新版 / サポート版)

GitHub Actions の `R*` から始まる workflow が、リリース作業の一式です。
Actions 画面の左の一覧は名前順に並ぶため、**番号の順がそのままリリース作業の流れ**になります。

- **[manual]** … 人が「Run workflow」を押す
- **[auto]** … 条件を満たすと自動で動く (押す必要なし)
- **最新版** … `develop` → `master` のリリース (`vXX.Y.Z`、最新メジャー)
- **サポート版** … `support/vXX` ブランチへのリリース

## 1. workflow 一覧

| 番号 | 名前 | 起動 | 最新版 | サポート版 | 何をするか |
| :-- | :-- | :-- | :--: | :--: | :-- |
| R01 | Prepare release<br>(`prepare-release.yml`) | **[manual]** | ○ | ○ | バージョンを更新する。最新版は develop へコミットしてリリース PR を作成。サポート版は support/vXX へコミットし、そのままタグを付ける |
| R02 | Check release version<br>(`check-release-version.yml`) | **[auto]** リリース PR の作成・更新時 | ○ | − | package.json / danoni_main.js / SECURITY.md のバージョン整合を検査する |
| R03 | Post release<br>(`post-release.yml`) | **[auto]** リリース PR のマージ時 | ○ | − | develop へ逆マージし、master にタグを付ける |
| R04 | Publish Package<br>(`publish-to-npm.yml`) | **[auto]** タグ作成時 | ○ | ○ | npm へ公開する (過去バージョンは `legacy` タグ) |
| R05 | Release assets (draft)<br>(`release-assets.yml`) | **[auto]** タグ作成時 / 再実行は **[manual]** | ○ | ○ | Assets を生成・検証し、**ドラフト**の Release を作る。最新版は Release Notes 本文も自動で書き込む |
| R06 | Release facts<br>(`release-facts.yml`) | **[manual]** | 再実行時のみ | ○ (必須) | Release Notes の下書きを作り直す。サポート版は取り込む PR を指定して本文を作る |
| R07 | Sync related releases<br>(`sync-related-releases.yml`) | **[manual]** | ○ | − | 最新版の公開後に、サポート版 Release 本文の 🎣 Related Releases を完成させる |
| R08 | Release changelog (wiki)<br>(`release-changelog.yml`) | **[manual]** | ○ | ○ | 公開済みの Release から Changelog を作り、4 つの Wiki へ反映する |

R02・R03 はリリース PR を経由する最新版だけで動きます。サポート版は R01 がコミットとタグ付けまで直接行うため、R02・R03 は動きません。

## 2. 全体の流れ

サポート版を先に出し、最新版を最後に出します。
最新版は機能追加を含み片付くのが遅いことと、Release の表示順が「最新 → サポート」だと利用者が最新版を取り違えるためです。

| 段階 | サポート版 (support/vXX) | 最新版 (develop → master) |
| :-- | :-- | :-- |
| 1. バージョン更新 | R01 を **support/vXX** を選んで実行 (コミット+タグまで自動) | R01 を **develop** を選んで実行 (リリース PR を作成) |
| 2. 検査・タグ付け | − | R02 が PR を検査。PR をマージすると R03 がタグを付ける |
| 3. 自動で動くもの | タグ作成で R04 (npm) と R05 (ドラフト Release) | タグ作成で R04 (npm) と R05 (ドラフト Release + Release Notes 本文) |
| 4. Release Notes | R06 を実行 (`prs` 必須、`update_draft` を true) → 本文を確認・修正 | 本文を確認・修正 (やり直したいときだけ R06) |
| 5. 公開 | ドラフトを **Publish** (最新版より先) | ドラフトを **Publish** (最後。「Set as latest」はここだけ) |
| 6. 関連リリースの完成 | − | R07 を最新版のタグで実行 |
| 7. Changelog | R08 を実行 (`prs` 必須) | R08 を実行 (サポート版の 🎣 行を後追いで補う) |

実行の順序は 1. サポート版 → 1. 最新版 → 5. サポート版 → 5. 最新版 → 6 → 7. サポート版 → 7. 最新版 です。
サポート版が無い回は、最新版の列だけを上から順に行います。

## 3. 手順

### 3-1. サポート版 (support/vXX) — 先に行う

1. **R01** を「Use workflow from: `support/vXX`」で実行する。
   - `version`: 例 `52.7.2` / `summary`: 更新内容。
   - コミットとタグ (`v52.7.2`) の作成まで自動で行われる。
2. **自動**: R04 が npm へ公開し、R05 が Assets を検証してドラフト Release を作る。
   - サポート版は取り込む PR を自動判定できないため、Release Notes 本文はまだ空 (`[DRAFT]` の文言のまま)。
3. **R06** を実行して Release Notes の下書きを作る。
   - `tag`: `v52.7.2` / `prs`: `PR番号:項目番号+項目番号` をカンマ区切り (例: `2333:2`、複数なら `2333:2,2340`) / `update_draft`: true。
   - サポート版の PR 番号は develop 側と同じ番号を指定する。
4. ドラフト Release の本文と Assets を確認し、必要なら本文を手で直す。
5. 最新版より**先に** Release を **Publish** する (「Set as latest」は付けない)。

### 3-2. 最新版 (develop → master)

1. **R01** を「Use workflow from: `develop`」で実行する。
   - `version`: 例 `53.4.0` / `summary`: 更新内容。
   - develop へコミットし、master 宛てのリリース PR を作る。
2. **自動**: R02 が PR のバージョン整合を検査する。失敗したら指摘どおりに直して PR を更新する。
3. リリース PR をマージする。
4. **自動**: R03 が develop へ逆マージし、master にタグを付ける。続けて R04 (npm) と R05 (ドラフト Release + Release Notes 本文) が動く。
5. ドラフト Release の本文と Assets を確認する。
   - 重要度・原因バージョン・Backport は、リリース PR の承認時に記入した内容が本文に反映される。
   - 本文を作り直したいときは **R06** を実行する (`update_draft` を true)。
6. 最後に Release を **Publish** する。「Set as latest」はこの最新版だけに付ける。

### 3-3. 公開後

1. **R07** を**最新版のタグ**で実行する。
   - まず `apply` を false のまま実行して差分を確認し、問題なければ true で再実行する。
   - サポート版 Release 本文の 🎣 Related Releases が完成する。
2. **R08** を**サポート版 → 最新版**の順に実行する。
   - `tag`: 対象タグ / `prs`: サポート版のみ必須 (R06 と同じ指定) / `dry_run`: 最初は true。
   - 差分の要約を確認してから `dry_run` を false にして再実行すると、4 つの Wiki (GitHub 日本語・英語、GitLab Ja・En) へ反映される。
   - 最新版の実行時に、先に反映したサポート版エントリへ 🎣 行が補われる。

## 4. 注意

- Release は公開後に Assets を変更できない (immutable)。**R05 の検証結果を確認してから Publish する**。
- Release Notes の本文は公開後も修正できる。Changelog は本文を元に作るため、本文を直した後に R08 を実行する。
- R05 の再実行は、既に Release (ドラフトを含む) がある場合はエラーになる。ドラフトを作り直すときは、ドラフト Release を削除してから実行する。
- メジャーバージョンを上げるリリースは、R08 が未対応でエラーになる (Changelog-latest の archive が必要)。
- R06・R07・R05 は同じ書き込み待ち行列 (`draft-release-writes`) を使うため、同時に実行しても順番に処理される。
