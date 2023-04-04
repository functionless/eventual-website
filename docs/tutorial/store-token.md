---
sidebar_position: 6
---

# Store Token in DynamoDB

## Store the Task and its Token in DynamoDB

Head on back to to the `wait-for-approval.ts` task and create a DynamoDB client.

```ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DocumentClient, PutComand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const docClient = DocumentClient.from(dynamoClient);
```

Grab the DynamoDB Table (that we just created) from the environment variables:

```ts
const tableArn = process.env.TABLE_ARN!;
```

Finally, update the task to store the task and its token in DynamoDB.

```ts
import { task } from "@eventual/core";

export const waitForApproval = task(
  "waitForApproval",
  async (input: { taskId: string; description: string }) => {
    return asyncResult<boolean>(async (token) => {
      await docClient.send(
        new PutCommand({
          TableName: tableArn,
          Item: {
            taskId: input.taskId,
            token,
            description: input.description,
          },
        })
      );
    });
  }
);
```

:::tip
In this example, we're working with the low-level DynamoDB API. We recommend using [ElectroDB](https://github.com/tywalch/electrodb) instead which greatly simplifies the job of storing and querying records in DynamoDB.
:::
