---
sidebar_position: 7
---

# Create Approval Command

Let's add another command, `completeTask`, to approve or deny the task.

```ts
import { waitForApproval } from "./wait-for-approval.js";

export const completeTask = command(
  "completeTask",
  async (input: { taskId: string; approved: boolean }) => {
    // todo
  }
);
```

This command will take a reference to the `taskId` to complete and a boolean `approved` indicating "approved" when `true` or "denied" when `false`.

First, look up the Task in DynamoDB:

```ts
const response = await docClient.send(
  new GetCommand({
    TableName: tableArn,
    Key: {
      taskId: input.taskId,
    },
  })
);
```

Then, throw a `404` error if the task doesn't exist.

```ts
if (response.Item === undefined) {
  throw new HttpError({
    code: 404,
    message: `task with ${input.taskId} is not found`,
  });
}
```

:::info
See the [HttpError](/reference/api/command#httperror) documentation.
:::

Finally, call `sendActivitySuccess` on the `waitForApproval` activity to complete the async activity.

```ts
// send the result for the activity
await waitForApproval.sendActivitySuccess({
  activityToken: response.Item.token,
  result: input.approved,
});
```

:::info
See the [Async Activity](/reference/orchestration/activity#async-activity) documentation.
:::
