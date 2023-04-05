---
sidebar_position: 4
---

# Create Task

Before we can finish our workflow, we need to create a task for the workflow to call.

In order to allow a human to complete a job in human time, we'll create an `AsyncTask` which can be completed in the future using it's Token.

By now, you've probably picked up on the pattern - first, create a new file for the task, `wait-for-approval.ts` and add the following code:

```ts
import { asyncResult, task } from "@eventual/core";

export const waitForApproval = task(
  "waitForApproval",
  async (input: { jobId: string; description: string }) => {
    return asyncResult<boolean>(async (token) => {
      // write the token into a database
    });
  }
);
```

The tasks's token will be stored in an `entity` to lookup later. We'll create the `entity` next.
