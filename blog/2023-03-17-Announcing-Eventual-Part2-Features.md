---
title: Announcing Eventual Part 2 - Features
description: Block
slug: walkthrough-of-eventual-features
authors:
  - name: Sam Goodwin
    title: Co-creator of Eventual
    url: https://github.com/sam-goodwin
    image_url: https://avatars.githubusercontent.com/u/38672686?v=4
tags: [hello, eventual]
image: https://i.imgur.com/mErPwqL.png
hide_table_of_contents: false
---

In the previous part, [Announcing Eventual Part 2 - Features](./2023-03-17-Announcing-Eventual-Part2-Features.md), we introduced the philosophy behind Eventual. How we envision a world where programming massively scalable, distributed systems in the cloud is as simple as writing local programs. In this second part, we'll give an overview of Eventual's features and developer experience.

## Service

The `Service` is the top-level Concept of Eventual. It's a totally encapsulated micro-service deployable with a simple Construct that can be instantiated in an AWS CDK or Pulumi application.

It takes only 4 lines of code to deploy an entire micro-service to AWS:

```ts
const myService = new Service(this, "Service", {
  name: "my-service",
  // point it at where your backend code NPM package is
  entry: require.resolve("@my/service"),
});
```

Each Service has its own API Gateway, Event Bus and Workflow engine. And, because it’s all just Infrastructure-as-Code, it can be customized to your heart’s content.

The business logic of the Service is automatically discovered by analyzing the `entry` point of your code. In there are `Commands`, `Events`, `Subscriptions`, `Workflows`, `Tasks` and `Signals`.

## APIs

What would a service without APIs? Answer: not much. As mentioned, each Service comes with its own API Gateway that you can register routes on using Commands (RPC) or a HTTP router.

### Command - i.e. RPC

A **Command** is simply a function that can be called over HTTP - aka. Remote Procedure Call (RPC). It has a simple input/output contract - it takes one argument as input and returns a value as output.

```ts
export const hello = command("hello", async (name: string) => {
  return `hello ${name}`;
});
```

Each command is automatically added as a route on your Service’s API Gateway and invokes a dedicated, individually tree-shaken AWS Lambda Function. This enables you to tweak and tune the memory, timeout (and any other properties) for individual API routes.

APIs are exposed to the outside world, so it's important to provide a schema to validate requests. Eventual integrates with Zod for defining schemas.

```ts
export const hello = command(
  "hello",
  {
    input: z.string(),
  },
  async (name) => {
    return `hello ${name}`;
  }
);
```

These schemas are then used for runtime validation in your Function, but also to generate an OpenAPI spec and attach it to your API Gateway. This ensures your Lambda Function is only invoked if the data is valid according to the schema - a good practice.

Calling commands from another application, for example your frontend react application, can be achieved without any code generation using the `ServiceClient`. And it’s all type-safe.

```ts
import type * as MyService from "@my/service";

const client = new ServiceClient<typeof MyService>({
  serviceUrl: process.env.SERVICE_URL!,
});

await client.hello("sam");
```

Simply, import the types of your backend into the consuming application and instantiate a client. In this case `@my/service` points to a separate NPM package containing the service code. You can then directly call commands as if they were in the same code-base, while also promoting sensible separation of concerns.

### REST (i.e. raw HTTP)

If you need to register raw HTTP routes, such as `GET`, `PUT`, `POST`, `PATCH`, etc., you can always use the `api` router.

```ts
api.get("/hello", async (request) => {
  return new Response("OK");
});
```

Similar to Commands, reach route translates to an individual Lambda Function invoked by your API Gateway.

### Middleware

Commands and HTTP routes can integrate with middleware chains that perform functions such as validating requests, setting headers, authorizing and fetching user information.

To create a Command with middleware, use the `api.use` utility to first create a middleware chain, and then finally created the command.

```ts
export const hello = api
  .use(cors)
  .use(authorized)
  .command("hello", async (name: string, { user }) => {
    // etc.
  });
```

## Messaging

The next aspect of an event-driven micro-service is Messaging. In Eventual, we provide Events and Subscriptions for passing messages around within and outside a Service.

When something happens in a service, it’s often a good idea to record it as an “event” and emit it to an Event Bus so other parts of your system can react to it. They’re also useful for logging and analytical use-cases, among many others. This is known as “Choreography”

Subscriptions have the benefit of decoupling the emitter of an event from the subscriber. This simplifies how you evolve your system over time as you can always add more subscribers without disrupting other parts of your service.

### Event

In Eventual, you declare **Event** types:

```
export const HelloEvent = event("HelloEvent");
```

You can then emit an event from anywhere using the `emit` function:

```
await HelloEvent.emit({ key: "value"});
```

Sticking with our theme of TypeScript and type-safety, Eventual supports declaring a type for each event - and we highly encourage you to do so. There’s nothing worse than un-typed code.

```ts
export const HelloEvent = event<{
  key: string;
}>("HelloEvent");
```

And for that extra level of safety, you can also use Zod to define a schema for runtime validation.

```ts
export const HelloEvent = event("HelloEvent", z.object({
  key: z.string().min(1)
});
```

### Subscription

To process events, you create a **Subscription** to one or more event types.

```ts
export const onHelloEvent = subscription(
  "onHelloEvent",
  {
    events: [HelloEvent],
  },
  async (event) => {
    console.log(event.key);
  }
);
```

Each Subscription will automatically create a new Lambda Function, Event Bridge Rule and a SQS Dead Letter Queue.

Your function will be invoked by AWS Event Bridge for each event that matches the selection and any messages that fail to be processed will be safely stored in the dead letter queue for you to deal with as a part of your operational procedure.

## Orchestration

When we talk about programming the cloud like a local machine, there’s just no getting around the distributed nature of it. Everything fails, all the time. So, orchestrating business logic that interacts with people, time and services is a challenging task.

### Workflow

The most powerful piece of Eventual is most definitely the **Workflow**. In Eventual, you can orchestrate long running, durable workflows using plain TypeScript - such as if-else, loops, functions, async/await, and all that goodness. This gives you an expressive, Turing complete way to implement business logic, however complex, distributed or time-dependent it may be.

Workflows are where you put control-flow logic. Eventual ensures your code runs exactly as written, in a fault tolerant way such that you do not need to worry about things like transient failures, race conditions, temporary outages, or runtime duration etc.

For example, the below code implements a workflow that will send an email to a user every day. It will loop forever, sleep for a day and then send an email.

```ts
export const emailDaily = workflow("emailDaily", async (email: string) => {
  while (true) {
    await duration(1, "day");

    // send an email to the user every day
    await sendEmail(email);
  }
});
```

With Eventual, your code can run forever, even sleep forever. We achieve this feat using serverless primitives behind the scene to allow you to program distributed systems with the mental model of a local machine.

### Task

Workflows are not where you do actual work, such as interacting with a database. They are purely for deciding what to do and when. Instead, you separate out side-effects into what are called **Tasks**.

A task is a function that runs in its own AWS Lambda Function and can be invoked by a Workflow with exactly-once guarantees.

```ts
export const getUser = task("getUser", async (userId: string) => {
  return client.getItem({
    TableName: process.env.TABLE_NAME,
    Key: { userId },
  });
});
```

If you call a task, you can be sure it will run exactly once, which enables you to safely control when you interact and change resources such as database records.

You can also configure things like a retry policy that the platform will enforce, as well as protections such as heartbeats.

```ts
task(
  "getUser",
  {
    // require a heartbeat every 30s
    heartbeatTimeout: duration(30, "seconds"),
  },
  async (userId: string, ctx) => {
    await ctx.sendHeartbeat();
  }
);
```

### Signal

**Signals** are messages that can be sent into a running workflow. They’re useful for integrating other parts of your application into a workflow, for example having a person approve something before continuing.

Creating a Signal is very similar to creating an Event type. All you need is a name and an optional type.

```ts
export const userEmailChanged = event<string>("userEmailChanged");
```

You can then use `expectSignal` within a workflow to pause execution until such information is received:

```ts
await userEmailChanged.expectSignal();
```

Or register a callback to be invoked whenever a signal is received:

```ts
userEmailChanged.onSignal(async (newAddress) => {
  emailDaily(newAddress);
});
```

Signals are a powerful tool for building capabilities around workflows, for example human-in-the-loop systems where a UI or CLI can send data into a workflow to influence it.

This is barely scratching the surface of workflow orchestration - to learn more visit [eventual.ai](http://eventual.ai/).

## Testing

Testing distributed systems is difficult because of how fragmented the system is physically. It can be impossible or impractical to reproduce timing and race conditions in a real-world system with integration tests.

In Eventual, you can test any function locally. We also provide a `TestEnvironment` utility that gives fine-grained control over time and the underlying system, so that you can target tests towards those tricky edge cases.

You can write tests for your workflows with per-second granularity, up to extremes such as days, months or even years.

```ts
test("workflow should wait 1 second before completing", async () => {
  const execution = await env.startExecution(myWorkflow, "input");

  expect(await execution.getStatus()).toBe("PENDING");

  // advance time by 1 second
  env.tick(1);

  expect(await execution.getStatus()).toBe("SUCCESS");
});
```

This test starts workflow, asserts that it is running, then explicitly advances time by 1 second, and then asserting that the workflow completed successfully. This form of control allows you to craft deterministic tests for timing and race conditions.

## Local Simulation

An entire Eventual service can be simulated locally. Simply run the `eventual local` command to stand up a server on `localhost:9000` which can be interacted with on your local machine.

```ts
eventual dev
```

Set breakpoints in your code and step-through any part of your application.

Even parts that span multiple cloud services, such as APIs emitting Events, that trigger Subscriptions, that then trigger Workflows, and so on.

The entire control flow can be walked through within the context of a single NodeJS runtime.

## Debug Time Machine

Imagine the scenario where you’ve been paged at 2am in the morning because one of your workflows broke for some unknown reason.

Eventual provides what we call the “Debug Time Machine” that allows you to replay a workflow execution that already ran (or is still running) in production, locally, so you can debug from the comfort of your IDE.

Simply take the workflow execution ID and run the `eventual replay` CLI command.

```
eventual replay --execution-id <execution-id>
```

This will download the workflow’s history and run everything locally. You can then attach your debugger, for example with VS Code, and step through everything that happened as if it’s happening in real-time. Inspect variables, look at the returned values of tasks, identity and fix the bug.

## A note on end-to-end Type Safety

This blog is getting a bit long, it’s hard to fit it all in! We’ll finish with a note on how Eventual really goes the extra mile when it comes to “end-to-end type safety”.

We use types to map everything back to the source, from your frontend → to your service implementation → and finally to its infrastructure configuration. This makes refactoring as easy as following those red squiggly lines. If your code compiles, you can be pretty confident it’s working - or at least that there’s no stupid mistakes 😉.

As previously mentioned, you can use the `ServiceClient` to call your Commands without generating any code. Simply import the types of your backend code and instantiate the client.

```ts
import type * as MyService from "@my/service";

const client = new ServiceClient<typeof MyService>({
  serviceUrl: process.env.SERVICE_URL!,
});

await client.hello("sam");
```

The same goes for when you’re configuring infrastructure. Import the types of the backend and then safely customize and integrate with each of the pieces of generated infrastructure.

```ts
import type * as MyService from "@my/service";

const service = new Service<typeof MyService>(this, "Service", {
  commands: {
    // safely configure any of the commands
    hello: {
      environment: { .. }
    }
  }
});

// safely access any generated infrastructure

// such as the hello Command's Lambda Function
service.commands.hello;

// or a Subscription's dead letter queue
service.subscriptions.onHelloEvent.deadLetterQueue
```

## Conclusion

That does it for now. To learn more, visit eventual.ai, star us on GitHub, follow us on twitter, and please, come chat to us on Discord. We’d love to hear from you

We want to help you build scalable cloud services. And we want it to be fast and we want it to be fun .
