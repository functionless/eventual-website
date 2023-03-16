---
title: What is Eventual?
sidebar_position: 1
---

# What is Eventual?

Eventual is a Software Development Kit (SDK) that for building micro-services in AWS using pure TypeScript and modern Infrastructure-as-Code (IaC) such as the AWS CDK, SST, Pulumi and Terraform (coming soon!).

:::caution Video Coming Soon
Stay tuned for an introductory video
:::

## Service

The top-level Concept of Eventual is a Service consisting of APIs, Events, Subscriptions, Workflows and Activities.

![Service Contract](../reference/service-contract.png)

### Construct

Each of these pieces are discovered and deployed with [`Service` Construct](../reference/service.md) in an AWS CDK or Pulumi application.

```ts
new Service(this, "invoice-service", {
  entry: require.resolve("@invoicing/service"),
});
```

### Command (RPC)

A [Command](../reference/api/command.md) is a Remote Procedure Call - a Function that can be called over HTTP.

```ts
export const sendInvoice = command("sendInvoice", async (invoice: Invoice) => {
  await invoiceDB.putItem(item);
});
```

### HTTP

Commands are an opinionated RPC interface that streamline the development of APIs. In some case, you need access to the raw HTTP protocol.

For this, Eventual integrates with [`itty-router`](https://github.com/kwhitley/itty-router) to provide a bare-bones HTTP router with the Node Fetch types.

```ts
api.get("/hello", async (request) => {
  return new Response("OK");
});
```

### Middleware

Middleware chains perform functions such as validating requests, setting headers, authorizing and fetching user information for Commands and HTTP routes.

```ts
export const hello = api
  .use(cors)
  .use(authorized)
  .command("hello", async (name: string, { user }) => {
    // etc.
  });
```

### Workflows

Workflows are the powerhouse of Eventual. With them, you can build long-running, fault tolerant processes with the expressivity and flexibility of ordinary imperative code.

```ts
const processOrderWorkflow = workflow("order", async (order: Order) => {
  const charge = await chargeCreditCard(order.source, order.amount);

  try {
    await dispatchOrder(order);
  } catch {
    await chargeBack(charge.chargeId);
  }
});
```

:::caution More than meets the eye
This may look like a typical function but it's actually a workflow that can span days, months or even years without failure.
:::

:::tip
Workflows provide runtime guarantees that can't be ordinarily achieved within APIs, Event Handlers or Activities. They are the glue that coordinates time, people and services in a reliable, predictable manor.
:::

### Activity

An [Activity](../reference/orchestration/activity.md) is a logical unit of work that can be called from a workflow. Workflows do the orchestration while Activities perform the actual work.

For example, a function to integrate with Stripe to charge Credit Cards:

```ts
const chargeCreditCard = activity(
  "chargeCC",
  async (source: string, amount: number) => {
    await stripe.charges.create({
      amount,
      source,
      currency: "usd",
    });
  }
);
```

### Signal

Services live in the real world where information is constantly flowing and changing. You can use Signals to send information into a running workflow and change its course, for example to cancel an order that is inflight.

```ts
const cancelSignal = signal("cancel");

const processOrder = workflow("processOrder", async (order: Order) => {
  cancelSignal.onSignal(async () => {
    await cancelOrder(order);
  });
});
```

:::info

Signals can be sent from anywhere within an Eventual application, for example an API:

```ts
api.post("/order/:orderId/cancel", async (request) => {
  await cancelSignal.sendSignal({
    executionId: request.params.orderId,
  });
});
```

:::

### Event

With pub/sub messaging, messages sent by the publisher are processed by different subscribers. Each consumer receives its own copy of the message for processing.

Events are records of something that has occurred (for example a change in the state of data within a Service) that other components and services listen to.

![](/img/pub-sub.svg)

They can be easily created with the [`event`](../reference/messaging/event.md) primitive:

```ts
const orderEvent = event("Order");
```

### Publish

... published to:

```ts
await orderEvent.publishEvents({
  orderId,
  orderTime,
});
```

### Subscription

... and then subscribed to:

```ts
export const onOrderEvent = subscription(
  "onOrderEvent",
  {
    events: [orderEvent],
  },
  async (event) => {
    // process order event
  }
);
```

### Cross-Service Subscription

... and routed between Services:

```ts
invoiceService.subscribe({
  service: orderService,
  events: ["OrderEvent"],
});
```

:::info
You can publish an event from APIs, Event Handlers, Workflows and Activities, or even from outside Eventual.
:::

## Testing

### Unit Testing

Eventual's [Unit Testing](../reference/unit-testing.md) library enables you to iterate on your application locally without wasting cycles waiting for deployments.

```ts
// advance the simulation's time
await env.tick();

// check the status of a running workflow has changed to SUCCESS
expect(await execution.getStatus()).toMatchObject({
  status: ExecutionStatus.SUCCESS,
});
```

:::info
The `env` variable points to a [`TestEnvironment`](../reference/unit-testing.md#testenvironment) which supports mocking components of a service such as Activities and Events, as well as controlling how time progresses.
:::

### Local Simulation

Eventual provides a dev server that simulates your Service locally, so you can quickly iterate on the business logic without deploying back and forth from the cloud.

```
eventual dev
```

Once started, you can observe how Commands, Workflows, Activities and Subscriptions behave within the context of a single Node Runtime for easy debugging in your IDE.

### Time Machine Debugging

Debugging distributed systems in the cloud is a near impossible task. Eventual's Time Machine Debugging feature allows you to replay a workflow execution that has already run (or is still running) locally within your IDE and debugger.

:::info Time travel like a boss 😎
Step through time and observe what actually happened, identify and fix the bug, add a test and push for victory!
:::

![](./debug-1.gif)

## Project Structure

Eventual creates a mono-repo set up.

```
├──infra/
├──packages/
├────service/
├──package.json
├──tsconfig.base.json
├──tsconfig.json
```

These are pretty common these days because, with just an extra bit of configuration, you can maintain and develop on multiple NPM packages together. This is particularly important when building in the cloud, as you may have multiple different (but related) projects, e.g. a Next.JS frontend, 1 or more Services and a CDK/Pulumi application for your infrastructure.

### Drop-in

Eventual can be dropped into existing applications. For example, [SST 2.0](https://sst.dev/) also adopts a mono-repo setup, making it straightforward to integrate Eventual into SST.

## End to End Type-Safety

Eventual really goes the extra mile when it comes to “end-to-end type safety”.

#### `ServiceClient` (frontend → backend)

The `ServiceClient` provides a type-safe client for your Service without any code generation. Simply import the types of your backend code and instantiate the client.

```ts
import type * as Invoicing from "@@invoicing/service";

const client = new ServiceClient<typeof Invoicing>({
  serviceUrl: process.env.SERVICE_URL!,
});

await client.sendInvoice({ .. });
```

#### `Service` (backend → infrastructure)

The same goes for when you’re configuring infrastructure.

```ts
import type * as MyService from "@my/service";

const service = new Service<typeof MyService>(this, "Service", {
  commands: {
    // safely configure any of the commands
    hello: {
      environment: { .. }
    }
  },
  activities: ..
  subscriptions: ..
});
```

## Eventual CLI

The Eventual CLI provides tools for local development and interacting with live Services.

You can perform tasks such as start workflows, check their status, get a service's endpoints, etc.

:::note
See the [Eventual CLI](../reference/cli.md) docs for more information.
:::
