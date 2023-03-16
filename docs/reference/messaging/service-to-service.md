---
sidebar_position: 1.2
---

# Cross-Service Subscription

Services can subscribe to Events from other Services by configuring Rules to forward events from one Event Bus to another.

:::tip
This is also known as "Bus to Bus Event Routing" ([read more](https://aws.amazon.com/blogs/compute/using-bus-to-bus-event-routing-with-amazon-eventbridge/)).
:::

## Subscribe to a Service's Events

In your `infra` code, you can use `subscribe` to forward events from one service to another. It will create an CloudWatch Event Rule to match events by their name and forward them to the other Service's Event Bus.

```ts
import { aws_events, aws_events_targets } from "aws-cdk-lib";

const A = new Service(..);
const B = new Service(..);

A.subscribe(B, {
  events: ["MyEvent"]
});
```

In the example above, all events with the name `"MyEvent"` will be sent from the source Event Bus of service `A` to the target Event Bus of service `B`. This allows you to easily route events between different services in your application, using the power and flexibility of AWS Event Bridge.

## Doing it Manually

You can also do this manually using the `aws_events.Rule` Construct if you want to customize the [Event Pattern](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html).

```ts
import { aws_events, aws_events_targets } from "aws-cdk-lib";

const A = new Service(..);
const B = new Service(..);

new aws_events.Rule(stack, "Rule", {
  // send from service A
  eventBus: A.events.bus,
  eventPattern: {
    // select all events with the name "MyEvent"
    detailType: ["MyEvent"]
  },
  targets: [
    // send to service B
    new aws_events_targets.EventBus(B.events.bus)
  ]
})
```

The `detail-type` of Events published in an Eventual Service will be the name of the event type.

```ts
export const myEvent = event("myEvent");
//                               ^ detail-type
```

The `detail` will be the event payload serialized as JSON.
