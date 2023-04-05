---
sidebar_position: 7
---

# Create Approval Command

Let's add another command, `completeJob`, to approve or deny the job. Name this file something like `complete-job.ts`.

```ts
import { command } from "@eventual/core";

export const completeJob = command(
  "completeJob",
  async (input: { jobId: string; approved: boolean }) => {
    // todo
  }
);
```

This command will take a reference to the `jobId` to complete and a boolean `approved` indicating "approved" when `true` or "denied" when `false`.

First, look up the Job in our `entity` from before:

```ts
const response = await approvalJobs.get(input.jobId);
```

Then, throw a `404` error if the job doesn't exist.

```ts
if (response === undefined) {
  throw new HttpError({
    code: 404,
    message: `job with ${input.jobId} is not found`,
  });
}
```

:::info
See the [HttpError](/reference/api/command#httperror) documentation.
:::

Finally, call `sendTaskSuccess` on the `waitForApproval` task to complete the async task.

```ts
// send the result for the task
await waitForApproval.sendTaskSuccess({
  taskToken: response.taskToken,
  result: input.approved,
});
```

:::info
See the [Async Task](/reference/orchestration/task#async-task) documentation.
:::

Here is the final `completeJob` command:

```ts
import { HttpError, command } from "@eventual/core";
import { waitForApproval } from "./wait-for-approval.js";
import { approvalJobs } from "./approval-jobs.js";

export const completeTask = command(
  "completeJob",
  async (input: { jobId: string; approved: boolean }) => {
    const response = await approvalJobs.get(input.jobId);

    if (response === undefined) {
      throw new HttpError({
        code: 404,
        message: `job with ${input.jobId} is not found`,
      });
    }

    await waitForApproval.sendTaskSuccess({
      taskToken: response.taskToken,
      result: input.approved,
    });
  }
);
```
