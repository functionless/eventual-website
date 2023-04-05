---
sidebar_position: 2
---

# Create Command

Now it's time to start building. The first thing we'll do is create a Command for submitting jobs.

Create `packages/service/src/submit-job.ts`.

Import `command` from the `@eventual/core` library.

```ts
import { command } from "@eventual/core";
```

Then, export and create a command for submitting a task.

```ts
export const submitJob = command("submitJob", async (description: string) => {
  // for now, just return the input back
  return description;
});
```

Go back to `packages/service/src/index.ts` and export the file we just created.

```ts
export * from "./submit-job.js";
```

:::tip
For more information on why we re-export everything from the `index.ts`, see the [End-to-End Types and Schemas](/concepts/end-to-end-safety) documentation.
:::

Finally, restart the local server. This needs to be done between changes.

```
npx eventual local
```
