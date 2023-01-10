---
title: What is Eventual?
sidebar_position: 1
---

# What is Eventual?

(2 minute video)

## Overview

Eventual is a code-first service and software development kit (SDK) that helps developers build event-driven systems using modern infrastructure-as-code. Eventual provides Plug-and-Play primitives that includes a powerful workflow engine that helps orchestrate APIs and choreograph events. Its composable service model is designed for building and evolving microservice architectures.

### Turing complete, imperative workflows

Eventual allows you to use the full power of TypeScript to build long-running, durable workflows with unlimited complexity - including operators, for-loops, try-catch, if-else, while, do-while, etc.

```ts
export const myWorkflow = workflow("myWorkflow", async (items: string[]) => {
  try {
    await Promise.all(
      items.map(async (item) => {
        if (isConditionTrue(item)) {
          await downStreamService(`hello ${item}`);
        }
      })
    );
  } catch (err) {
    console.error(err);
  }
});
```

### Serverless REST APIs

Easily create scalable, event-driven APIs with code-first routes.

```ts
import { api } from "@eventual/core";

api.post("/echo", async (request) => {
  return new Response(await request.text());
});
```

### Publish and Subscribe to Events

```ts
import { event } from "@eventual/core";

interface MyEvent {
  key: string;
}

export const myEvent = event<MyEvent>("MyEvent");

myEvent.onEvent((e) => {
  console.log(e.key);
});
```

### Unit test and simulate distributed systems

Easily unit test your service's business logic, including APIs, workflows, and event handlers, using your preferred testing practices and frameworks. Run tests locally or within your CI/CD pipeline to ensure your service is reliable and maintainable.

```ts
import { myWorkflow } from "../src/my-workflow";

const env = new TestEnvironment({
  entry: path.join(__dirname, "..", "src", "my-workflow.ts")
})

test("workflow should be OK", async () => {
  const execution = await env.startExecution(myWorkflow, ({
    hello: "world",
  });

  // advance time
  await env.tick(1);

  expect(await execution.getStatus()).toMatchObject({
    status: ExecutionStatus.SUCCESS
  });
});
```

### Debug production problems locally in your IDE

Replay problematic workflows in production locally and use your IDE's debugger to discover and fix problems.

![Debug Production](./debug-1.gif)

```
eventual replay execution <execution-id> --entry ./src/index.ts
```

### Integrate with Cloud Resources and Services

```ts
import { Slack, SlackCredentials } from "@eventual/integrations-slack";
import { AWSSecret } from "@eventual/aws-client";

const slack = new Slack("my-slack-connection", {
  credentials: new JsonSecret<SlackCredentials>(
    new AWSSecret({
      secretId: process.env.SLACK_SECRET_ID!,
    })
  ),
});

// register a webhook for a slack command
slack.command("/ack", async (request) => {
  await sendSignal(request.text, "ack");
  request.ack();
});

export const task = workflow("task", async (request) => {
  await expectSignal("ack");

  // publish a message to slack from a workflow
  await slack.client.chat.postMessage({
    channel: request.channel,
    text: `Complete: ${request.task}`,
  });
});
```
