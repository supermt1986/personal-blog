import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const dynamodb = new DynamoDBClient({});
const s3 = new S3Client({});
const POSTS_TABLE = process.env.POSTS_TABLE;
const CATEGORIES_TABLE = process.env.CATEGORIES_TABLE;
const TAGS_TABLE = process.env.TAGS_TABLE;
const COMMENTS_TABLE = process.env.COMMENTS_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
export const handleApiRequest = async (event) => {
    const path = event.path || '';
    const method = event.httpMethod || 'GET';
    // CORS preflight
    if (method === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    try {
        if (path === '/posts' && method === 'GET') {
            const result = await dynamodb.send(new ScanCommand({ TableName: POSTS_TABLE }));
            return { statusCode: 200, headers, body: JSON.stringify(result.Items) };
        }
        if (path.match(/^\/posts\/[^/]+$/) && method === 'GET') {
            const postId = path.split('/')[2];
            const result = await dynamodb.send(new QueryCommand({
                TableName: POSTS_TABLE,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: { ':pk': `POST#${postId}`, ':sk': 'TIMESTAMP#' }
            }));
            return { statusCode: 200, headers, body: JSON.stringify(result.Items?.[0]) };
        }
        if (path === '/posts' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const postId = crypto.randomUUID();
            const now = new Date().toISOString();
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
            }));
            return { statusCode: 201, headers, body: JSON.stringify({ postId }) };
        }
        if (path.match(/^\/posts\/[^/]+$/) && method === 'PUT') {
            const postId = path.split('/')[2];
            const body = JSON.parse(event.body || '{}');
            const now = new Date().toISOString();
            // Query existing post to get createdAt
            const existing = await dynamodb.send(new QueryCommand({
                TableName: POSTS_TABLE,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: { ':pk': `POST#${postId}`, ':sk': 'TIMESTAMP#' }
            }));
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
                    createdAt: existing.Items?.[0]?.createdAt || now,
                    updatedAt: now
                }
            }));
            return { statusCode: 200, headers, body: JSON.stringify({ postId }) };
        }
        if (path.match(/^\/posts\/[^/]+$/) && method === 'DELETE') {
            const postId = path.split('/')[2];
            // Delete all items for this post (using Scan + Delete)
            const result = await dynamodb.send(new QueryCommand({
                TableName: POSTS_TABLE,
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: { ':pk': `POST#${postId}` }
            }));
            for (const item of result.Items || []) {
                await dynamodb.send(new PutCommand({
                    TableName: POSTS_TABLE,
                    Item: { ...item, SK: item.SK, deleteFlag: true }
                }));
            }
            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        if (path === '/categories' && method === 'GET') {
            const result = await dynamodb.send(new ScanCommand({ TableName: CATEGORIES_TABLE }));
            return { statusCode: 200, headers, body: JSON.stringify(result.Items) };
        }
        if (path === '/tags' && method === 'GET') {
            const result = await dynamodb.send(new ScanCommand({ TableName: TAGS_TABLE }));
            return { statusCode: 200, headers, body: JSON.stringify(result.Items) };
        }
        if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'GET') {
            const postId = path.split('/')[2];
            const result = await dynamodb.send(new QueryCommand({
                TableName: COMMENTS_TABLE,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: { ':pk': `POST#${postId}`, ':sk': 'COMMENT#' }
            }));
            return { statusCode: 200, headers, body: JSON.stringify(result.Items) };
        }
        if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'POST') {
            const postId = path.split('/')[2];
            const body = JSON.parse(event.body || '{}');
            const commentId = crypto.randomUUID();
            const timestamp = Date.now().toString();
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
            }));
            return { statusCode: 201, headers, body: JSON.stringify({ commentId }) };
        }
        if (path === '/admin/upload' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const key = `images/${Date.now()}-${body.filename}`;
            const command = new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                ContentType: body.contentType
            });
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            return { statusCode: 200, headers, body: JSON.stringify({ uploadUrl: url, key }) };
        }
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    }
    catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
    }
};
