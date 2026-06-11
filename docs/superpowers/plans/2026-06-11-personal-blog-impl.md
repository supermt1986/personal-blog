# パーソナルブログ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AWS Amplify + Next.js App Router + DynamoDBで動くエディトリアル調ブログを完成させる

**Architecture:** フロントエンドはNext.js 14 App RouterでAmplify Hostingにデプロイ。BFFとしてLambda用于しDynamoDBとS3にアクセス。CDKでインフラをコード管理。

**Tech Stack:** Next.js 14, TypeScript, AWS CDK, AWS Amplify, DynamoDB, S3, Lambda, Cognito, Vitest, Playwright

---

## ファイル構成

```
/
├── cdk/                         # CDKインフラ定義
│   ├── lib/blog-stack.ts        # メインスタック
│   ├── lib/dynamodb.ts          # DynamoDBテーブル定義
│   └── bin/cdk.ts               # エントリーポイント
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # ホーム（最新記事リスト）
│   │   ├── posts/[id]/page.tsx  # 記事詳細
│   │   ├── categories/[slug]/page.tsx
│   │   ├── tags/[slug]/page.tsx
│   │   ├── layout.tsx           # 共通レイアウト
│   │   └── admin/               # 管理画面
│   │       ├── layout.tsx       # 管理画面レイアウト（Cognito認証）
│   │       ├── page.tsx         # ダッシュボード
│   │       ├── posts/
│   │       ├── categories/
│   │       ├── tags/
│   │       └── comments/
│   ├── components/              # Reactコンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostContent.tsx
│   │   ├── CommentList.tsx
│   │   └── admin/
│   ├── lib/
│   │   ├── api.ts               # APIクライアント
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── lambda/
│   └── handler.ts               # Lambda BFF
└── tests/
    ├── unit/
    └── e2e/
```

---

## タスク一覧

### Task 1: プロジェクト初期設定

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: package.jsonを作成**

```json
{
  "name": "personal-blog",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "20.12.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "typescript": "5.4.0",
    "vitest": "1.4.0",
    "@playwright/test": "1.42.0"
  }
}
```

- [ ] **Step 2: tsconfig.jsonを作成**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: next.config.jsを作成**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.s3.amazonaws.com' }
    ]
  }
}

module.exports = nextConfig
```

- [ ] **Step 4: vitest.config.tsを作成**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})
```

- [ ] **Step 5: playwright.config.tsを作成**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

- [ ] **Step 6: npm installを実行**

Run: `npm install`
Expected: dependencies installed successfully

- [ ] **Step 7: コミット**

```bash
git add package.json tsconfig.json next.config.js vitest.config.ts playwright.config.ts
git commit -m "chore: initial project setup"
```

---

### Task 2: CDKインフラ構築

**Files:**
- Create: `cdk/package.json`
- Create: `cdk/tsconfig.json`
- Create: `cdk/lib/blog-stack.ts`
- Create: `cdk/lib/dynamodb.ts`
- Create: `cdk/bin/cdk.ts`

- [ ] **Step 1: CDKディレクトリを作成してpackage.jsonを作成**

```json
{
  "name": "blog-cdk",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "deploy": "npm run build && cdk deploy",
    "diff": "cdk diff"
  },
  "dependencies": {
    "aws-cdk-lib": "2.130.0",
    "constructs": "10.3.0",
    "aws-cdk": "2.130.0"
  },
  "devDependencies": {
    "@types/node": "20.12.0",
    "typescript": "5.4.0"
  }
}
```

- [ ] **Step 2: cdk/tsconfig.jsonを作成**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["bin/**/*", "lib/**/*"]
}
```

- [ ] **Step 3: cdk/lib/dynamodb.tsを作成**

```typescript
import { Construct } from 'constructs'
import { Table, TableProps, BillingMode } from 'aws-cdk-lib/aws-dynamodb'

export class BlogDynamoDB extends Construct {
  public readonly postsTable: Table
  public readonly categoriesTable: Table
  public readonly tagsTable: Table
  public readonly commentsTable: Table

  constructor(scope: Construct, id: string) {
    super(scope, id)

    this.postsTable = new Table(this, 'Posts', {
      partitionKey: { name: 'PK', type: 'S' },
      sortKey: { name: 'SK', type: 'S' },
      billingMode: BillingMode.PAY_PER_REQUEST
    } as TableProps)

    this.categoriesTable = new Table(this, 'Categories', {
      partitionKey: { name: 'PK', type: 'S' },
      sortKey: { name: 'SK', type: 'S' },
      billingMode: BillingMode.PAY_PER_REQUEST
    } as TableProps)

    this.tagsTable = new Table(this, 'Tags', {
      partitionKey: { name: 'PK', type: 'S' },
      sortKey: { name: 'SK', type: 'S' },
      billingMode: BillingMode.PAY_PER_REQUEST
    } as TableProps)

    this.commentsTable = new Table(this, 'Comments', {
      partitionKey: { name: 'PK', type: 'S' },
      sortKey: { name: 'SK', type: 'S' },
      billingMode: BillingMode.PAY_PER_REQUEST
    } as TableProps)
  }
}
```

- [ ] **Step 4: cdk/lib/blog-stack.tsを作成**

```typescript
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BlogDynamoDB } from './dynamodb'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { User, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda'
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { CognitoUserPool, CognitoUserPoolClient } from '@aws-cdk/aws-cognito'
import { Amplify } from '@aws-cdk/aws-amplify'

export class BlogStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const dynamodb = new BlogDynamoDB(this, 'DynamoDB')

    const s3Bucket = new Bucket(this, 'ImagesBucket', {
      removalPolicy: RemovalPolicy.DESTROY
    })

    const lambdaRole = new Role(this, 'LambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    })

    dynamodb.postsTable.grantReadWriteData(lambdaRole)
    dynamodb.categoriesTable.grantReadWriteData(lambdaRole)
    dynamodb.tagsTable.grantReadWriteData(lambdaRole)
    dynamodb.commentsTable.grantReadWriteData(lambdaRole)
    s3Bucket.grantReadWrite(lambdaRole)

    const apiHandler = new Function(this, 'ApiHandler', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler.main',
      code: Code.fromAsset('../lambda'),
      role: lambdaRole,
      environment: {
        POSTS_TABLE: dynamodb.postsTable.tableName,
        CATEGORIES_TABLE: dynamodb.categoriesTable.tableName,
        TAGS_TABLE: dynamodb.tagsTable.tableName,
        COMMENTS_TABLE: dynamodb.commentsTable.tableName,
        S3_BUCKET: s3Bucket.bucketName
      }
    })

    const api = new RestApi(this, 'BlogApi')
    api.root.addMethod('GET', new LambdaIntegration(apiHandler))
    api.root.addResource('posts').addMethod('GET', new LambdaIntegration(apiHandler))
    api.root.addResource('categories').addMethod('GET', new LambdaIntegration(apiHandler))
    api.root.addResource('tags').addMethod('GET', new LambdaIntegration(apiHandler))
    api.root.addResource('comments').addMethod('GET', new LambdaIntegration(apiHandler))
    api.root.addResource('admin').addMethod('POST', new LambdaIntegration(apiHandler))

    const userPool = new CognitoUserPool(this, 'BlogUserPool', {
      userPoolName: 'blog-admin-users'
    })

    new CognitoUserPoolClient(this, 'BlogAdminClient', {
      userPool: userPool
    })

    new Amplify(this, 'BlogAmplify', {
      appName: 'personal-blog',
      repository: 'https://github.com/USER/repo',
      branch: 'main',
      buildSpec: {
        version: 1,
        phases: {
          build: {
            commands: ['npm run build']
          }
        }
      }
    })
  }
}
```

- [ ] **Step 5: cdk/bin/cdk.tsを作成**

```typescript
#!/usr/bin/env node
import 'aws-cdk/lib/util'
import { App } from 'aws-cdk-lib'
import { BlogStack } from '../lib/blog-stack'

const app = new App()
new BlogStack(app, 'PersonalBlogStack')
```

- [ ] **Step 6: CDKをデプロイ**

Run: `cd cdk && npm install && npm run deploy`
Expected: Stack created successfully

- [ ] **Step 7: コミット**

```bash
git add cdk/
git commit -m "feat: add CDK infrastructure"
```

---

### Task 3: Lambda BFF実装

**Files:**
- Create: `lambda/package.json`
- Create: `lambda/tsconfig.json`
- Create: `lambda/handler.ts`

- [ ] **Step 1: lambda/package.jsonを作成**

```json
{
  "name": "blog-lambda",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "package": "npm run build && zip -r function.zip dist/"
  },
  "dependencies": {
    "@aws-sdk/client-dynamodb": "3.550.0",
    "@aws-sdk/client-s3": "3.550.0",
    "@aws-sdk/s3-request-presigner": "3.550.0"
  },
  "devDependencies": {
    "@types/node": "20.12.0",
    "typescript": "5.4.0"
  }
}
```

- [ ] **Step 2: lambda/tsconfig.jsonを作成**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./"
  },
  "include": ["**/*.ts"]
}
```

- [ ] **Step 3: lambda/handler.tsを作成**

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetCommand, PutCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const dynamodb = new DynamoDBClient({})
const s3 = new S3Client({})

const POSTS_TABLE = process.env.POSTS_TABLE!
const CATEGORIES_TABLE = process.env.CATEGORIES_TABLE!
const TAGS_TABLE = process.env.TAGS_TABLE!
const COMMENTS_TABLE = process.env.COMMENTS_TABLE!
const S3_BUCKET = process.env.S3_BUCKET!

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
}

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const path = event.path || ''
  const method = event.httpMethod || 'GET'

  try {
    if (path === '/posts' && method === 'GET') {
      const result = await dynamodb.send(new ScanCommand({ TableName: POSTS_TABLE }))
      return { statusCode: 200, headers, body: JSON.stringify(result.Items) }
    }

    if (path.match(/^\/posts\/[^/]+$/) && method === 'GET') {
      const postId = path.split('/')[2]
      const result = await dynamodb.send(new QueryCommand({
        TableName: POSTS_TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `POST#${postId}`, ':sk': 'TIMESTAMP#' }
      }))
      return { statusCode: 200, headers, body: JSON.stringify(result.Items?.[0]) }
    }

    if (path === '/posts' && method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const postId = crypto.randomUUID()
      const now = new Date().toISOString()

      await dynamodb.send(new PutCommand({
        TableName: POSTS_TABLE,
        Item: {
          PK: `POST#${postId}`,
          SK: `TIMESTAMP#${now}`,
          postId,
          title: body.title,
          content: body.content,
          featuredImage: body.featuredImage,
          categoryId: body.categoryId,
          tags: body.tags || [],
          isPublished: body.isPublished || false,
          createdAt: now,
          updatedAt: now
        }
      }))
      return { statusCode: 201, headers, body: JSON.stringify({ postId }) }
    }

    if (path === '/categories' && method === 'GET') {
      const result = await dynamodb.send(new ScanCommand({ TableName: CATEGORIES_TABLE }))
      return { statusCode: 200, headers, body: JSON.stringify(result.Items) }
    }

    if (path === '/tags' && method === 'GET') {
      const result = await dynamodb.send(new ScanCommand({ TableName: TAGS_TABLE }))
      return { statusCode: 200, headers, body: JSON.stringify(result.Items) }
    }

    if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'GET') {
      const postId = path.split('/')[2]
      const result = await dynamodb.send(new QueryCommand({
        TableName: COMMENTS_TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `POST#${postId}`, ':sk': 'COMMENT#' }
      }))
      return { statusCode: 200, headers, body: JSON.stringify(result.Items) }
    }

    if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'POST') {
      const postId = path.split('/')[2]
      const body = JSON.parse(event.body || '{}')
      const commentId = crypto.randomUUID()
      const timestamp = Date.now().toString()

      await dynamodb.send(new PutCommand({
        TableName: COMMENTS_TABLE,
        Item: {
          PK: `POST#${postId}`,
          SK: `COMMENT#${timestamp}#${commentId}`,
          commentId,
          author: body.author,
          content: body.content,
          isApproved: false,
          createdAt: new Date().toISOString()
        }
      }))
      return { statusCode: 201, headers, body: JSON.stringify({ commentId }) }
    }

    if (path === '/admin/upload' && method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const key = `images/${Date.now()}-${body.filename}`

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: body.contentType
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

      return { statusCode: 200, headers, body: JSON.stringify({ uploadUrl: url, key }) }
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) }
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
```

- [ ] **Step 4: Lambdaをビルドしてデプロイ**

Run: `cd lambda && npm install && npm run package`
Expected: function.zip created

- [ ] **Step 5: ユニットテストを作成**

- [ ] **Step 6: コミット**

```bash
git add lambda/
git commit -m "feat: add Lambda BFF handler"
```

---

### Task 4: Next.js基本構造

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/api.ts`

- [ ] **Step 1: src/app/globals.cssを作成**

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');

:root {
  --color-bg: #FAFAFA;
  --color-text: #1A1A1A;
  --color-accent: #2563EB;
  --color-muted: #6B7280;
  --font-family: 'Noto Sans JP', sans-serif;
  --line-height: 1.8;
  --content-width: 65ch;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-family);
  line-height: var(--line-height);
  color: var(--color-text);
  background-color: var(--color-bg);
}

body {
  min-height: 100vh;
}

h1 {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 1.5rem;
}

a {
  color: var(--color-accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.container {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }
  .container {
    padding: 0 8px;
  }
}
```

- [ ] **Step 2: src/lib/api.tsを作成**

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface Post {
  postId: string
  title: string
  content: string
  featuredImage?: string
  categoryId: string
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface Category {
  categoryId: string
  name: string
  slug: string
}

interface Tag {
  tagId: string
  name: string
  slug: string
}

interface Comment {
  commentId: string
  author: string
  content: string
  isApproved: boolean
  createdAt: string
}

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts`)
  return res.json()
}

export async function getPost(id: string): Promise<Post | null> {
  const res = await fetch(`${API_BASE}/posts/${id}`)
  return res.ok ? res.json() : null
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`)
  return res.json()
}

export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${API_BASE}/tags`)
  return res.json()
}

export async function getComments(postId: string): Promise<Comment[]> {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`)
  return res.json()
}

export async function createComment(postId: string, author: string, content: string): Promise<void> {
  await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, content })
  })
}
```

- [ ] **Step 3: src/app/layout.tsxを作成**

```tsx
import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Personal Blog',
  description: 'A personal blog with editorial design'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: src/components/Header.tsxを作成**

```tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB' }}>
      <div className="container">
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Blog
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/categories">カテゴリ</Link>
            <Link href="/tags">タグ</Link>
            <Link href="/admin">管理</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: src/components/Footer.tsxを作成**

```tsx
export default function Footer() {
  return (
    <footer style={{ padding: '2rem 0', marginTop: '4rem', borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
      <div className="container">
        <p style={{ color: 'var(--color-muted)' }}>© 2026 Personal Blog</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: src/app/page.tsxを作成**

```tsx
import Link from 'next/link'
import { getPosts } from '@/lib/api'
import PostCard from '@/components/PostCard'

export default async function HomePage() {
  const posts = await getPosts()

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1>Latest Articles</h1>
      <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
        {posts.map((post) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: src/components/PostCard.tsxを作成**

```tsx
import Link from 'next/link'
import Image from 'next/image'

interface Post {
  postId: string
  title: string
  featuredImage?: string
  createdAt: string
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
      {post.featuredImage && (
        <div style={{ position: 'relative', height: '200px' }}>
          <Image src={post.featuredImage} alt={post.title} fill style={{ objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '1.5rem' }}>
        <time style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
          {new Date(post.createdAt).toLocaleDateString('ja-JP')}
        </time>
        <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
          <Link href={`/posts/${post.postId}`}>{post.title}</Link>
        </h2>
      </div>
    </article>
  )
}
```

- [ ] **Step 8: 開発サーバーを起動して確認**

Run: `npm run dev`
Expected: http://localhost:3000 でアクセス可能

- [ ] **Step 9: コミット**

```bash
git add src/
git commit -m "feat: add Next.js basic structure"
```

---

### Task 5: 記事詳細ページとコメント機能

**Files:**
- Create: `src/app/posts/[id]/page.tsx`
- Create: `src/components/PostContent.tsx`
- Create: `src/components/CommentList.tsx`
- Create: `src/components/CommentForm.tsx`

- [ ] **Step 1: src/components/PostContent.tsxを作成**

```tsx
import Image from 'next/image'

interface Post {
  title: string
  content: string
  featuredImage?: string
  createdAt: string
}

export default function PostContent({ post }: { post: Post }) {
  return (
    <article>
      {post.featuredImage && (
        <div style={{ position: 'relative', width: '100%', height: '70vh', marginBottom: '2rem' }}>
          <Image src={post.featuredImage} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
        </div>
      )}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{post.title}</h1>
        <time style={{ color: 'var(--color-muted)' }}>
          {new Date(post.createdAt).toLocaleDateString('ja-JP')}
        </time>
      </header>
      <div style={{ fontSize: '1.125rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

- [ ] **Step 2: src/components/CommentList.tsxを作成**

```tsx
interface Comment {
  commentId: string
  author: string
  content: string
  createdAt: string
}

export default function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return null

  return (
    <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #E5E7EB' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>コメント ({comments.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {comments.map((comment) => (
          <div key={comment.commentId} style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>{comment.author}</strong>
              <time style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                {new Date(comment.createdAt).toLocaleDateString('ja-JP')}
              </time>
            </div>
            <p style={{ margin: 0 }}>{comment.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: src/components/CommentForm.tsxを作成**

```tsx
'use client'

import { useState } from 'react'

export default function CommentForm({ postId }: { postId: string }) {
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content })
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#ECFDF5', borderRadius: '8px', color: '#065F46' }}>
        コメントを投稿しました。承認後に表示されます。
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>コメントを投稿</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>名前</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>コメント</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
          />
        </div>
        <button
          type="submit"
          style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
        >
          投稿する
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: src/app/posts/[id]/page.tsxを作成**

```tsx
import { notFound } from 'next/navigation'
import { getPost, getComments } from '@/lib/api'
import PostContent from '@/components/PostContent'
import CommentList from '@/components/CommentList'
import CommentForm from '@/components/CommentForm'

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  if (!post) notFound()

  const comments = await getComments(params.id)

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <PostContent post={post} />
      <CommentList comments={comments} />
      <CommentForm postId={params.id} />
    </div>
  )
}
```

- [ ] **Step 5: 動作確認**

Run: `npm run dev`
Expected: 記事詳細ページでコメント表示・投稿が可能

- [ ] **Step 6: コミット**

```bash
git add src/
git commit -m "feat: add post detail page and comments"
```

---

### Task 6: 管理画面

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/posts/page.tsx`
- Create: `src/app/admin/categories/page.tsx`
- Create: `src/app/admin/tags/page.tsx`
- Create: `src/app/admin/comments/page.tsx`

- [ ] **Step 1: src/app/admin/layout.tsxを作成**

```tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // TODO: Cognito認証チェック
  const isAuthenticated = true

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '240px', padding: '1.5rem', background: '#F9FAFB', borderRight: '1px solid #E5E7EB' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>管理画面</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/admin">ダッシュボード</Link>
          <Link href="/admin/posts">記事管理</Link>
          <Link href="/admin/categories">カテゴリ</Link>
          <Link href="/admin/tags">タグ</Link>
          <Link href="/admin/comments">コメント</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: src/app/admin/page.tsxを作成**

```tsx
import { getPosts, getCategories } from '@/lib/api'

export default async function AdminDashboard() {
  const posts = await getPosts()
  const categories = await getCategories()

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>ダッシュボード</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }}>記事数</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{posts.length}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }}>カテゴリ数</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{categories.length}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: src/app/admin/posts/page.tsxを作成**

```tsx
import Link from 'next/link'
import { getPosts } from '@/lib/api'

export default async function AdminPostsPage() {
  const posts = await getPosts()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>記事管理</h1>
        <Link href="/admin/posts/new" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: 'white', borderRadius: '6px' }}>
          新規作成
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>タイトル</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>ステータス</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>作成日</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.postId} style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '0.75rem' }}>{post.title}</td>
              <td style={{ padding: '0.75rem' }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', background: post.isPublished ? '#ECFDF5' : '#FEF3C7', color: post.isPublished ? '#065F46' : '#92400E' }}>
                  {post.isPublished ? '公開' : '下書き'}
                </span>
              </td>
              <td style={{ padding: '0.75rem', color: 'var(--color-muted)' }}>
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </td>
              <td style={{ padding: '0.75rem' }}>
                <Link href={`/admin/posts/${post.postId}`} style={{ marginRight: '1rem' }}>編集</Link>
                <button style={{ color: '#DC2626' }}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: src/app/admin/posts/[id]/page.tsxを作成**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, isPublished })
    })
    router.push('/admin/posts')
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>記事編集</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>タイトル</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>本文</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={20} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            公開する
          </label>
        </div>
        <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          保存
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: src/app/admin/categories/page.tsxを作成**

```tsx
export default function AdminCategoriesPage() {
  // TODO: カテゴリ CRUD UI
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>カテゴリ管理</h1>
      <p>カテゴリ管理機能は今後実装します。</p>
    </div>
  )
}
```

- [ ] **Step 6: src/app/admin/tags/page.tsxを作成**

```tsx
export default function AdminTagsPage() {
  // TODO: タグ CRUD UI
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>タグ管理</h1>
      <p>タグ管理機能は今後実装します。</p>
    </div>
  )
}
```

- [ ] **Step 7: src/app/admin/comments/page.tsxを作成**

```tsx
export default function AdminCommentsPage() {
  // TODO: コメント承認 UI
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>コメント管理</h1>
      <p>コメント管理機能は今後実装します。</p>
    </div>
  )
}
```

- [ ] **Step 8: 動作確認**

Run: `npm run dev`
Expected: http://localhost:3000/admin で管理画面にアクセス可能

- [ ] **Step 9: コミット**

```bash
git add src/
git commit -m "feat: add admin pages"
```

---

### Task 7: E2Eテスト

**Files:**
- Create: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/post.spec.ts`

- [ ] **Step 1: tests/e2e/home.spec.tsを作成**

```typescript
import { test, expect } from '@playwright/test'

test('home page shows posts', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Latest Articles')
})

test('navigation works', async ({ page }) => {
  await page.goto('/')
  await page.click('text=カテゴリ')
  await expect(page).toHaveURL(/\/categories/)
})
```

- [ ] **Step 2: tests/e2e/post.spec.tsを作成**

```typescript
import { test, expect } from '@playwright/test'

test('post detail page loads', async ({ page }) => {
  await page.goto('/posts/test-id')
  // 存在しない場合は404
  await expect(page.locator('body')).toBeVisible()
})
```

- [ ] **Step 3: Playwrightをインストール**

Run: `npx playwright install chromium`
Expected: Chromium installed

- [ ] **Step 4: E2Eテストを実行**

Run: `npm run test:e2e`
Expected: All tests pass

- [ ] **Step 5: コミット**

```bash
git add tests/
git commit -m "test: add E2E tests"
```

---

## 検証方法

1. **ローカル開発**: `npm run dev` で http://localhost:3000 にアクセス
2. **ユニットテスト**: `npm test` で Vitest 実行
3. **E2Eテスト**: `npm run test:e2e` で Playwright 実行
4. **CDKデプロイ**: `cd cdk && npm run deploy` でAWSにインフラ構築
5. **Amplifyデプロイ**: Git push で自動デプロイ