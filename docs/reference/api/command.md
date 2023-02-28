---
sidebar_position: 1
---

# Command

A Command is a function that takes a single input and returns a single output. It can be called over HTTP via RPC or (optionally) REST.

## Create a new Command

Import the `command` primitive from `@eventual/core` and create an instance.

```ts
import { command } from "@eventual/core";

export const hello = command("hello", async (name: string) => {
  return `hello ${name}`;
});
```

:::tip
It's recommended to use Zod to define at least your `input` schema so that your Command is protected from receiving invalid data. See the [Input Schema](#provide-an-input-schema-with-zod) docs for more information.
:::

## Call a Command

Use the [ServiceClient](./client.md) to interact with your service's Commands without code generation.

```ts
import type * as MyService from "@my-service/service";

const client = new ServiceClient<typeof MyService>({
  serviceUrl: process.env.SERVICE_URL,
});

const response = await client.hello("my name");
```

## Provide an `input` schema with Zod

Zod can be used to define a schema to protect your API. For example, we can re-write the previous `hello` command using zod to define the input type:

```ts
import { z } from "zod";

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

Eventual will automatically generate Open API 3.0 schemas and attach it to your API gateway. If the command is called with an input payload that does not match the schema, a `400 Bad Request` will be returned without ever hitting your Command's Lambda Function.

:::info
[Zod](https://github.com/colinhacks/zod) is a TypeScript library for defining schemas and validating data.
:::

## Provide an `output` schema with Zod

Similarly, you can specify the `output` schema also using Zod.

```ts
import { z } from "zod";

export const hello = command(
  "hello",
  {
    output: z.string(),
  },
  async (name: string) => {
    return `hello ${name}`;
  }
);
```

## Middleware

Commands can be integrated with middleware chains that perform functions such as validating requests, setting headers, authorizing and fetching user information.

To create a Command with middleware, use the `api.use` utility to first create a middleware chain, and then finally created the command.

```ts
export const hello = api
  .use(cors)
  .use(authorized)
  .command("hello", async (name: string, { user }) => {
    // etc.
  });
```

:::info
See the [Middleware](./middleware.md) documentation for more information.
:::

## Remote Procedure Call (RPC) API Route

All commands attach a RPC route to your Service's API Gateway with the following format:

```
POST /_rpc/${commandName}
```

It accepts a JSON payload body for the Command's input and returns the output as a JSON-encoded body.

:::tip
See the [RESTful API](#expose-a-command-as-a-restful-api) docs for information on how to also expose a Command as a REST APi.
:::

## Expose a Command as a RESTful API

Commands are built around RPC (input and output) for simplicity, but there are cases where exposing a RESTful API design is preferable to a RPC one. Commands can be configured as RESTful endpoints using the `method`, `path` and `params` properties.

For example, here we have a Command that sets a key-value pair in a database. By default, it is available to be called via `POST /_rpc/setKey`.

```ts
export const setKey = command(
  "setKey",
  {
    input: z.object({
      key: z.string(),
      value: z.string()
    }),
  },
  async (({key, value})) => {
    await db.set(key, value)
  }
);
```

To adapt it to a RESTful interface, we can specify `method`, `path` and `params`:

:::caution
Your input schema must be an object with properties.
:::

```ts
export const setKey = command(
  "setKey",
  {
    // available
    method: "POST",
    // the REST path endpoint
    // the key property comes from the path
    path: "/:key",
    params: {
      // the value comes from the body
      value: "body"
    },
    input: z.object({
      key: z.string(),
      value: z.string()
    }),
  },
  async (({key, value})) => {
    await db.set(key, value)
  }
);
```

This can now be called with the following API request:

```
POST /my-key
my-value
```

Which will be mapped to the following payload as input to the `setKey` command

```ts
{
  key: "my-key",
  value: "my-value",
}
```
