---
sidebar_position: 4
---

# Create Task

Before we can finish our workflow, we need to create an task for the workflow to call. This task will store a token in a database that we will look up later.

By now, you've probably picked up on the pattern - first, create a new file for the task, `wait-for-approval.ts` and add the following code:

```ts
import { task } from "@eventual/core";

export const waitForApproval = task(
  "waitForApproval",
  async (input: { taskId: string; description: string }) => {
    return asyncResult<boolean>(async (token) => {
      // write the token into a database
    });
  }
);
```
