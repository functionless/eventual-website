---
sidebar_position: 0.9
---

# Bus

Each Service has its own Event "Bus". It is a one-to-many message broker that routes Events to many Subscriptions.

![](/img/pub-sub.svg)

## Usage

1. Define [Event](./event.md) Schemas for each of the events you want to emit and subscribe to
2. Create [Subscriptions](./subscription.md) to listen for and process Events flowing through your Service

## Benefit

The Event Bus enables the decoupling of services through the use of events. Services can emit and subscribe to events without directly interacting with each other, allowing for asynchronous processing, error isolation and recovery via replay. This decoupling also enables the easy addition of new services without making changes to existing ones, helping to evolve your system over time.
