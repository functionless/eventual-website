---
sidebar_position: 2
---

# Unit Test

You can write tests in your framework of choice, such as Jest.

We recommend separating out pieces of your business logic into individual functions that can be easily tested on their own without special tools such as mocking or spying.

## Test Environment

Then, to write tests for the distributed parts of your service, such as Workflows and Tasks, you can use the [TestEnvironment](../reference/unit-testing.md#testenvironment) in your tests to mock time. This makes it easy to write individual test cases that set up pre and post conditions based on time.

Let's look at an example. First, use a `beforeAll` (or equivalent) hook to set up an isolated `TestEnvironment` for each test. In Jest, this looks like so:

```ts
let env: TestEnvironment;

beforeAll(async () => {
  env = new TestEnvironment({
    entry: path.resolve(
      url.fileURLToPath(new URL(".", import.meta.url)),
      "../src/index.ts"
    ),
  });

  await env.initialize();
});
```

:::info
See the [Unit Testing Reference](../reference/unit-testing.md) for more information
:::

If you followed the [Quick Start](../quick-start.mdx) guide, you'll have a NPM package in `packages/service` set up with jest. You can find a sample test in `packages/service/test/hello.test.ts`.
