import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BlogDynamoDB } from './dynamodb'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda'
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito'

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

    const userPool = new UserPool(this, 'BlogUserPool', {
      userPoolName: 'blog-admin-users'
    })

    new UserPoolClient(this, 'BlogAdminClient', {
      userPool: userPool
    })
  }
}