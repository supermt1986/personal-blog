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