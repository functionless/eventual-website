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
  $default: async ({ connectionId }, { data }) => {
    // handle message body
  },
});
```

## Connect from Frontend

You can connect to the web socket using the standard built-in [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

```ts
const url = process.env.SERVICE_URL;

const ws = new WebSocket(url);
```

The `SERVICE_URL` can be retrieved for a deployed service using `eventual get service`:

```sh
eventual get service

# or if you have multiple:
eventual get service --service <your-service-name>
```

You should see a list of available endpoints like below. Copy the `mySocket` web socket endpoint in to your environment variables.

```sh
API Gateway: https://12345678.execute-api.us-east-1.amazonaws.com
Event Bus Arn: arn:aws:events:us-east-1:123456789019:event-bus/my-service
Service Log Group: my-service-execution-logs
Socket Endpoints:
	mySocket - wss://98765432198.execute-api.us-east-1.amazonaws.com/default
```

When developing locally, the `eventual local` command shows all of the available endpoints:

```sh
> eventual local
✔ Eventual Dev Server running on http://localhost:3111.
 Sockets are available at:
	rtc-socket - ws://localhost:3111/__ws/rtc-socket
```

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
