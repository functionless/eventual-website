---
sidebar_position: 3
---

# Platform as a Construct

Eventual can be thought of as a "Platform as a Construct" - similar to a Platform as a "Service" (PaaS).

- Like a PaaS - Eventual provides an opinionated architecture for running an entire service in the cloud with a lean and simplistic developer experience.
- Unlike a PaaS - Eventual deploys entirely in to your own AWS account using Infrastructure-as-Code (IaC).

Eventual provides easy-to-use primitives for distributed systems, including Commands, Events, Subscriptions, Workflows and Tasks. Each translate directly into AWS resources, such as API Gateway routes, Lambda Functions, Event Bus Rules, etc.

We do the work of designing the underlying infrastructure with best practices in mind, such as operations, security and scaling, but you are also free to customize and integrate with other cloud resources using IaC.
