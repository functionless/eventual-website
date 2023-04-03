---
sidebar_position: 5.1
---

# Transaction

A transaction is a function that encapsulates a set of operations that must be performed atomically. This means that either all of the operations will succeed or none of them will. Transactions are useful for ensuring that data is consistent across multiple operations, such as when writing to a database or making API calls.

## Create a Transaction

To create a transaction, you will need to import the `transaction` function from the `@eventual/core` library:

```ts
import { transaction } from "@eventual/core";
```

Then, you can define a transaction by providing a unique name and its implementation as an asynchronous function:

```ts
const myTransaction = transaction("myTransaction", async () => {
  // perform operations here
});
```

## Call a Transaction

To call a transaction, you can simply await the transaction function like you would any other asynchronous function:

```ts
await myTransaction(input);
```

## Transaction Events

Transactions can emit events and send signals to workflows. Events are emitted using the `event.emit` function and signals are sent using the `signal.sendSignal` function. These functions will only be called if the transaction succeeds.

```ts
const myTransaction = transaction("myTransaction", async () => {
  // perform operations here
  await event.emit({ type: "myEvent", data: { ... } });
  await signal.sendSignal({ type: "mySignal", data: { ... } });
});
```