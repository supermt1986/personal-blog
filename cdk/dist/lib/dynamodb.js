"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogDynamoDB = void 0;
const constructs_1 = require("constructs");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
class BlogDynamoDB extends constructs_1.Construct {
    constructor(scope, id) {
        super(scope, id);
        this.postsTable = new aws_dynamodb_1.Table(this, 'Posts', {
            partitionKey: { name: 'PK', type: aws_dynamodb_1.AttributeType.STRING },
            sortKey: { name: 'SK', type: aws_dynamodb_1.AttributeType.STRING },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST
        });
        this.categoriesTable = new aws_dynamodb_1.Table(this, 'Categories', {
            partitionKey: { name: 'PK', type: aws_dynamodb_1.AttributeType.STRING },
            sortKey: { name: 'SK', type: aws_dynamodb_1.AttributeType.STRING },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST
        });
        this.tagsTable = new aws_dynamodb_1.Table(this, 'Tags', {
            partitionKey: { name: 'PK', type: aws_dynamodb_1.AttributeType.STRING },
            sortKey: { name: 'SK', type: aws_dynamodb_1.AttributeType.STRING },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST
        });
        this.commentsTable = new aws_dynamodb_1.Table(this, 'Comments', {
            partitionKey: { name: 'PK', type: aws_dynamodb_1.AttributeType.STRING },
            sortKey: { name: 'SK', type: aws_dynamodb_1.AttributeType.STRING },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST
        });
    }
}
exports.BlogDynamoDB = BlogDynamoDB;
