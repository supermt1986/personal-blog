"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const dynamodb_1 = require("./dynamodb");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
class BlogStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const dynamodb = new dynamodb_1.BlogDynamoDB(this, 'DynamoDB');
        const s3Bucket = new aws_s3_1.Bucket(this, 'ImagesBucket', {
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY
        });
        const lambdaRole = new aws_iam_1.Role(this, 'LambdaRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('lambda.amazonaws.com')
        });
        dynamodb.postsTable.grantReadWriteData(lambdaRole);
        dynamodb.categoriesTable.grantReadWriteData(lambdaRole);
        dynamodb.tagsTable.grantReadWriteData(lambdaRole);
        dynamodb.commentsTable.grantReadWriteData(lambdaRole);
        s3Bucket.grantReadWrite(lambdaRole);
        const apiHandler = new aws_lambda_1.Function(this, 'ApiHandler', {
            runtime: aws_lambda_1.Runtime.NODEJS_20_X,
            handler: 'handler.main',
            code: aws_lambda_1.Code.fromAsset('../lambda'),
            role: lambdaRole,
            environment: {
                POSTS_TABLE: dynamodb.postsTable.tableName,
                CATEGORIES_TABLE: dynamodb.categoriesTable.tableName,
                TAGS_TABLE: dynamodb.tagsTable.tableName,
                COMMENTS_TABLE: dynamodb.commentsTable.tableName,
                S3_BUCKET: s3Bucket.bucketName
            }
        });
        const api = new aws_apigateway_1.RestApi(this, 'BlogApi');
        api.root.addMethod('GET', new aws_apigateway_1.LambdaIntegration(apiHandler));
        api.root.addResource('posts').addMethod('GET', new aws_apigateway_1.LambdaIntegration(apiHandler));
        api.root.addResource('categories').addMethod('GET', new aws_apigateway_1.LambdaIntegration(apiHandler));
        api.root.addResource('tags').addMethod('GET', new aws_apigateway_1.LambdaIntegration(apiHandler));
        api.root.addResource('comments').addMethod('GET', new aws_apigateway_1.LambdaIntegration(apiHandler));
        api.root.addResource('admin').addMethod('POST', new aws_apigateway_1.LambdaIntegration(apiHandler));
    }
}
exports.BlogStack = BlogStack;
