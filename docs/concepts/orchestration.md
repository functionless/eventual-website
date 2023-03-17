---
sidebar_position: 1
---

# Orchestration

Workflows simplify how developers orchestrate long-running, durable and stateful workflows in their service. Workflows are challenging because they can span long periods of time and have to deal with distributed systems problems such as race conditions. Eventual enables you to express these types of orchestrations using traditional programming techniques such as functions, if-else, loops, etc.

:::caution
Video
:::

## Workflows are the decision makers

The `workflow` is the "decider". It chooses what to do and when. It does not perform actual work - instead, work is done by activities. Workflows call activities - aka. orchestrate the work.

For example, to implement a workflow that will send a reminder email indefinitely on a daily schedule.

![](./making-decision.png)

You can achieve this with a while loop and async/await:

```ts
const reminderWorkflow = workflow("reminder", async (email: string) => {
  while (true) {
    await duration(1, "day");

    await sendReminder(email);
  }
});

const sendReminder = activity("sendReminder", async (email: string) => {
  await emailClient.send(email, "reminder message");
});
```

:::info
Workflows can wait for any amount of time, until a specific date and time, or until a condition or trigger is received - e.g the `await duration(1, "day")`. For more information see the [Time, Durations and Conditions](../reference/orchestration/workflow.md#time-durations-and-conditions) documentation.
:::

## Workflows co-ordinate People, Time and Services

Activities and Signals provide a mechanism for communication between external systems and a running workflow execution.

:::tip
Go see 1) 2) 3)
:::

## Workflows have _exactly-once_ semantics

When a Workflow calls performs a side-effect, such as calling an Activity, publishing an Event or starting a Timer, it is guaranteed to run exactly once. These semantics allow you to safely control when a side-effect is applied to an external system without worrying about race conditions or intermittent failures.

![](./side-effects.png)

## Workflows enable fault tolerance

Workflows and Activities can configure timeouts, retry policies and failure canaries (aka. "heartbeats"). These are then enforced by the platform, enabling you to put predictable boundaries on long-running tasks and limit the blast radius of errors reliably without hand-rolling your own coordination logic.

## Workflows control concurrency

## More Information

See the [Workflow](../reference/orchestration/workflow.md), [Activity](../reference/orchestration/activity.md) and [Signal](../reference/orchestration//signal.md) reference documentation for how to create and work with these concepts.

[View the Logs](../how-to/view-logs.md)
