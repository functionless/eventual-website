---
sidebar_position: 5.1
---

# Entity

An `Entity` represents a unique data unit stored in a DynamoDB Table.

The structure of an `Entity` comprises:

- **Unique Name**: Identifies each `Entity` table backed by a dedicated DynamoDB Table.
- **Attributes**: These are the attributes/properties stored with each `Entity`.
- **Partition Attributes**: A list of attribute names that constitute the partition key and determine how data is distributed across the database.
- **Sort Attributes**: An optional list that, if provided, determines the order of data stored within the partitions and enables efficient queries.

By effectively structuring these components, you can tailor each `Entity` to fit your data storage needs optimally.

## Creating an Entity

To create an Entity, you define its unique name, attributes, and partition/sort key configuration using the `entity` function from `@eventual/core`.

For instance, here's how you would define a `userData` Entity:

```ts
import { z } from "zod";
import { entity } from "@eventual/core";

const userData = entity("userData", {
  attributes: {
    userId: z.string(),
    userName: z.string(),
    age: z.number(),
  },
  partition: ["userId"],
});
```

Here, `userData` is an Entity table with `userId`, `userName`, and `age` as attributes. The partition key is `userId`, enabling us to lookup a user's data by their single `userId`.

## Partition Key

The `partition` key, also known as the "hash key", is the primary means of distributing data across various partitions.

## Sort Key

Contrarily, the `sort` key helps order data within each partition of an Entity and enable complex queries.

Sort keys are particularly useful when it comes to modeling relationships between entities. For instance, if you need to "List all of UserXYZ's friends," you can define the `friendId` as the sort key and `userId` as the partition key.

```ts
const friends = entity("Friend", {
  attributes: {
    userId: z.string(),
    friendId: z.string(),
  },
  partition: ["userId"],
  sort: ["friendId"],
});
```

Once defined, you can conduct a query using the `userId` partition key to return a list of all the user's friends.

```ts
const usersFriends = await friends.query({
  userId: "userID",
});
```

## Composite Keys

Eventual allows for the use of "composite keys"—keys composed of multiple attributes.

Consider a scenario where you need to model a meeting room scheduling system and wish to retrieve all meetings at a particular office on a certain date.

First, define an `entity` with a composite sort key combining `date` and `roomNumber`:

```ts
const meetings = entity("meetings", {
  attributes: {
    location: z.string(),
    date: z.string(),
    roomNumber: z.string(),
  },
  partition: ["location"],
  sort: ["date", "roomNumber"],
});
```

Next, to retrieve all `roomNumbers` within a location for a specific date, use a `query`:

```ts
await meetings.query({
  location: "Seattle",
  date: {
    $beginsWith: "2023-01-01",
  },
});
```

This way, composite keys enable more sophisticated queries by permitting multiple attributes within partition and sort keys.

:::tip
It is not always possible to support all query access patterns using the partition/sort key configuration on an entity. Instead, you can create an [Index](./entity-index.md) optimized for a particular query.
:::

:::caution

**Numeric Multi-Attribute Fields.**

When a multi-attribute key field is numeric, the number will be stored as a string rather than a number.
This means that comparison operations like sort and between will treat the number as a string and not a number.

Lets say the `roomNumber` in `meetings` was a `z.number()`.

```ts
const meetings = entity("meetings", {
  attributes: {
    location: z.string(),
    date: z.string(),
    roomNumber: z.number(),
  },
  partition: ["location"],
  sort: ["date", "roomNumber"],
});
```

If the entity contains room 10 and room 9 on the same date, room 10 will be considered less than room 9.

```ts
[
  {
    location: "seattle",
    date: "2023-01-01",
    roomNumber: 10,
  },
  {
    location: "seattle",
    date: "2023-01-01",
    roomNumber: 9,
  },
];
```

If maintaining the numeric ordering within a multi-attribute key is important, one way to resolve this is to provide a padded number as a string:

```ts
// change room number to - roomNumber: z.string(),
[
  {
    location: "seattle",
    date: "2023-01-01",
    roomNumber: "009",
  },
  {
    location: "seattle",
    date: "2023-01-01",
    roomNumber: "010",
  },
];
```

:::

## Get Data

The `get` function retrieves an individual record by its partition and sort key values:

```ts
const user = await userData.get({
  userId: "userId",
});
```

## Set Data

The `set` function writes an individual record to the database. You must pass an object matching the schema configured on the entity.

```ts
// set data
await userData.set({
  userId: "user1",
  userName: "John",
  age: 30,
});
```

## Query Data

An Entity with a `sort` key or an [Index](./entity-index.md) can be queried with the `query` function.

To perform a query, you must specify all of the partition key attributes. Including the sort key attributes in your query is optional but can help narrow down results.

For example, here's how you can query the `friends` entity to retrieve all of Sam's friends:

```ts
const friendsOfSam = await friends.query({
  userId: "sam",
});
```

### Querying Data with Operators

In addition to providing partition and sort key attributes, you can use various operators in your queries to refine the results. These operators include `beginsWith`, `between`, `lt` (less than), `gt` (greater than), `lte` (less than or equal to), and `gte` (greater than or equal to).

Here are some examples using the `meetings` entity from an earlier section.

To find meetings starting on a certain date:

```ts
const meetingsOnDate = await meetings.query({
  location: "Seattle",
  date: {
    $beginsWith: "2023-01-01",
  },
});
```

To find meetings happening between two dates:

```ts
const meetingsInRange = await meetings.query({
  location: "Seattle",
  date: {
    $between: ["2023-01-01", "2023-02-01"],
  },
});
```

:::info
To perform between with multiple sort key attributes, you can place it directly on the key object.

This query would filter out room numbers above 400 from the final date.

```ts
const meetingsInRange = await meetings.query({
  location: "Seattle",
  $between: [
    {
      date: "2023-01-01",
    },
    {
      date: "2023-02-01",
      roomNumber: "400",
    },
  ],
});
```

:::

To find meetings that happened before a certain date:

```ts
const meetingsBeforeDate = await meetings.query({
  location: "Seattle",
  date: {
    $lt: "2023-01-01",
  },
});
```

To find meetings that happened after a certain date:

```ts
const meetingsAfterDate = await meetings.query({
  location: "Seattle",
  date: {
    $gt: "2023-01-01",
  },
});
```

These operators provide powerful tools for refining your queries and retrieving exactly the data you need.

## Optimistic Locking

Eventual provides a feature called 'optimistic locking' to handle concurrent updates to an entity. Each entity carries a version attribute, which is updated every time the entity is modified. This version can be used to assert that an entity hasn't changed since the last update.

Here's how you can use optimistic locking with the `userData` entity:

First, set the initial data in the entity. The set operation returns an object that includes a `version` attribute:

```ts
// set the item in the entity and receive the
const { version } = await userData.set({
  userId: "user1",
  userName: "John",
  age: 30,
});
```

You can then perform other operations. If you need to update the user data later and want to ensure the user data hasn't changed since the last update, you can pass the `expectedVersion` in the options argument to the `set` function:

```ts
await userData.set(
  { userId: "user1", userName: "John", age: 31 },
  // ensure that the version has not changed since we last updated
  { expectedVersion: version }
);
```

If the `user1` data was updated in-between the two `set` operations and the version has changed, the second `set` operation will throw an `UnexpectedVersion` error. This mechanism ensures data consistency in environments with concurrent operations.

## Streams

Entity streams are powerful tools that enable developers to observe changes to entities in real time. Changes can include insertions, modifications, or deletions. The stream delivers events in an orderly fashion per entity. When namespaces are involved, events are sorted per entity and per namespace. In case of any issues or false responses, the stream automatically attempts a retry.

:::caution
Be aware that each entity can support only two streams at a time.
:::

Here's an example of setting up a stream on the `userData` entity that triggers a function whenever a new user is inserted:

```ts
export const newEntities = userData.stream(
  { operations: ["insert"] },
  async (item) => {
    // ... do something with the item ...
  }
);
```

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
