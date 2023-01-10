# Reference

## Building Blocks

- [Service](../reference/service.md) - a collection of APIs, Events, Workflows, and Activities that represent a business domain or capability. Can be composed with other services via APIs and Event subscriptions.
- [REST API](../reference/api.md) - create and your own REST APIs and serve them over HTTPS via a managed API Gateway. Each Service also includes internal API routes (see: [Eventual Service Client](../reference/service-client.md)).
- [Event](../reference/event.md) - publish and subscribe Events to your Service's Event Bus. Process events internally or route them to other Services.
- [Workflow](../reference/workflow.md) - a set of orchestrated Activities that implements business logic with asynchronous, durable long-running processes.
- [Activity](../reference/activity.md) - functions that encapsulate a single unit of work in a workflow. Integrate with cloud resources and SaaS.
- [Signal](../reference/signal.md) - a message that can be sent to a workflow execution. Workflows can wait for external input as a Signal and modify its behavior. Signals are communicated point-to-point in contrast to Events which are broadcast to all subscribers.

## Helpful Resources

- [Eventual Service Client](../reference/service-client.md) - a client for interacting with an Eventual Service, such as listing and starting workflows, viewing logs, etc.
- [CLI Guide](../reference/cli.md) - the Eventual command-line interface (CLI) provides tools for interacting with your service from the terminal.
- [Unit Testing](../reference/unit-testing.md) - API reference, guidelines and best practices for writing unit tests for your Eventual service.
- [Cheatsheet](../cheatsheet.md) - a list of helpful patterns for solving common problems using Eventual
- [Service Limits](../reference/service-scaling-limits.md) - the AWS Limits and Quotas to be aware of when scaling a Service.