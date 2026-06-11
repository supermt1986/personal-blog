import { Construct } from 'constructs'
import { Table, BillingMode, AttributeType } from 'aws-cdk-lib/aws-dynamodb'

export class BlogDynamoDB extends Construct {
  public readonly postsTable: Table
  public readonly categoriesTable: Table
  public readonly tagsTable: Table
  public readonly commentsTable: Table

  constructor(scope: Construct, id: string) {
    super(scope, id)

    this.postsTable = new Table(this, 'Posts', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST
    })

    this.categoriesTable = new Table(this, 'Categories', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST
    })

    this.tagsTable = new Table(this, 'Tags', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST
    })

    this.commentsTable = new Table(this, 'Comments', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST
    })
  }
}