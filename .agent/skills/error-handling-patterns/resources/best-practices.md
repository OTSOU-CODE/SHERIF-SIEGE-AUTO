# Best Practices & Pitfalls

## Best Practices

1.  **Fail Fast**: Validate input early, fail quickly.
2.  **Preserve Context**: Include stack traces, metadata, and timestamps in exceptions.
3.  **Meaningful Messages**: Explain _what_ happened and _how_ to fix it.
4.  **Log Appropriately**: Log unexpected errors; don't spam logs for expected flow control.
5.  **Handle at Right Level**: Catch where you can meaningfully handle or recover.
6.  **Clean Up Resources**: Always use `try-finally`, context managers, or `defer`.
7.  **Don't Swallow Errors**: Log or re-throw; never silently ignore.
8.  **Type-Safe Errors**: Use typed custom errors when possible.

## Common Pitfalls

- **Catching Too Broadly**: `except Exception`/`catch (e)` without filtering hides bugs.
- **Empty Catch Blocks**: Silently swallowing errors makes debugging impossible.
- **Logging AND Re-throwing**: Creates duplicate log entries, cluttering logs.
- **Leakage**: Returning raw database errors or stack traces to end-users (security risk).
- **Ignoring Async Errors**: Unhandled promise rejections can crash Node.js processes.

## Error Handling Checklist

- [ ] Are custom error types defined for domain errors?
- [ ] Are input validations performed early?
- [ ] Do error messages contain actionable info (IDs, inputs)?
- [ ] Are resources (files, DB connections) cleaned up in `finally` blocks?
- [ ] Is sensitive information stripped from user-facing errors?
- [ ] Are retry mechanisms in place for transient network errors?
