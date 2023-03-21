---
sidebar_position: 3
---

# Create Workflow

Let's now create a workflow for orchestrating the approval process. We'll then update our `submitTask` command to invoke it.

First, create a new file, `approval-process.ts` and create a workflow.

```ts
import { workflow } from "@eventual/core";

export const approvalProcess = workflow(
  "approvalProcess",
  async (description: string) => {
    // TODO
  }
);
```

:::caution Remember to re-export
Remember to go back to your `index.ts` and re-export the workflow

```ts
export * from "./approval-process.js";
```

:::

:::tip
It is not necessary to create a file for each command, workflow, etc. It's just usually a good practice to organize your business logic into individual files with easy-to-understand names.
:::
