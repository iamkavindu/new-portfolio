---
title: "velocity-renderer"
description: "Simple Apache Velocity template renderer backed by Spring Boot and Vaadin Flow — evaluate templates and see results quickly."
pubDate: 2025-12-04
repo: "https://github.com/iamkavindu/velocity-renderer"
demo: "https://velocity-renderer.fly.dev/"
stack:
  - Java
  - Spring Boot
  - Apache Velocity
  - Vaadin
featured: false
draft: false
---

## Problem

Apache Velocity is still used in many Java shops for email and document templates. Trying out a template often means wiring a full app or dropping into a REPL. A small, focused renderer lowers that friction.

## Approach

**velocity-renderer** provides a straightforward UI and backend path to paste a Velocity template, supply context, and render output.

- Spring Boot hosts the app.
- Apache Velocity evaluates templates.
- Vaadin Flow supplies a simple interactive front end.
- Deployed on Fly.io for a live demo.

## Stack

- Java, Spring Boot, Apache Velocity, Vaadin Flow
- Apache 2.0 licensed

## Outcomes

- Live instance at [velocity-renderer.fly.dev](https://velocity-renderer.fly.dev/).
- Handy utility for exploring Velocity syntax and context binding without spinning up a larger project.
