---
sidebar_position: 2.1
---

# Service Client

The `ServiceClient` class available within the `@eventual/client` package provides a generic client for interacting with your Service's Commands over HTTP. It can be easily integrated into any consuming application, for example a frontend web application or even another service without any code generation.

## Create a ServiceClient

```ts
import { ServiceClient } from "@eventual/client";

const client = new ServiceClient({
  serviceUrl: "your-url",
});
```

## Provide the type of your Service

Before you can safely call the commands, you need to provide the types of your backend service.

```ts
import type * as MyService from "@my/service";

const client = new ServiceClient<typeof MyService>({
  serviceUrl: "your-url",
});

// type-safe interaction with commands (no code gen)
await client.myCommandName({
  key: "value",
});
```

:::caution
Make sure to use a type-only import when importing your backend code. If you don't, then your entire backend code will be imported into the consuming application which is unlikely to be what you want.

```ts
import type * as MyService from "@my/service";
//      ^ make sure to specify import type
```

:::

## `beforeRequest`

By default, the `ServiceClient` does not attempt to attach authorization headers. To do this on your own, pass in a `beforeRequest` callback to modify the request prior to execution.

For example, to inject a JWT token from AWS Cognito session:

```ts
new ServiceClient<typeof MyService>({
  serviceUrl: process.env.SERVICE_URL!,
  beforeRequest: async (request) => {
    if (session) {
      request.headers ??= {};
      request.headers.Authorization = `Basic ${session
        .getAccessToken()
        .getJwtToken()}`;
    }
    return request;
  },
});
```

## AWS IAM Authorization

Use the `AWSServiceClient` to authorize with AWS IAM Roles or IAM Users. It will by default attempt to detect credentials from the environment variables.

```ts
import { AWSServiceClient } from "@eventual/aws-client";

import type * as MyService from "@my/service";

const client = new AWSServiceClient<typeof MyService>({
  serviceUrl: "your-url",
});
```

You can also provide an [AWS Credentials Provider](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html) from the AWS SDK v3.

```ts
import { fromEnv } from "@aws-sdk/credential-providers";

const client = new AWSServiceClient<typeof MyService>({
  serviceUrl: "your-url",
  credentials: fromEnv(),
});
```
