---
sidebar_position: 1
---

# Event

An `Event` is a named schema for a message that can be emitted to a Service's [Bus](./bus.md) and then routed to a Service's [Subscriptions](./subscription.md) or [to other Services](./service-to-service.md).

## Create an Event

You can create an event by importing the `event` function from `@eventual/core` and passing it a name for the event:

```ts
import { event } from "@eventual/core";

export const myEvent = event("MyEvent");
```

This registers an event with the name `"MyEvent"` on the Event Bus.

## Emit an Event

You can then emit data to this event by calling the emit function on the event object and passing it the data you want to send:

```ts
await myEvent.emit({ message: "hello world" });
```

The function accepts multiple arguments for batch sending events.

```ts
await myEvent.emit(
  {
    prop: "value 1",
  },
  {
    prop: "value 2",
  }
);
```

## Subscribe to an Event

See the [Subscription](./subscription.md) page.

## Defining the type of an Event

By default, an event's type is `any`. This is easy and flexible, but also unsafe. To associate a type with an event, you can use the `<Type>` syntax when creating the event. For example:

```ts
export interface MyEvent {
  prop: string;
}

export const myEvent = event<MyEvent>("MyEvent");
```

This creates an event called `"MyEvent"` with a type of `MyEvent`. This ensures that when the event is emitted or subscribed to, the data adheres to the `MyEvent` interface.

```ts
await myEvent.emit({
  prop: "my value", // okay
});

await myEvent.emit({
  prop: 123, // error, prop must be a string
});

export const onMyEvent = subscription(
  "onMyEvent",
  {
    events: [myEvent],
  },
  async (event) => {
    event.key; // error, 'key' property does not exist
  }
);
```

By defining the type of an event, you can improve the safety and reliability of your application by catching errors at compile time rather than runtime, as well as self-documenting your code by clearly outlining the shape of the data that the event is expected to contain.

## Emit an Event from outside Eventual

To emit an event to a Service's Event Bus from outside Eventual, you will need to obtain the Event Bus's ARN. You can do this by accessing the `events.bus` property of the Service `Construct`, which is the Event Bus for the Service. For example, if you have a Service named `myService`:

```ts
const myService = new Service(..);

myService.events.bus; // <-- the Event Bus that belongs to "myService"
```

You can then provide this ARN to your external service, such as a Lambda Function, by adding it to the environment variables of the function. For example:

```ts
myFunction.addEnvironment(
  "MY_SERVICE_BUS_ARN",
  myService.events.bus.eventBusArn
);
```

Next, you will need to grant the external service permissions to emit events to the Event Bus. This can be done using the `grantEmit` method:

```ts
myService.events.grantEmit(myFunction);
```

With the necessary permissions and ARN in place, you can now use the [`PutEvents` API, provided by the AWS SDK v3 for JavaScript EventBridge Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-eventbridge/classes/puteventscommand.html)), to emit events to the Event Bus. For example:

```ts
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const client = new EventBridgeClient({});

export async function handler() {
  await client.send(
    new PutEventsCommand({
      Entries: [
        {
          DetailType: "MyEvents",
          Detail: `{ "prop": "value" }`,
          // the ARN of the Event Bus that belongs to `myService`
          EventBusName: process.env.MY_SERVICE_BUS_ARN,
        },
      ],
    })
  );
}
```

The `DetailType` property must be the name of the event, e.g. `MyEvents`:

```ts
const myEvent = event("MyEvent"); // <-- this is the DetailType
```

The `Detail` property must be a stringified JSON payload of the event's data that matches the type. For example:

```ts
interface MyEvent {
  prop: string;
}

const myEvent = event<MyEvent>("MyEvent");
```

The value of `Detail` must be a stringified JSON object with a single `prop` property with a value of type `string`. For example:

```json
{
  "prop": "value"
}
```
