---
sidebar_position: 5.3
---

# Transaction

Transactions are a powerful tool for ensuring data consistency and integrity. They guarantee that any value read within the transaction will stay the same by the end of the transaction, and any mutation operations (`set`, `delete`) will not change from the time the set operation is found until it is executed.
Additionally, any events will only be emitted if all other conditions succeed and they will only be emitted once (though this does not guarantee exactly-once delivery). Finally, a transaction will retry until complete, or until it reaches the maximum number of retries (default: 100).

## Create a Transaction

To create a transaction, you will need to import the `transaction` function from the `@eventual/core` library:

```ts
import { transaction } from "@eventual/core";
```

Then, you can define a transaction by providing a unique name and its implementation as an asynchronous function:

```ts
const myTransaction = transaction("myTransaction", async (input) => {
  // perform operations here
});
```

### Writing the Transaction

A transaction can utilize Entity's `get`, `getWithMetadata`, `set`, and `delete` operations.

```ts
const myTransaction = transaction(
  "myTransaction",
  async (input: { id: string }) => {
    const value = await myEntity.get("someKey");
    await myEntity.set(input.id, { value });
  }
);
```

In the example above, if "someKey" undergoes any changes before the transaction completes, the transaction will automatically retry using the latest value of "someKey".

### Transaction Events

Transactions can emit events to the service and send signals to workflows. Events are emitted using the `event.emit` function and signals are sent using the `signal.sendSignal` function. These functions will only be called if the transaction succeeds.

```ts
const myTransaction = transaction("myTransaction", async () => {
  await myEvent.emit({ ... });
  await mySignal.sendSignal("someExecutionId", { ... });
});
```

### User Provided Version Asserts

Internally, transactions calculate the expected versions of each entity manipulated within the transaction. However, it is also possible to explicitly provide the expected versions to assert on.

Please note that if a specific version is explicitly provided and it differs from the calculated version, leading to a transaction failure, the transaction will not be retried and will result in a TransactionCancelled exception being thrown.

```ts
const myTransaction = transaction(
  "myTransaction",
  async (input: { id: string; version: number }) => {
    const value = await myEntity.get("someKey");
    // if myEntity-input.id's version is no longer `version`, the transaction will fail.
    await myEntity.set(input.id, { value, expectedVersion: version });
  }
);
```

## Call a Transaction

To call a transaction, you can simply await the transaction function like you would any other asynchronous function:

```ts
await myTransaction(input);
```

A transaction can be called from within any of the other resources, including: workflows, tasks, subscriptions, commands, and stream handlers.
