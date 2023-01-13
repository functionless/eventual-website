# Workflow Interpreter

The Eventual Interpreter is the method in which a Workflow Function is processed, suspended, and resumed. All [`workflow`](../reference/workflow.md) functions are processed using the Interpreter after being transpiled with the [Eventual Compiler](./3-compiler.md)

:::caution Section is incomplete
:::

## Workflow Suspend & Resume

Workflows are long-running processes expressed as ordinary functions. To achieve this, Eventual employs a method of suspending and resuming a function (also known as a Reentrant Process). Whenever an SQS batch is received, the function is resumed by replaying its history from S3 through the function to restore it to its previous state. It is then invoked with the new events to produce the next [Commands](./1-commands.md) and its event history is updated in S3.

Achieving this in a serverless environment is challenging. The NodeJS runtime does not natively support suspending and resuming a program, and we are running in an ephemeral environment which we cannot rely on having access to in subsequent invocations. Furthermore, Promises in NodeJS cannot be easily aborted, so any incomplete Promises persist in memory and slowly consume a Lambda instance's resources until it crashes.

Our solution is to transpile async [`workflow`](../reference/workflow.md) functions into [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) using the [Eventual Compiler](./3-compiler.md). Unlike a Promise which is controlled by the NodeJS runtime and can't be changed, a Generator's execution can be controlled explicitly within user-land. Our [Eventual Interpreter](./2-interpreter.md) then executes this Generator, emulating the behavior of a Promise, but with the ability to suspend and resume at will.

:::caution
This method requires we download and replay the entire event history each time a workflow execution progresses. This means that users should be careful with the amount of data they pass between workflows and activities, and long-running workflows with many events or expensive computation will degrade as the event log grows in size.
:::

:::tip
There are various tactics to work around these limitations - such as recursively calling a child workflow for each step in a loop, or chunking workflows into smaller workflows that run in parallel.
:::

## Determinism Constraint

A constraint that is born out of this technique is
