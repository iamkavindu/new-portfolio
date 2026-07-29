---
title: "stream-app"
description: "Video upload and HLS streaming platform — presigned S3 uploads, SNS/SQS fan-out, GraalVM Lambda transcoding, and browser playback with hls.js."
pubDate: 2026-06-27
repo: "https://github.com/iamkavindu/stream-app"
stack:
  - Java
  - Spring Boot
  - AWS
  - Vue 3
  - FFmpeg
  - PostgreSQL
featured: true
draft: false
---

## Problem

Uploading a video is easy. Turning that upload into a **streamable** asset is not: metadata must stay consistent across services, large files should never pass through the API, and browsers expect HLS (manifest + segments), not a raw MP4 download link.

## Approach

**stream-app** splits the system into three flows — upload, transcode, and playback — held together by stable contracts.

### Upload

- Vue SPA computes SHA-256 in the browser, requests a presigned PUT URL, and uploads directly to S3.
- Backend stores metadata in PostgreSQL (`AWAITING_UPLOAD` → later states) and rejects duplicates via content hash (`409` + RFC 7807 problem details).
- Shared `S3ObjectKeys` utility keeps object-key layout identical across backend, Lambda, and tests.

### Transcode

- S3 `ObjectCreated` events fan out through SNS to two SQS queues: one for status updates, one for a **GraalVM-native** Spring Cloud Function Lambda.
- Lambda runs FFmpeg to **fMP4 HLS** with `single_file` (`index.m3u8` + `media.mp4`), then signals completion back to the API.

### Playback

- Clients poll while items are in progress, then request a signed manifest URL for `PLAY_READY` videos and play with **hls.js**.
- Status is an explicit state machine: `AWAITING_UPLOAD` → `TRANSCODING_IN_PROGRESS` → `PLAY_READY` | `FAILED`.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 25, Spring Boot, PostgreSQL, Flyway, jOOQ |
| Messaging | Spring Cloud AWS (S3, SNS, SQS) |
| Transcode | GraalVM native Lambda, FFmpeg |
| Frontend | Vue 3, TypeScript, Tailwind, hls.js |
| Local infra | Docker Compose, Floci (S3 emulator), Testcontainers |

## Outcomes

- End-to-end path from “user picked an MP4” to “browser is playing HLS” without proxying file bytes through the API.
- Integration tests cover backend + Lambda against real PostgreSQL and local S3/SQS emulators.
- Architecture write-up published as a [long-form post](/blog/building-a-video-upload-and-hls-streaming-pipeline/).

## Trade-offs still open

- Production playback needs CloudFront signed cookies (or a media proxy); a single presigned manifest URL is not enough for relative segment fetches on a private bucket.
- Single-bitrate HLS today; multi-rendition adaptive streaming is the natural next step.
