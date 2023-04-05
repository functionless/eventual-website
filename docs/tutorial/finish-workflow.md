---
sidebar_position: 9
---

# Finish Workflow

Now let's update the workflow to complete the flow.

## Update Workflow

In `approval-process.ts`, update the workflow to call the `wait-for-approval` task and then emit the `jobApproved` event.

```ts
import { workflow } from "@eventual/core";
import { jobApproved } from "./job-approved.js";
import { waitForApproval } from "./wait-for-approval.js";

export const approvalProcess = workflow(
  "approvalProcess",
  async (description: string, context) => {
    const result = await waitForApproval({
      jobId: context.execution.id,
      description: description,
    });

    await jobApproved.emit({ jobId: context.execution.id, approved: result });

    if (result) {
      return "Job was approved";
    }
    return "Job was not approved.";
  }
);
```

The workflow will invoke the task and wait indefinitely until the task is completed.

:::info
For information on configuring timeouts and heartbeats, see the documentation for [tasks](../reference/orchestration/task.md) and [workflows](../reference/orchestration/workflow.md).
:::
