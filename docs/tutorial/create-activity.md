---
sidebar_position: 4
---

# Create Activity

Before we can finish our workflow, we need to create an activity for the workflow to call. This activity will store a token in a database that we will look up later.

By now, you've probably picked up on the pattern - first, create a new file for the activity, `wait-for-approval.ts` and add the following code:

```ts
import { activity } from "@eventual/core";

export const waitForApproval = activity(
  "waitForApproval",
  async (input: { taskId: string; description: string }) => {
    return asyncResult<boolean>(async (token) => {
      // write the token into a database
    });
  }
);
```
