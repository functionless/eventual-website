---
sidebar_position: 5
---

# Create DynamoDB Table

## Add a DynamoDB Table to store our Tasks and their Tokens

Eventual does not currently provide a database out of the box. Instead, Eventual can be easily integrated with other services using the CDK.

To store our tasks, we'll create a DynamoDB Table and give our Service access to it. Head on over to `infra/src/app.ts`.

You'll see some code like this:

```ts
import { App, Stack, CfnOutput } from "aws-cdk-lib";
import { Service } from "@eventual/aws-cdk";

const app = new App();
const stack = new Stack(app, "tutorial");

import type * as tutorial from "@tutorial/service";

const service = new Service<typeof tutorial>(stack, "Service", {
  name: "tutorial",
  entry: require.resolve("@tutorial/service"),
});
```

This is where we can create and configure AWS Resources using the AWS CDK.

First, import and create a DynamoDB Table using the CDK.

```ts
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";

const table = new Table(stack, "Table", {
  partitionKey: {
    name: "taskId",
    type: AttributeType.STRING,
  },
  billingMode: BillingMode.PAY_PER_REQUEST,
});
```

Next, inject the table's ARN as an environment variable into the Service:

```ts
service.addEnvironment("TABLE_ARN", table.tableArn);
```

Then, grant the service read and write access permissions:

```ts
table.grantReadWriteData(service);
```

Finally, deploy the service:

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";

<Tabs groupId="npm">
  <TabItem value="npm" label="npm" default>
    <CodeBlock>npm run deploy</CodeBlock>
  </TabItem>
  <TabItem value="yarn" label="yarn">
    <CodeBlock>yarn deploy</CodeBlock>
  </TabItem>
  <TabItem value="pnpm" label="pnpm">
    <CodeBlock>pnpm run deploy</CodeBlock>
  </TabItem>
</Tabs>

✅ Done - we have created a DynamoDB Table and have access to it in our Service code.

## Install DynamoDB dependencies

Add `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` to your `packages/service/package.json`.

```json
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3",
    "@aws-sdk/lib-dynamodb": "^3"
  }
}
```

And then install the dependencies:

<Tabs groupId="npm">
  <TabItem value="npm" label="npm" default>
    <CodeBlock>npm i</CodeBlock>
  </TabItem>
  <TabItem value="yarn" label="yarn">
    <CodeBlock>yarn</CodeBlock>
  </TabItem>
  <TabItem value="pnpm" label="pnpm">
    <CodeBlock>pnpm i</CodeBlock>
  </TabItem>
</Tabs>
