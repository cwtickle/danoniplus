**[English](https://github.com/cwtickle/danoniplus-docs/wiki/SecurityPolicy) | Japanese** 

# Security Policy

## Supported Versions / サポートバージョン

- 修正対象のバージョンは下記の通りです。
- 基本的には、同一メジャーバージョンの最新版がサポート対象です。
- v1～v28, v30～v32は**更新を終了しました。**  
v33の対応終了時期はv36リリース開始時を予定しています。（変更可能性あり）  
バージョン別の更新継続可否は現状、[ライフサイクルポリシー](https://github.com/cwtickle/danoniplus/wiki/LifecyclePolicy)に従います。
- 各バージョンの概要は[更新情報](https://github.com/cwtickle/danoniplus/wiki/UpdateInfo)に記載しています。

:heavy_check_mark: サポート中 / 
:warning: 近日中に更新終了予定 / 
:x: 更新終了 /   
:anchor: 通常より長いサポート期間があるバージョン

| Version | Supported          | Latest Version | Logs | First Release | End of Support |
| ------- | ------------------ |----------------|------|---------------|----------------|
| v35     | :heavy_check_mark: |[v35.0.0](https://github.com/cwtickle/danoniplus/releases/tag/v35.0.0)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-latest)|2024-01-28|(At Release v38)|
| v34 :anchor:    | :heavy_check_mark: |[v34.7.1](https://github.com/cwtickle/danoniplus/releases/tag/v34.7.1)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v34)|2023-09-24|(At Release v43)|
| v33     | :warning:          |[v33.7.6](https://github.com/cwtickle/danoniplus/releases/tag/v33.7.6)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v33)|2023-07-29|(At Release v36)|
| v32     | :x:                |[v32.7.7 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v32.7.7)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v32)|2023-05-07|2024-01-28|
| v31     | :x:                |[v31.7.7 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v31.7.7)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v31)|2023-03-20|2023-09-24|
| v30     | :x:                |[v30.6.3 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v30.6.3)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v30)|2023-02-10|2023-07-29|
| v29 :anchor:    | :heavy_check_mark: |[v29.4.10](https://github.com/cwtickle/danoniplus/releases/tag/v29.4.10)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v29)|2022-11-05|(At Release v38)|

<details>
<summary>End of support version / 過去バージョン</summary>

| Version | Supported          | Latest Version | Logs | First Release | End of Support |
| ------- | ------------------ |----------------|------|---------------|----------------|
| v28     | :x:                |[v28.6.7 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v28.6.7)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v28)|2022-08-21|2023-03-20|
| v27     | :x:                |[v27.8.7 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v27.8.7)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v27)|2022-03-18|2023-02-10|
| v26     | :x:                |[v26.7.6 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v26.7.6)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v26)|2022-01-30|2022-11-05|
| v25     | :x:                |[v25.5.10 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v25.5.10)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v25)|2022-01-04|2022-08-21|
| v24 :anchor:    | :x:        |[v24.6.19 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v24.6.19)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v24)|2021-10-24|2023-07-29|
| v23     | :x:                |[v23.5.6 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v23.5.6)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v23)|2021-09-04|2022-01-30|
| v22     | :x:                |[v22.5.6 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v22.5.6)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v22)|2021-04-28|2022-01-04|
| v21     | :x:                |[v21.5.6 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v21.5.6)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v21)|2021-03-12|2021-10-24|
| v20     | :x:                |[v20.5.4 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v20.5.4)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v20)|2021-02-12|2021-09-04|
| v19 :anchor:    | :x:        |[v19.5.17 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v19.5.17)          |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v19)|2021-01-17|2022-08-21|
| v18     | :x:                |[v18.9.6 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v18.9.6)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v18)|2020-10-25|2021-03-12|
| v17     | :x:                |[v17.5.9 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v17.5.9)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v17)|2020-09-27|2021-02-12|
| v16     | :x:                |[v16.4.10 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v16.4.10)|[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v16)|2020-08-06|2021-01-17|
| v15     | :x:                |[v15.7.5 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v15.7.5)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v15)|2020-05-13|2020-10-25|
| v14 :anchor:    | :x:        |[v14.5.21 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v14.5.21)|[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v14)|2020-04-29|2021-09-04|
| v13     | :x:                |[v13.6.8 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v13.6.8)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v13)|2020-03-29|2020-08-06|
| v12     | :x:                |[v12.3.6 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v12.3.6)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v12)|2020-02-09|2020-05-13|
| v11     | :x:                |[v11.4.5 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v11.4.5)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v11)|2019-12-14|2020-04-18|
| v10     | :x:                |[v10.5.5 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v10.5.5)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v10)|2019-11-04|2020-02-10|
| v9  :anchor:    | :x:        |[v9.4.27 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v9.4.27)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v9)|2019-10-08|2021-01-17|
| v8      | :x:                |[v8.7.10 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v8.7.10)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v8)|2019-09-08|2019-12-14|
| v7      | :x:                |[v7.9.13 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v7.9.13)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v7)|2019-07-08|2019-11-04|
| v6      | :x:                |[v6.6.13 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v6.6.13)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v6)|2019-06-22|2019-11-04|
| v5      | :x:                |[v5.12.17 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v5.12.17)|[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v5)|2019-05-16|2019-12-14|
| v4      | :x:                |[v4.10.22 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v4.10.22)|[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v4)|2019-04-25|2019-10-08|
| v3      | :x:                |[v3.13.9 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v3.13.9)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v3)|2019-02-25|2019-06-18|
| v2      | :x:                |[v2.9.11 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v2.9.11)  |[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v2)|2019-01-18|2019-06-18|
| v1      | :x:                |[v1.15.17 (final)](https://github.com/cwtickle/danoniplus/releases/tag/v1.15.17)|[:memo:](https://github.com/cwtickle/danoniplus/wiki/Changelog-v1)|2018-11-25|2019-10-08|

</details>

## Reporting a Vulnerability / 脆弱性・不具合情報

- 修正内容の詳細は [Release](https://github.com/cwtickle/danoniplus/releases) をご覧ください。
- 更新終了したバージョンについては、不具合が残っている可能性があります。  
[アップグレードガイド](https://github.com/cwtickle/danoniplus/wiki/MigrationGuide)、[本体のバージョンアップ](https://github.com/cwtickle/danoniplus/wiki/HowToUpdate)を参照して、  
本体の更新を検討してください。
- 更新を終了したバージョンの不具合情報は、[Wikiにてまとめています](https://github.com/cwtickle/danoniplus/wiki/DeprecatedVersionBugs)。
