---
sidebar_position: 2.1
---

# Invoke the Command

We now have a Command we can invoke. It doesn't do anything yet (we'll get to that in a sec), but we can invoke it using the `eventual invoke` CLI.

As a test, let's invoke the command we just created:

```
npx eventual invoke submitJob "this is my job description" --local
```

It will echo back the output:

```
> this is my job description
```

:::tip
The `submitJob` is a reference to the name we gave our command with `command("submitJob", .. )`.
:::
