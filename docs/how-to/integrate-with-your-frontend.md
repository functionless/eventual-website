---
sidebar_position: 6
---

# Integrate with a Frontend

Eventual deploys to AWS as a service backed by an AWS API Gateway V2. To integrate with your frontend, you only need to instantiate a [ServiceClient](../reference/api/client.md) on your frontend

## Authorization

See the [`beforeRequest`](../reference/api/client.md#beforerequest) documentation to understand how to configure authorization headers such as JWT tokens or IAM Authorization on a client.

## React

A common pattern in React is to create a Context Provider to expose a single instance of a client to all child components.

1. Import the types of your backend service and define a function for creating your client.

```ts
import { ServiceClient, type HttpServiceClientProps } from "@eventual/client";
import React, { useContext } from "react";

// import (type only) the types of your Service (the package in packages/service)
import type * as MyService from "@my/service";

export function createClient(
  { serviceUrl, beforeRequest }: HttpServiceClientProps = {
    // set the SERVICE_URL as an environment variable - default to local for local development
    serviceUrl: process.env.SERVICE_URL ?? "http://localhost:3111",
  }
) {
  return new ServiceClient<typeof MyService>({
    serviceUrl,
    beforeRequest,
  });
}
```

2. Define a type for your service.

```ts
export type MyClient = ServiceClient<typeof MyService>;
```

3. Create a React Context for your client.

```ts
export const MyClientContext = React.createContext<MyClient | null>(null);
```

4. Define a Context Provider wrapper function to expose your client to child components.

```ts
// a React Context Provider that exposes a single instance of the instantiated client
export const MyClientProvider = ({
  client = createClient(),
  children,
}: {
  client?: MyServiceClient;
  children?: any;
}) => {
  return (
    <MyClientContext.Provider value={client}>
      {children}
    </MyClientContext.Provider>
  );
};
```

5. Wrap your components in the Provider

```tsx
<MyClientProvider>
  <YourComponents />
</MyClientProvider>
```

6. Create a `useService` hook for components

```ts
export const useService = () => {
  const context = useContext(MyClientContext);
  if (context === null) {
    throw new Error("useService must be used within a PlatformProvider");
  }
  return context;
};
```

7. Call `useService` in the components that need the client.

```ts
const MyComponent = () => {
  const service = useService();

  useEffect(() => {
    service.myCommand().then((response) => {
      // do work
    });
  });
};
```
