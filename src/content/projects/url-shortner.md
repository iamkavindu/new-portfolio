---
title: "url-shortner"
description: "URL shortener service built in Java — clean API design, redirect flow, and a deliberately misspelled project name."
pubDate: 2026-04-01
repo: "https://github.com/iamkavindu/url-shortner"
demo: "https://iamkavindu.github.io/url-shortner/"
stack:
  - Java
  - Spring Boot
featured: false
draft: false
---

## Problem

A classic backend exercise: accept a long URL, return a short code, redirect on lookup — with clear API boundaries and predictable failure modes.

## Approach

**url-shortner** (yes, missing an *e*) is a focused Java service around create + resolve:

- Persist mappings between short codes and target URLs.
- Expose endpoints to create a short link and to redirect on hit.
- Keep the surface area small so the design of the API and data model stay visible.

## Stack

- Java, Spring Boot
- Apache 2.0 licensed

## Outcomes

- Working demo hosted on GitHub Pages.
- Useful reference for minimal REST design and redirect semantics without extra product complexity.
