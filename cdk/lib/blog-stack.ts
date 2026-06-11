import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BlogDynamoDB } from './dynamodb'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda'
import { RestApi, LambdaIntegration, MethodOptions } from 'aws-cdk-lib/aws-apigateway'

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
      handler: 'handler.handleApiRequest',
      code: Code.fromAsset('../lambda/dist'),
      role: lambdaRole,
      environment: {
        POSTS_TABLE: dynamodb.postsTable.tableName,
        CATEGORIES_TABLE: dynamodb.categoriesTable.tableName,
        TAGS_TABLE: dynamodb.tagsTable.tableName,
        COMMENTS_TABLE: dynamodb.commentsTable.tableName,
        S3_BUCKET: s3Bucket.bucketName
      }
    })

    const api = new RestApi(this, 'BlogApi', {
      defaultIntegration: new LambdaIntegration(apiHandler)
    })

    // Root
    api.root.addMethod('GET', new LambdaIntegration(apiHandler))

    // Posts
    const posts = api.root.addResource('posts')
    posts.addMethod('GET', new LambdaIntegration(apiHandler))
    posts.addMethod('POST', new LambdaIntegration(apiHandler))

    // Posts/{id}
    const postById = posts.addResource('{id}')
    postById.addMethod('GET', new LambdaIntegration(apiHandler))
    postById.addMethod('PUT', new LambdaIntegration(apiHandler))
    postById.addMethod('DELETE', new LambdaIntegration(apiHandler))

    // Posts/{id}/comments
    const postComments = postById.addResource('comments')
    postComments.addMethod('GET', new LambdaIntegration(apiHandler))
    postComments.addMethod('POST', new LambdaIntegration(apiHandler))

    // Categories
    const categories = api.root.addResource('categories')
    categories.addMethod('GET', new LambdaIntegration(apiHandler))

    // Tags
    const tags = api.root.addResource('tags')
    tags.addMethod('GET', new LambdaIntegration(apiHandler))

    // Admin
    const admin = api.root.addResource('admin')
    admin.addMethod('POST', new LambdaIntegration(apiHandler))
  }
}