---
sidebar_position: 4
---

# Open API Specification

Eventual generates an [OpenAPI specification](https://www.openapis.org/) which is primarily used to generate the API Gateway api for your commands and system commands.

This OpenAPI specification can be used for other reasons like publishing an [OpenAI Chat Plugin](https://platform.openai.com/docs/plugins/getting-started/openapi-definition).

## Accessing the Specification

### During Synthesis

The specification can be accessed during stack synthesis using the `service.commandService.specification` property.

```ts
const service = new Service(...);

service.specification; // write to a file or use programmatically
```

:::caution Unresolved CDK Tokens
The specification will contain unresolved tokens to the lambda functions and other stack resources.

In general this will be OK when using the specification for use cases other than API Gateway.

If this is not OK, see the other options.
:::

### After Deployment

The specification can be deployed to s3 with all of the tokens resolved.

```ts
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

new BucketDeployment(stack, "specificationBucket", {
  sources: [Source.jsonData("specification.json", service.specification)],
  destinationBucket: new Bucket(...)
})
```

### From API Gateway

Using the aws-cli or aws-sdk:

```bash
aws apigatewayv2 export-api \
    --api-id [api id]  \
    --output-type JSON  \
    --specification OAS30 \
    --no-include-extensions \
    latest-api-definition.json
```

## Customizing OpenAPI Specification

OpenAI and other use cases may need additional fields to be defined.

### Customizing Info

The top level Info object can be overridden in the `Service` construct.

```ts
new Service(..., {
    openApi: {
        info: {
            title: "My API",
            description: "An API that does something cool"
        }
    }
})
```

Which generates:

```json
{
  "info": {
    "title": "My API",
    "description": "An API that does something cool",
    "version": "1"
  },
  ...
}
```

### Command and Low Level API Description and Summary

Each command can be given a description and/or summary that will be included in the OpenAPI Spec.

```ts
export updateUser = command("updateUser", {
    method: "POST",
    path: "/users/:userId",
    description: "An API which does something. It accepts a user ID.",
    summary: "An API which does something.",
    input: z.object({
        name: z.string(),
        age: z.number(),
    }),
}, ({ name, age }) => {
    console.log(name, age);
});
```

Which generates

```json
{
  "paths": {
    "/users/{userId}": {
      "post": {
        "description": "An API which does something. It accepts a user ID.",
        "summary": "An API which does something.",
        "requestBody": {
          "content": {
            "applications/json": { "schema": {} }
          }
        },
        ...
      }
    }
  }
}
```

### Schema and Property Descriptions

Some uses of OpenAPI require additional properties within the input and output schema objects.

Eventual uses [`zod`](https://github.com/colinhacks/zod) to define schemas and generates the OpenAPI specification using [`zod-openapi`](https://www.npmjs.com/package/@anatine/zod-openapi).

`zod-openapi` can add any OpenAPI field to any object or property using their `extendApi` function.

```ts
import { extendApi } from "@anatine/zod-openapi";

export updateUser = command("updateUser", {
    method: "POST",
    path: "/users/:userId",
    input: z.object({
        name: extendApi(z.string(), { description: "The name of the user" }),
        age: extendApi(z.number(), { description: "The age of the user" }),
    }),
}, ({ name, age }) => {
    console.log(name, age);
});
```

Which generates

```json
{
  "paths": {
    "/users/{userId}": {
      "post": {
        "description": "An API which does something. It accepts a user ID.",
        "summary": "An API which does something.",
        "requestBody": {
          "content": {
            "applications/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "The name of the user"
                  },
                  "age": {
                    "type": "number",
                    "description": "The age of the user"
                  }
                },
                "required": ["name", "age"]
              }
            }
          }
        }
      }
    }
  }
}
```
