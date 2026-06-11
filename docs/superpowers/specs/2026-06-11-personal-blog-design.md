# パーソナルブログ 設計書

## 概要

AWSを活用したサーバーレスパーソナルブログ。エディトリアル調デザイン、日本語読みやすさを重視。

## アーキテクチャ

```
[Next.js 14 App Router] ←→ [AWS Amplify Hosting]
                              ↓
                        [API Gateway]
                              ↓
                    [AWS Lambda (BFF)]
                              ↓
              [DynamoDB] ←→ [S3 (画像)]
```

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 14 (App Router), TypeScript |
| インフラ | AWS CDK, Amplify Hosting |
| BFF | AWS Lambda (Node.js) |
| データベース | Amazon DynamoDB |
| ストレージ | Amazon S3 |
| 認証 | AWS Cognito (管理画面のみ) |
| CDN | CloudFront (Amplify組み込み) |

## データモデル

### Posts (DynamoDB)

| 属性 | 型 | 説明 |
|------|-----|------|
| PK | String | `POST#<postId>` |
| SK | String | `TIMESTAMP#<timestamp>` |
| postId | String | UUID |
| title | String | 記事タイトル |
| content | String | Markdown本文 |
| featuredImage | String | S3画像URL |
| categoryId | String | カテゴリID |
| tags | List<String> | タグID配列 |
| isPublished | Boolean | 公開状態 |
| createdAt | String | ISO8601 |
| updatedAt | String | ISO8601 |

### Categories

| 属性 | 型 | 説明 |
|------|-----|------|
| PK | String | `CATEGORY#<categoryId>` |
| SK | String | `METADATA` |
| categoryId | String | UUID |
| name | String | カテゴリ名 |
| slug | String | URLスラッグ |

### Tags

| 属性 | 型 | 説明 |
|------|-----|------|
| PK | String | `TAG#<tagId>` |
| SK | String | `METADATA` |
| tagId | String | UUID |
| name | String | タグ名 |
| slug | String | URLスラッグ |

### Comments

| 属性 | 型 | 説明 |
|------|-----|------|
| PK | String | `POST#<postId>` |
| SK | String | `COMMENT#<timestamp>#<commentId>` |
| commentId | String | UUID |
| author | String | コメント者名 |
| content | String | コメント本文 |
| isApproved | Boolean | 承認状態 |
| createdAt | String | ISO8601 |

## 機能一覧

### 公開ページ

| 機能 | 説明 |
|------|------|
| ホーム | 最新記事リスト、 категори一覧サイドバー |
| 記事詳細 | タイトル/ Featured Image/ 本文、コメント表示 |
| カテゴリ一覧 | 特定カテゴリ所属記事リスト |
| タグ一覧 | 特定タグ所属記事リスト |

### 管理画面

| 機能 | 説明 |
|------|------|
| ログイン | Cognito認証 |
| ダッシュボード | 記事統計表示 |
| 記事管理 | 新規作成/編集/削除/下書き管理 |
| カテゴリ管理 | 作成/編集/削除 |
| タグ管理 | 作成/編集/削除 |
| コメント承認 | 未承認コメント一覧と承認/削除 |

## デザイン方針

### エディトリアル調

- 大きなタイポグラフィ（H1: 4rem以上）
- 記事冒頭の Featured Image 大画面表示（画面幅100%、max-height: 70vh）
- 本文は日本語読みやすさを優先
- line-height: 1.8、Font: Noto Sans JP

### カラーパレット

| 用途 | 色 |
|------|-----|
| 背景 | `#FAFAFA` |
| 本文 | `#1A1A1A` |
| アクセント | `#2563EB` |
| サブテキスト | `#6B7280` |

### レスポンシブ

- デスクトップ: 本文幅 max-width: 65ch、中央寄せ
- タブレット: フル幅、少し余白
- モバイル: 余白8px、H1: 2.5rem

## ファイル構成

```
/
├── cdk/                    # CDKインフラ定義
│   ├── lib/
│   └── bin/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        # ホーム
│   │   ├── posts/[id]/
│   │   ├── categories/[slug]/
│   │   ├── tags/[slug]/
│   │   └── admin/          # 管理画面
│   ├── components/
│   ├── lib/                # Lambda-handler共用
│   └── styles/
├── lambda/                 # BFF Lambda
└── spec/
```

## セキュリティ

- 管理画面のみCognito認証
- パブリックAPIはReadAnyone/WriteOwner相当
- S3バケットはCloudFrontからのみアクセス許可

## テスト方針

- ユニット: Vitest
- E2E: Playwright
- インフラ: CDK diff で差分確認