---
sidebar_position: 2.1
---

# Invoke the Command

We now have a Command we can invoke. It doesn't do anything yet (we'll get to that in a sec), but we can invoke it using the `eventual invoke` CLI.

As a test, let's invoke the command we just created:

```
npx eventual invoke submitTask "this is my task description"
```

It will echo back the output:

```
> this is my task description
```

:::tip
The `submitTask` is a reference to the name we gave our command with `command("submitTask", .. )`.
:::
