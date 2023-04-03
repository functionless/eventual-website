---
sidebar_position: 5.1
---

# Entity

An Entity is a data store that can be used to store and retrieve data from in an eventual service. It provides a way to persist data across multiple workflow executions, tasks, commands and can be used to store data such as user information, configuration settings, or any other data that needs to be persisted.

## Create an Entity

To create an entity, you will need to import the `entity` function from the `@eventual/core` library:

```ts
import { entity } from "@eventual/core";
```

Then, you can define an entity by providing a unique name and the type of data it will store:

```ts
const userData = entity<{ name: string; age: number }>("userData");
```

## Get and Set Data

Once an entity has been created, you can use the `get` and `set` methods to get and set data in the entity:

```ts
// set data
await userData.set("user1", { name: "John", age: 30 });

// get data
const user = await userData.get("user1");
```

## List Data

The `list` method can be used to list all the data stored in an entity:

```ts
const users = await userData.list();
```

## Composite Keys

Composite keys can be used to create multiple groupings of data in an entity. This is done by providing an object with multiple properties as the key:

```ts
await userData.set(
  { namespace: "admin", key: "john" },
  { name: "John", age: 30 }
);
```

This can then be used to list all the users in a particular group:

```ts
const admins = await userData.list({ namespace: "admin" });
```

## Conditional mutations

Each entity value has a version which can be used to assert that an entity has not changed since the last update.

```ts
const { version } = await userData.set("user1", { name: "John", age: 30 });
... other things
await userData.set("user1", { name: "John", age: 31 }, { expectedVersion: version });
```

If `user1` has been updated between the first and second `set`, an `UnexpectedVersion` error will be thrown.

## Transactional Writes

If multiple `set`s or `delete`s depend on each other succeeding or the state of another entity, `Entity.transactWrite` can be used.

If any of the operations fail, no updated will be made.

```ts
await Entity.transactWrite([
  // update an entity
  {
    entity: userData,
    operation: {
      operation: "set",
      id: "user1",
      value: { schedule: "userSchedule1" },
    },
  },
  // update a second entity
  {
    entity: userSchedules,
    operation: {
      operation: "set",
      id: "userSchedule1",
      value: { days: ["M", "W", "F"] },
    },
  },
  // only update if this entity has the expected version of 10 and all of the other operations succeed
  {
    entity: someOtherEntity,
    operation: { operation: "condition", id: "someId", version: 10 },
  },
]);
```

:::info
For more complex scenarios use the [`transaction`](./transaction.md) resource instead.
:::

## Streams

Entity streams allow developers to listen for changes to entities. These streams allow developers to listen for changes on entities, which include inserts, modifications, or deletions. Events are delivered in order per entity, unless namespaces are being used, in which case they are delivered in order per entity and namespace. In case of an error or false response, the stream will automatically retry

Developers can also filter the events based on the event type or namespace. To get the the old value, set `includeOld` to true in the options.

:::caution
Each entity can only have two streams.
:::

```ts
const users = new entity("users");

export const newEntities = myEntity.stream(
  { operations: ["insert"] },
  async (item) => {
    // ... do something with the item ...
  }
);
```
