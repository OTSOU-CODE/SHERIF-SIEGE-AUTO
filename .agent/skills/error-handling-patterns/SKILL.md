---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---

# Error Handling Patterns

Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging experiences.

## When to Use This Skill

- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems

## Core Concepts

### 1. Error Handling Philosophies

**Exceptions vs Result Types:**

- **Exceptions**: Traditional try-catch, disrupts control flow
- **Result Types**: Explicit success/failure, functional approach
- **Error Codes**: C-style, requires discipline
- **Option/Maybe Types**: For nullable values

**When to Use Each:**

- Exceptions: Unexpected errors, exceptional conditions
- Result Types: Expected errors, validation failures
- Panics/Crashes: Unrecoverable errors, programming bugs

### 2. Error Categories

**Recoverable Errors:**

- Network timeouts, Missing files, Invalid user input, API rate limits

**Unrecoverable Errors:**

- Out of memory, Stack overflow, Programming bugs (null pointer, etc.)

## Specialized Resources

This skill is divided into three key areas. Consult the relevant resource:

### 1. Language-Specific Patterns

Detailed implementation patterns for Python, TypeScript/JavaScript, Rust, and Go.
👉 **[`resources/language-patterns.md`](resources/language-patterns.md)**

### 2. Universal Resilience Patterns

Architectural patterns like Circuit Breaker, Error Aggregation, and Graceful Degradation.
👉 **[`resources/universal-patterns.md`](resources/universal-patterns.md)**

### 3. Best Practices & Pitfalls

General guidelines, things to avoid, and checklist items.
👉 **[`resources/best-practices.md`](resources/best-practices.md)**
