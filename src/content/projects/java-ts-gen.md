---
title: "Java-TS-Gen"
description: "Maven plugin that generates TypeScript interfaces from annotated Java records — zero runtime overhead, type safety across the full-stack boundary."
pubDate: 2026-04-06
repo: "https://github.com/loomforge/java-ts-gen"
stack:
  - Java
  - TypeScript
  - Maven
  - Annotation Processing
featured: true
draft: false
---

## Problem

On a Java backend + TypeScript frontend, DTOs and interfaces drift. You change a record field, forget the frontend, and discover the mismatch at runtime. Manual sync is tedious and error-prone.

## Approach

**Java-TS-Gen (JTG)** is a developer-time Maven plugin that scans for `@TsRecord` on Java `record`s and emits TypeScript definitions next to the source.

- Annotation uses `RetentionPolicy.SOURCE` → **zero runtime cost** in production.
- Hooks into `generate-sources` (or `mvn jtg:generate`) so types regenerate on every normal build.
- Options for `exportName` and `asType` when frontend naming differs from the Java type.

```java
@TsRecord
public record User(String name, int age, boolean active, UUID id) {}
```

Produces:

```typescript
export interface User {
  name: string;
  age: number;
  active: boolean;
  id: string;
}
```

## Stack

- Java annotation library (`jtg-annotation`, provided/optional scope)
- Maven plugin (`jtg-maven-plugin`) running at generate-sources
- Source-level parsing — no runtime classpath dependency on the generator

## Outcomes

- Single source of truth for cross-boundary types: the Java record.
- Fits existing Maven workflows without a separate codegen service or heavy framework.
- Documented in a [practical guide](/blog/generating-typescript-from-java-records/).

## Design choice

Generate at **build time, next to the source**, rather than a remote schema registry or OpenAPI-only pipeline. That keeps the feedback loop inside the IDE and the familiar `mvn compile` path — the path of least resistance for day-to-day Java teams.
