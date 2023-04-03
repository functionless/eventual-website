---
sidebar_position: 5
---

# Task

A task is a function that can be called from within a [Workflow](./workflow.md). Its purpose is to encapsulate integration logic such as database calls, API calls, or waiting for humans/other long-running operations to complete from within a workflow. Tasks provide a way to abstract away the implementation details of these integrations and allow them to be reused across different workflows.

## Create a task

To create a task, you will need to import the `task` function from the `@eventual/core` library:

```ts
import { task } from "@eventual/core";
```

Then, you can define a task by providing a unique name and its implementation as an asynchronous function:

```ts
const sendEmail = task("sendEmail", async (to: string, body: string) => {
  // send the email using a third-party email service
});
```

## Call a task from within a Workflow

To call a task from within a workflow, you can simply await the task function like you would any other asynchronous function:

```ts
workflow("send-email-workflow", async (input: { to: string; body: string }) => {
  await sendEmail(input.to, input.body);
});
```

## Async Task

Async tasks are a way to perform work that takes longer than the maximum 15 minute runtime of an AWS Lambda function. They allow you to return a `token` from the task function, which can be used to succeed or fail the task at a later time. This is useful when you need to wait for a human to complete a task or for an expensive process to run on a cluster.

To create an async task, you will need to import the `asyncResult` function from the `@eventual/core` library and return its result as the task's result:

```ts
import { asyncResult } from "@eventual/core";

const asyncHello = task("hello", async (name: string) => {
  return asyncResult((token) => {
    // do something with the token, such as storing it in a database
  });
});
```

This will cause the workflow to wait for the token to be succeeded or failed before moving on to the next step.

### `sendTaskSuccess`

The `sendTaskSuccess` method is used to mark an asynchronous task as successfully completed. This is done by providing the task's token and the result of the task. This method is typically called after the task has been performed and the result has been computed.

```ts
api.post("/ack/:token", async (request) => {
  await asyncHello.sendTaskSuccess({
    taskToken: token,
    result: `hello world`,
  });
});
```

### `sendTaskFailure`

The `sendTaskFailure` method is used to mark an asynchronous task as failed. This is done by providing the task's token and the error that caused the failure. This method is typically called when an error occurs during the performance of the task.

```ts
api.post("/fail/:token", async (request) => {
  await asyncHello.sendTaskFailure({
    taskToken: token,
    error: new Error("failure"),
  });
});
```

### Explicit Return Type

The `asyncResult` function allows you to specify the expected return type of an async task. This can be helpful for ensuring type safety and avoiding runtime errors.

To specify the return type of an async task, provide a type parameter to `asyncResult`:

```ts
return asyncResult<string>((token) => {
  // do something with the token, such as storing it in a database
});
```

The return type of the task function will be `Promise<string>`. This means that, when calling the `sendTaskSuccess` function, the `result` field must be of type `string`.

```ts
const myTask = task("myTask", async () => {
  return asyncResult<string>((token) => {
    // do something with the token
  });
});

await myTask.sendTaskSuccess({
  result: "hello world", // valid
});

await myTask.sendTaskSuccess({
  result: 123, // invalid, number is not a string
});
```

If you do not specify the return type of an async task, it will be inferred as `any`. This means that the return type of the task function will be `Promise<any>`, and there will be no type checking when calling complete. It is generally a good idea to specify the return type of an async task to ensure type safety and avoid potential runtime errors.

### Succeed a task from outside Eventual

TODO

Tracking: https://github.com/functionless/eventual/issues/137

## Timeout

A task can be configured to fail if it does not succeed within a specified time frame. To do this, use the `timeoutSeconds` property when defining the task.

For example, the following task will fail if it does not succeed within 100 seconds:

```ts
export const timedOutWorkflow = workflow(
  "timedOut",
  { timeoutSeconds: 100 },
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 101 * 1000));
  }
);
```

You can then handle a timeout error within a workflow by catching the `Timeout` error.

```ts
try {
  await timedOutWorkflow();
} catch (err) {
  if (err instanceof Timeout) {
    // the task timed out
  }
}
```

## Heartbeat

The Heartbeat feature in Eventual allows you to configure a task to report its progress at regular intervals while it is executing. This can be useful in cases where a task is performing a long-running task and you want to ensure that it is still making progress and has not gotten stuck.

To use the Heartbeat feature, you can specify the `heartbeatSeconds` property when defining your Task. This property specifies the interval, in seconds, at which the Task is required to report a heartbeat. If the Task does not report a heartbeat within this interval, it will be considered failed and a `HeartbeatTimeout` exception will be thrown.

Here is an example of how to define a task with a heartbeat interval of 10 seconds:

```ts
const taskWithHeartbeat = task(
  "taskWithHeartbeat",
  {
    // configure this task to be required to report a heartbeat every 10 seconds
    heartbeatSeconds: 10,
  },
  async (workItems: string[]) => {
    for (const item of workItems) {
      // perform some work
      await processItem(item);
      // report a heartbeat back
      await sendTaskHeartbeat();
    }
  }
);
```

To report a heartbeat from within your Task, you can call the `sendTaskHeartbeat` function included in the `@eventual/core` library. This function should be called at regular intervals to ensure that the required heartbeat interval is met.

```ts
import { heartbeat } from "@eventual/core";

await heartbeat();
```

When calling a task with the Heartbeat feature from within a Workflow, you can catch the `HeartbeatTimeout` exception to handle cases where the Task has failed due to a heartbeat timeout:

```ts
try {
  await taskWithHeartbeat();
} catch (err) {
  if (err instanceof HeartbeatTimeout) {
    // the task did not report heartbeat in time
  }
}
```

## Supported Intrinsic Functions

Alongside the task-specific intrinsics already mentioned, the following intrinsic functions can also be called within a task handler:

- [`publishEvent`](../messaging/event.md#publish-to-an-event)

```ts
await myEvent.publishEvent({ .. });
```

- [`startExecution`](./workflow.md#start-execution)

```ts
await myWorkflow.startExecution({
  input: <input payload>
})
```

- [`sendTaskSuccess`](#sendtasksuccess)

```ts
await myTask.sendTaskSuccess({
  token: <token>,
  result: <result>
})
```

- [`sendTaskFailure`](#sendtaskfailure)

```ts
await myTask.sendTaskFailure({
  token: <token>,
  error: <error>
})
```
