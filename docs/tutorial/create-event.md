---
sidebar_position: 8
---

# Create Event

When the approval process is complete, we want to send an event so other processes can react to the completion, record metrics, or clean up.

In a new file called `job-approved.ts` add the following code:

```ts
import { event } from "@eventual/core";

export const jobApproved = event<{ jobId: string; approved: boolean }>(
  "jobApproved"
);
```

We'll use this next when we finish the workflow.
