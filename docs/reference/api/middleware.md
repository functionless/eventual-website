---
sidebar_position: 2
---

# Middleware

Middleware are type-safe, composable functions that can be chained together to handle requests and make data available to Command and API handlers.

```ts
export const myAuthorizedCORSEnabledCommand = api
  .use(cors("my-domain"))
  .use(authorized)
  .command("myCommand", async (request: Request, { user }) => {
    user; // <- a context variable passed to us by the `authorized` middleware
  });
```

## Create a Middleware Chain

To create a middleware chain, import the `api` primitive from `@eventual/core`, call `.use` and pass in a function implementing the middleware contract (see: [Create a Middleware Function](#create-a-middleware-function)).

```ts
api.use(cors);
```

## Chain Middlewares

Middleware can be chained together with subsequent `use` calls:

```ts
api.use(cors).use(authorized);
```

## Create a Command

A `command` can then be created from a middleware chain:

```ts
export const myCommand = api
  .use(authorized)
  .command("myCommand", async (request: Request, { user }) => {
    user; // <- a context variable passed to us by the `authorized` middleware
  });
```

:::note
The `{ user }` data passed in as the second argument to the command's handler above is the `context` data produced by the middleware chain.
:::

## Create a low-level HTTP route

Middleware is also compatible with the [low-level HTTP interface](./http.md), allowing you to create `get`, `put`, `post`, etc. routes off of middleware chains.

```ts
api.use(authorized).get("/hello", async (request, { user }) => {
  return new Response("OK");
});
```

:::caution
It is highly recommended to use Commands instead of the low-level HTTP routes for simplicity, type-safety and flexibility.
:::

## Create a Middleware Function

In Eventual, an API Middleware is a function that accepts a `MiddlewareInput` and returns a `HttpResponse`.

`MiddlewareInput` contains the following properties:

- `request` - the raw HTTP request
- `context` - an object containing properties extracted by other middleware functions
- `next` - a function that, when called, will continue processing the request and return the response

For example, a simple middleware that injects CORS headers into the response is implemented below:

```ts
import { MiddlewareInput, MiddlewareOutput } from "@eventual/core";

/**
 * Middleware for injecting CORS headers in response.
 */
export async function cors<In>({
  next,
  request,
  context,
}: MiddlewareInput<In>): Promise<MiddlewareOutput<In>> {
  const response = await next(context);
  response.headers.put("Access-Control-Allow-Origin", "*");
  response.headers.put("Access-Control-Allow-Headers", "Authorization");
  return response;
}
```

The `next` function is called with the current `context` value. This returns a `HttpResponse` which is then modified before being returned.

:::note
Middleware in Eventual is slightly different than the equivalent found in popular frameworks like express. Instead of modifying the request object, middleware functions produce a `context` value that is passed through to the Command and API handler.
:::

## Middleware Context

Middleware functions can pass a `context` variable when calling `next`. This `context` value will then be passed to the next middleware in the chain or to the final Command/API handler as supplementary data.

For example, this can be useful for middleware that checks that a user is logged in and passes a `user` object through to the final handler:

```ts
export async function authorized<In>({
  request,
  next,
  context,
}: MiddlewareInput<In>) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    throw new HttpError({
      code: 401,
      message: "Expected Authorization header to be preset.",
    });
  }

  const user = await lookupUser(request.headers.get("authorization"));

  return next({
    ...context,
    user,
  });
}
```

A consumer of this middleware will receive a `context` object with the `user` property:

```ts
api.user(authorized).command("myCommand", async (request, { user }) => {
  user.userId; // <- use the context
});
```

## Accumulating Context

Middleware functions can pass any `context` value they wish. There is no requirement to respect or maintain any context from previous middleware chains.

That said, a common pattern is to accumulate context from all chains and pass it through as a combined object to the handler. To achieve this, middleware functions can specify a type parameter `<In>` to generically capture the type of the context passed to it by any previous middleware functions.

Let's take a closer look at the `authorized` example from before:

```ts
export async function authorized<In>({
  request,
  next,
  context,
}: MiddlewareInput<In>) {
  // <redacted>

  return next({
    // spread the context: In value
    ...context,
    // add the user
    user,
  });
}
```

When calling `next`, we can retain the previous context value, regardless of what it is, by simply combining the two objects with a spread:

```ts
next({
  // spread the context: In value
  ...context,
  // add the user
  user,
});
```

:::tip
Because this pattern is so common, we also provide the [`middleware`](#middleware-helper) helper function.
:::

## `middleware` helper

The `middleware` helper constructs a middleware function that automatically retains any `context` data passed into it. This is helpful for building generic middleware that plays nice with others. Instead of having to worry about defining generic functions and properly carrying context through, you can focus only on an individual case.

To demonstrate, let's re-write the `authorized` middleware:

```ts
export const authorized = middleware(
  ({ request, next, context }: MiddlewareInput<In>) => {
    // <redacted>

    return next({
      user,
    });
  }
);
```

Now, when calling `next`, we only need to worry about providing the new data from this middleware function. The `middleware` utility will take care of merging contexts

:::info
Context values are merged in a Last Value Wins. If a subsequent middleware function returns an object with a key that already exists, it will overwrite the previous value.
:::

### Returning Early/Short Circuiting

Middleware functions can "return early" or "short circuit" a request by choosing not to call `next` and instead return a `HttpResponse`. By not calling `next`, subsequent middleware chains and the final handler function will never be called. A `HttpResponse` can then be returned as the response instead.

This is useful for standardizing request validation and terminating a request early when it is invalid. For example: returning a `401` when a request does not contain an `Authorization` header with a valid user token.

```ts
export const authorized = middleware(
  ({ request, next, context }: MiddlewareInput<In>) => {
    if (!request.headers.has("authorized")) {
      // short circuit
      return new Response("Not Logged In", {
        status: 401,
      });
    }

    return next({
      user,
    });
  }
);
```
