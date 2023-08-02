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

:::info
For a complete guide to queries, see the [entity query section](./entity.md#query-data).
:::

## Local vs Global Secondary Indexes

There are two types of secondary indexes you can use to speed up queries on your tables: Local Secondary Indexes (LSIs) and Global Secondary Indexes (GSIs). Both types of indexes allow you to query your data on alternative keys, providing more flexibility and performance. However, they are used in slightly different scenarios.

:::info
In Eventual, the type of secondary index created—LSI or GSI—depends on a few conditions. If the partition key remains the same and the table already has a sort key, a LSI is automatically created. On the other hand, if you specify a new partition key or the table did not have a sort key before, a GSI is created.
:::

## Local Secondary Indexes (LSIs)

LSIs maintain the same partition key as your table's primary key but allow for a different sort key. Since LSIs share the same partition key as the original table, they are scoped to a specific partition and provide quick access to data within that partition.

For example, a `posts` entity may use a `postId` for the sort key, but an LSI can be created to sort by `postDate`:

```ts
const posts = entity("posts", {
  attributes: {
    forum: z.string(),
    userId: z.string(),
    postId: z.string(),
    postDate: z.string(),
  },
  partition: ["forum"],
  sort: ["postId"],
});

const postsByDate = posts.index("postsByDate", {
  sort: ["postDate"],
});
```

With this LSI, you can efficiently retrieve all posts, sorted by post date:

```ts
await postsByDate.query({
  forum: "eventualAi",
});
```

## Global Secondary Indexes (GSIs)

GSIs, on the other hand, allow for a completely different partition key and sort key. This allows for more flexibility as you can perform queries across all partitions of your table.

For instance, if you want to all posts by date for a user, you can create a GSI:

```ts
const postsByUserId = posts.index("postsByUserId", {
  partition: ["userId"],
  sort: ["postDate"],
});
```

This GSI allows you to efficiently retrieve all entities where the `userId` equals a specific value:

```ts
await postsByUserId.query({
  userId: "sam",
});
```

## Sparse Indexes

Unlike the `entity`, an `index` can have partition or sort key attributes that may be undefined on some entities. When part of the key is undefined, the entity will not exist in the index. We call these Sparse Indexes. Sparse Indexes can be GSIs or LSIs.

Lets modify the `userData` entity to contain information about memberships. Users do not need to be members and we only want to retrieve users that are members.

```ts
const userData = entity("userData", {
  attributes: {
    userId: z.string(),
    userName: z.string(),
    age: z.number(),
    membershipStartDate: z.string().optional(),
  },
  partition: ["userId"],
});

const members = userData.index("members", {
  sort: ["membershipStartDate"],
});
```

Now when we scan this new index, only members will be returned:

```ts
const memberEntries = await members.scan();
```

## Querying and Scanning

`Query` and `Scan` operations on an `Index` behave the same as they do on an [`Entity`](./entity.md).

See the documentation for `Entity` [`query`](./entity.md#query-data) and [`scan`](./entity.md#scan-data).
