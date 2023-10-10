---
sidebar_position: 0
---

# Socket

The `socket` primitive creates a Web Socket endpoint that can be connected to from your frontend.

## Create a Socket

```ts
import { socket } from "@eventual/core";

export const mySocket = socket("mySocket", {
  $connect: async ({ connectionId }) => {
    // implement logic for when a client connects
  },
  $disconnect: async ({ connectionId }) => {
    // implement logic for when a client disconnects
  },
  $default: async ({ connectionId }, { body }) => {
    // handle message body
  },
});
```

## Connect from Frontend

??

## Attach Middleware to a Socket

Middleware is helpful for sharing logic across API and Socket handlers.

Create a middleware chain `socket.use`. You can provide a function to be called as part of every `connect`, `disconnect` and `default` call.

```ts
// define a type for your message
interface MyMessage {
  foo: string;
  bar: string;
}

// create a middleware that parses the JSON message into a structured form
const myMiddleware = socket.use({
  message: ({ request, context, next }) => {
    const { body } = request;
    const message = body
      ? (JSON.parse(body.toString()) as MyMessage)
      : undefined;
    return next({ ...context, message });
  },
});

export const mySocket = myMiddleware.socket("mySocket", {
  ..
  $connect: async ({ connectionId }, { message }) => {
    // message is parsed now
    message.foo;
    message.bar;
  }
});
```
