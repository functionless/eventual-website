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

:::info
An `entity` provides a key-value store for storing structured data in DynamoDB.
:::
