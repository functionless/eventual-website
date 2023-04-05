---
sidebar_position: 1.1
---

# Start Local Environment

Start a local environment to begin developing. This will perform an initial deployment to the cloud and spin up a local dev server.

:::info
See the [How to Run Locally](../how-to/run-locally.md) for more information.
:::

First make sure you are logged into an AWS account in the cli. If the AWS CLI is not installed, follow [these directions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html).

```
npx eventual local
```

:::info
If you are using a non-default AWS CLI Profile, provide it like:

```
AWS_PROFILE=[your profile] npx eventual local
```

:::
