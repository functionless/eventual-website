---
sidebar_position: 5.1
---

# Store Job in Entity

`AsyncTask`s are considered to be running until their token is passed to the `sendTaskSuccess` or `sendTaskFailure` api.

We will store the task's token in our `approvalJobs` entity so that we can complete the task later.

Update the `task` handler in `wait-for-approval` to store the approval job and it's token:

```ts
import { asyncResult, task } from "@eventual/core";
import { approvalJobs } from "./approval-jobs.js";

export const waitForApproval = task(
  "waitForApproval",
  async (input: { jobId: string; description: string }) => {
    return asyncResult<boolean>(async (token) => {
      // we'll use the job ID as the unique ID
      await approvalJobs.set(input.jobId, {
        taskToken: token,
        description: input.description,
      });
    });
  }
);
```
