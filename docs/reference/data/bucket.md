---
sidebar_position: 4
---

# Bucket

The `bucket` primitive provides an object store backed by S3.

## Creating a Bucket

```ts
import { bucket } from "@eventual/core";

export const files = bucket("files");
```

## Get Object

```ts
const object = await files.get("/path/to/file.txt");
// if the object doesn't exist, then undefined is returned
if (object !== undefined) {
  object.body; // the body is available as a Readable

  // get the body as a string (convenience)
  const bodyString = await object?.getBodyString();
}
```

The `get` method accepts an optional options argument. Use this to specify the `etag` of an object if you need.

```ts
const object = await files.get("path/to/file.txt", {
  etag: yourEtag,
});
```

## Head (Get Object Metadata)

The `head` object provides a way to get an object's metadata without fetching the content:

```ts
const response = await files.head("path/to/file.txt");

response?.etag;
response?.metadata; // key-value pairs of metadata
```

## Put Object

Upload an object with the `put` method. It accepts data as a `string`, `Buffer` or `Readable`.

```ts
await files.put("path/to/file.txt", "data");
await files.put("path/to/file.txt", buffer);
await files.put("path/to/file.txt", readable);
```

The response provides the `etag` if needed:

```ts
const response = await files.put("path/to/file.txt", "data");

const etag = response.etag;
```

You can provide key-value pairs of object metadata in the third `options` argument:

```ts
await files.put("path/to/file.txt", "data", {
  metadata: {
    key: "value",
  },
});
```

## Delete Object

```ts
await files.delete("path/to/file.txt");
```

## List Objects

Use the `list` method to list objects in a bucket by prefix.

```ts
const response = await files.list({
  prefix: "key/",
});
```

Use the response's `nextToken` to page through results. When there are no more objects left, it will be `undefined`.

```ts
await files.list({
  prefix: "key/",
  nextToken: response.nextToken,
});
```

Specify `maxKeys` to limit the number of returned objects. Default and max is `1000`.

```ts
await files.list({
  prefix: "key/",
  maxKeys: 10,
});
```

Specify a key for `startAfter` to start the list from a specific key:

```ts
await files.list({
  prefix: "key/",
  startAfter: "key/some/obj.txt",
});
```

## Copy Object

The `copyTo` method provides a way to copy an object from one location to another without downloading and re-uploading (the operation is performed server-side).

```ts
await files.copyTo("path/to/destination.txt", "path/to/source.txt");
```

By default, the object is coped to the same bucket. You can optionally specify a different bucket as the third argument.

```ts
await files.copyTo(
  "path/to/destination.txt",
  "path/to/source.txt",
  otherBucket
);
```

## Generate Pre-Signed URL

It is often useful to generate pre-signed URLs that allow an external, trusted partner to call delete/get/put/head on an object. You can do this with the `generatePresignedUrl` method.

```ts
const response = await myBucket.generatePresignedUrl("path/to/file.txt", "get");
```

Supported operations are:

- `delete`
- `get`
- `put`
- `head`

## Bucket Listener

Buckets emit events whenever objects are created or deleted. You can subscribe to these events for processing with the `on` handler.

This will create a Lambda Function and subscribe it to the Bucket's events.

```ts
export const onFileChanged = files.on("all", "onFileChanged", async (item) => {
  const obj = await myBucket.get(item.key);
});
```

The `event` property defines the operation that was performed - one of `copy`, `delete` or `put`.

```ts
if (item.event === "copy") {
} else if (item.event === "delete") {
} else if (item.event === "put") {
}
```

To subscribe to a specific type of event, specify the event type in the first argument:

```ts
export const onFileChanged = files.on("put", "onFileChanged", async (item) => {
  const obj = await myBucket.get(item.key);
});
```

Allowed values are:

- `all` - all events
- `put` - only receive events when an object is put to the bucket
- `delete` - only receive events when an object is deleted
- `copy` - only receive events when an object is copied

To subscribe to multiple events, use an array:

```ts
files.on(["put", "delete"], ..)
```

You can also provide options to filter the keys by key `prefix` or override the default `handlerTimeout` or `memorySize`.

```ts
files.on(
  "all",
  "onFileChanged",
  {
    handlerTimeout: duration(1, "minute"),
    memorySize: 512,
    filters: [
      {
        prefix: "key/",
      },
    ],
  },
  async (item) => {
    //
  }
);
```
