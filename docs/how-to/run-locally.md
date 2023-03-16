---
sidebar_position: 2.1
---

# Run Locally

Eventual ships with an `eventual local` CLI to run a service on your machine for quick and easy debugging.

## Start the Local Server

Run the following command in your project:

```
eventual local --entry ./packages/service/src/index.ts
```

This will start up a local server running the service located at `./packages/service/src/index.ts` and output a `localhost` URL you can then interact with.

```
Local Server running on http://localhost:4000
```

## Interact with the Local Server

The server is just a plain HTTP server, so you can use any tool you'd like to make HTTP requests to your server. For example, cURL or Postman.

Eventual provides a `invoke` CLI for invoking Commands directly from the CLI without hand-crafting URLs.

```
eventual invoke hello "my name is sam"
```

## Debug in VS Code

The simplest way to debug in VS code is to run the `eventual local` CLI within a JavaScript Debug Terminal.

To open a terminal, use the Command Palette and search for "JavaScript Debug Terminal".

![](./command-pallete-debug-terminal.png)

Then, run the CLI in the new terminal:

![](./debug-terminal-local.png)

You can now set breakpoints anywhere in your code and explore all of your Commands, Workflows, Activities and Subscriptions in the context of a single runtime.
