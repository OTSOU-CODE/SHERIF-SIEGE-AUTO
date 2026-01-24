# Language-Specific Patterns

## Python Error Handling

**Custom Exception Hierarchy:**

```python
class ApplicationError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError):
    """Raised when validation fails."""
    pass

class NotFoundError(ApplicationError):
    """Raised when resource not found."""
    pass

class ExternalServiceError(ApplicationError):
    """Raised when external service fails."""
    def __init__(self, message: str, service: str, **kwargs):
        super().__init__(message, **kwargs)
        self.service = service
```

**Context Managers for Cleanup:**

```python
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Ensure transaction is committed or rolled back."""
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()
```

**Retry with Exponential Backoff:**

```python
import time
from functools import wraps

def retry(max_attempts: int = 3, backoff_factor: float = 2.0, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        time.sleep(backoff_factor ** attempt)
                        continue
                    raise
            raise last_exception
        return wrapper
    return decorator
```

## TypeScript/JavaScript Error Handling

**Custom Error Classes:**

```typescript
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}
```

**Result Type Pattern:**

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}
function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

function parseJSON<T>(json: string): Result<T, SyntaxError> {
  try {
    return Ok(JSON.parse(json) as T);
  } catch (error) {
    return Err(error as SyntaxError);
  }
}
```

## Rust Error Handling

```rust
// Result type with custom enum
#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(std::num::ParseIntError),
    NotFound(String),
}

fn read_number_from_file(path: &str) -> Result<i32, AppError> {
    let contents = std::fs::read_to_string(path).map_err(AppError::Io)?;
    let number = contents.trim().parse().map_err(AppError::Parse)?;
    Ok(number)
}
```

## Go Error Handling

```go
// Custom error implementation
type ValidationError struct {
    Field, Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed for %s: %s", e.Field, e.Message)
}

// Wrapping errors
if err != nil {
    return fmt.Errorf("process failed: %w", err)
}
```
