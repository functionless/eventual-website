# Distributed Transactions with the Saga Pattern

## Workflows can orchestrate distributed transactions with the "Saga Pattern"

A common use-case for workflows with side-effects (aka. Tasks) is to use the Saga Pattern to reliably make changes in distributed services.

Because workflows are guaranteed to run each Task exactly once, transactions can be implemented with procedures such as rolling back changes (i.e. "undo") when an error is encountered. This is otherwise known as a "compensating transaction".

```ts
const compensations = [];

try {
  await taskA();
  compensations.push(() => undoTaskA());

  await taskB();
  compensations.push(() => undoTaskB());

  // etc.
} catch {
  await Promise.all(compensations.map((compensation) => compensation()));
}
```
