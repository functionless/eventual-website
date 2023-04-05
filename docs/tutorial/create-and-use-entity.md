---
sidebar_position: 5
---

# Create Entity and Write to it

## Add an Entity to store our task tokens

Create a new file called `approval-jobs.ts` and add the following code:

```ts
import { entity } from "@eventual/core";

export interface ApprovalJob {
  taskToken: string;
  description: string;
}

export const approvalJobs = entity<ApprovalJob>("approvalJobs");
```

As you will see, this `entity` can be written to and read from throughout eventual.

## Store the Task and It's token in our Entity

Update the `task` handler to store the approval job and it's token.

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
