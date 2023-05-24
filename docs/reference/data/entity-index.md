---
sidebar_position: 5.2
---

# Index

Indexes enable efficient queries on Entities using different partition/sort keys than the original entity's configuration. Each entity supports up to 20 global secondary indexes (GSIs) and 5 local secondary indexes (LSIs).

## Create an Index

Here's an example of creating a global secondary index on the `userData` entity. This index is called `usersByUserName` and uses `userName` as its partition key:

```ts
const usersByUserName = userData.index("byUserName", {
  partition: ["userName"],
});
```

An index works much like an entity — you can run queries against it. Here's an example of querying the `usersByUserName` index:

```ts
await userByUserName.query({
  userName: "sam",
});
```

This query will return all users where the `userName` attribute equals "sam".

Consider a case where you would like to query users based on their `userName` and `age`. For instance, if you want to retrieve all users named "sam" who are 30 years old, you can create a GSI with `userName` as the partition key and `age` as the sort key:

```ts
const usersByNameAndAge = userData.index("usersByNameAndAge", {
  partition: ["userName"],
  sort: ["age"],
});
```

With this index, you can perform efficient queries to retrieve all users named "sam" who are 30 years old:

```ts
await usersByNameAndAge.query({
  userName: "sam",
  age: 30,
});
```

## Local vs Global Secondary Indexes

There are two types of secondary indexes you can use to speed up queries on your tables: Local Secondary Indexes (LSIs) and Global Secondary Indexes (GSIs). Both types of indexes allow you to query your data on alternative keys, providing more flexibility and performance. However, they are used in slightly different scenarios.

:::info
In Eventual, the type of secondary index created—LSI or GSI—depends on whether you change the partition key when creating the index. If the partition key remains the same and only the sort key changes, a LSI is automatically created. On the other hand, if you specify a new partition key, a GSI is created.
:::

## Local Secondary Indexes (LSIs)

LSIs maintain the same partition key as your table's primary key but allow for a different sort key. Since LSIs share the same partition key as the original table, they are scoped to a specific partition and provide quick access to data within that partition.

For example, if your `userData` entity uses `userId` as the partition key and you want to sort data using `age`, you can create a LSI:

```ts
const usersByAge = userData.index("usersByAge", {
  partition: ["userId"],
  sort: ["age"],
});
```

With this LSI, you can efficiently retrieve all entities for a specific user, sorted by age:

```ts
await usersByAge.query({
  userId: "user1",
});
```

## Global Secondary Indexes (GSIs)

GSIs, on the other hand, allow for a completely different partition key and sort key. This allows for more flexibility as you can perform queries across all partitions of your table.

For instance, if you want to query users based on their `userName`, you can create a GSI:

```ts
const usersByUserName = userData.index("usersByUserName", {
  partition: ["userName"],
});
```

This GSI allows you to efficiently retrieve all entities where the `userName` equals a specific value:

```ts
await usersByUserName.query({
  userName: "sam",
});
```
