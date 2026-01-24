# Universal Resilience Patterns

## Pattern 1: Circuit Breaker

Prevent cascading failures in distributed systems.

```python
class CircuitState(Enum):
    CLOSED = "closed"       # Normal
    OPEN = "open"          # Failing
    HALF_OPEN = "half_open"  # Testing

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        # ... implementation details ...
```

## Pattern 2: Error Aggregation

Collect multiple errors instead of failing on first error (e.g., form validation).

```typescript
class ErrorCollector {
  private errors: Error[] = [];

  add(error: Error): void {
    this.errors.push(error);
  }

  throw(): never {
    if (this.errors.length > 0) {
      throw new AggregateError(this.errors, "Multiple errors occurred");
    }
  }
}
```

## Pattern 3: Graceful Degradation

Provide fallback functionality when errors occur.

```python
def with_fallback(
    primary: Callable[[], T],
    fallback: Callable[[], T]
) -> T:
    """Try primary function, fall back to fallback on error."""
    try:
        return primary()
    except Exception:
        return fallback()
```
