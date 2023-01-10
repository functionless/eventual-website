---
title: What is Eventual?
sidebar_position: 1
---

# What is Eventual?

Eventual is a code-first service and software development kit (SDK) that helps developers build event-driven systems using modern infrastructure-as-code (IaC).

:::caution Video Coming Soon
Stay tuned for an introductory video
:::

## Service

Eventual is all about building and connecting microservices that expose useful capabilities as APIs and Event streams all orchestrated by a durable Workflow engine.

### Service Construct

For example, you can use the [`Service`](../reference/service.md) Construct to deploy an fully functional service.

```ts
new Service(this, "invoice-service", {
  entry: require.resolve("@my-company/invoice-service"),
});
```

This includes an API Gateway, Event Bus and Workflow engine, all running within your own AWS account.

### Composing and Evolving Services

Services are designed to be composable and evolvable.

For example, you can route events between services, making it easy to separate concerns and add new Services over time.

```ts
import { orderEvent } from "@my-company/order-service";

invoiceService.subscribeTo({
  service: orderService,
  events: [orderEvent],
});
```

## Building Blocks

The business logic of a Service is built with plug-and-play primitives that are coordinated by a powerful workflow engine.

### API

For example, you can declare a route on a Service's REST API with the [`api`](../reference/api.md) primitive:

```ts
api.post("/invoice", async (request) => {
  const item = await request.json();
  await invoiceDB.putItem(item);
});
```

:::info How it works
Eventual analyzes your code to detect this route and automatically register it on the API Gateway. Eventual does similar work for all primitives.
:::

### Event

Events are records of something that has occurred within a Service that other components and services listen and react to.

They can be easily created with the [`event`](../reference/event.md) primitive:

```ts
const orderEvent = event("Order");
```

... and then subscribed to:

```ts
orderEvent.onEvent((event) => {
  // process order
});
```

... published to:

```ts
await orderEvent.publishEvents({
  orderId,
  orderTime,
});
```

... and routed between Services:

```ts
invoiceService.subscribeTo({
  service: orderService,
  events: [orderEvent],
});
```

:::info
You can publish an event from APIs, Event Handlers, Workflows, Activities or even from outside Eventual.
:::

:::tip

The schema for an Event can be defined in code to catch errors at compile time, improve IDE auto-completion and generate documentation.

```ts
interface OrderEvent {
  orderId: string;
  orderTime: string;
}

const orderEvent = event<OrderEvent>("Order");

orderEvent.onEvent((event) => {
  event.id; // Error!!! property 'id' does not exist on type OrderEvent
});
```

:::

### Workflows

Workflows are the powerhouse of Eventual Services. With them, you can build long-running, durable processes with the expressivity and flexibility of ordinary imperative code.

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
This may look like a typical function but it's actually a long-running durable workflow that can span days, months or even years without failure.
:::

:::tip
Workflows provide runtime guarantees that can't be ordinarily achieved within APIs, Event Handlers or Activities. They are the glue that coordinates time, connects services and makes them reliable.
:::

### Activity

An [Activity](../reference//activity.md) is a logical unit of work that can be called from a workflow. Workflows do the orchestration while Activities perform the actual work!

For example, a function to integrate with teh Stripe API to charge Credit Cards.

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

Services live in the real world where information is constantly changing and flowing. You can use Signals to send information into a running workflow and change its course, for example to cancel an order that is inflight.

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

### Integrations

Services don't operate within a vacuum. Eventual's powerful orchestration capabilities are designed to integrate with any Cloud Resource or SaaS product.

For example, Eventual has no opinion on your choice of database - so you can use DynamoDB to store and retrieve data:

```ts
api.post("/user", async (request) => {
  await dynamoClient.putItem({
    TableName: process.env.TABLE_NAME,
    Item: await request.json(),
  });
});
```

:::note
Integrations go far beyond just AWS Resources though. For example, perhaps you want to register a webhook in Slack:

```ts
const slack = new Slack("my-slack-connection", { credentials });

slack.command("/hello", (request) => {
  request.ack("hello world");
});
```

:::

## Local Simulation and Testing

## CLI
