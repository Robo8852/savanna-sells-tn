# Software Architecture Patterns

Reference: ByteByteGo — Top 7 Software Architecture Patterns

This document catalogs the seven most common software architecture patterns, then analyzes which ones apply (now and in the future) to the savanna-sells-tn real estate platform.

---

## The 7 Patterns

### 1. Client-Server Architecture

```
Client  -->  Internet  -->  Load Balancer  -->  Service
                                |
                               CDN
```

The classic request-response model. A client (browser or mobile app) sends requests over the internet to a server, typically fronted by a load balancer and a CDN for static assets. The server processes the request and returns a response. Simple, well-understood, and the backbone of most web applications.

**Best for:** Standard web applications, CRUD apps, content sites.

### 2. Async Task Execution with Queues

```
Presentation Layer  -->  Business Logic Layer  -->  Data Access Layer  -->  DB
                              |
                         Task Queue
                              |
                        Background Workers
```

A layered architecture extended with asynchronous queue processing. The request-handling layers remain synchronous, but long-running or deferrable work gets pushed onto a queue and processed by background workers. This keeps the user-facing layer responsive while heavy lifting happens in the background.

**Best for:** Data syncing, scheduled imports, email sending, report generation.

### 3. Serverless Architecture

```
Event/Request  -->  Lambda Function  -->  Lambda Workers
                                              |
                                         External Services / DB
```

Compute is event-driven and ephemeral. Functions spin up on demand, execute, and shut down. No servers to manage, no idle capacity to pay for. The platform handles scaling automatically. Trade-off: cold starts, execution time limits, and less control over the runtime environment.

**Best for:** Event-driven workloads, APIs with variable traffic, glue logic between services.

### 4. Pipes and Filters

```
Data Source  -->  Filter 1  -->  Filter 2  -->  Filter 3  -->  Data Sink
```

Data flows through a sequence of independent, composable transformation steps. Each filter takes input, processes it, and passes the result to the next filter. Filters are decoupled and can be reordered, replaced, or extended without rewriting the pipeline.

**Best for:** Data ingestion pipelines, ETL processes, content processing chains.

### 5. Event-Driven Architecture

```
Producer  -->  Event Bus  -->  Consumer A
                          -->  Consumer B
                          -->  Consumer C
```

Producers emit events onto a bus (or broker) without knowing who consumes them. Consumers subscribe to events they care about. This fully decouples producers from consumers, allowing independent scaling and deployment of each side.

**Best for:** Systems with many loosely coupled components, real-time notifications, audit logging.

### 6. Microservices Architecture

```
API Gateway  -->  Service A  [DB-A]
             -->  Service B  [DB-B]
             -->  Service C  [DB-C]
```

The application is decomposed into small, independently deployable services, each owning its own data store. Services communicate over the network (REST, gRPC, messaging). Enables independent scaling and team autonomy but introduces operational complexity: service discovery, distributed tracing, eventual consistency.

**Best for:** Large teams, complex domains with clear bounded contexts, systems requiring independent scaling per feature.

### 7. Monolithic Architecture

```
Single Deployment Unit
  Web Layer  -->  Component A
             -->  Component B
             -->  Component C
                      |
                  Shared DB
```

Everything ships as one unit. All components share a single codebase, deployment pipeline, and database. Simple to develop, test, and deploy at small scale. Becomes painful when the codebase grows, teams step on each other, or one component needs to scale differently than the rest.

**Best for:** Early-stage projects, small teams, MVPs, applications where simplicity outweighs flexibility.

---

## Pattern Summary

| Pattern | Key Trait | Complexity | Scaling Model |
|---|---|---|---|
| Client-Server | Request-response | Low | Vertical / horizontal via LB |
| Async Task Execution | Background queue processing | Medium | Workers scale independently |
| Serverless | Event-driven, ephemeral compute | Low-Medium | Automatic per-invocation |
| Pipes and Filters | Sequential data transformation | Medium | Per-filter scaling |
| Event-Driven | Decoupled pub/sub | Medium-High | Per-consumer scaling |
| Microservices | Independent services + data stores | High | Per-service scaling |
| Monolithic | Single deployable unit | Low | Scale the whole thing |

---

## How This Applies to savanna-sells-tn

### Current Architecture

The project today is a **Client-Server + Serverless hybrid**:

```
Next.js (Vercel)          Convex (BaaS)
  Browser  -->  Next.js  -->  Convex Functions  -->  Convex DB
                   |
                  CDN (Vercel Edge)
```

- **Client-Server**: The Next.js frontend serves pages and communicates with Convex as the backend. This is textbook client-server with a managed backend.
- **Serverless**: Convex functions (queries, mutations, actions) are serverless by nature. They run on demand, scale automatically, and require no server management. The custom CMS for adding listings runs entirely through Convex mutations.

This is the right starting point. Two patterns, minimal operational overhead, and the team can focus on product instead of infrastructure.

### What Changes with RealTrack MLS Integration

When the project integrates with the RealTrack MLS API, new patterns become relevant:

| Concern | Pattern | Why |
|---|---|---|
| Scheduled MLS data sync | **Async Task Execution** | MLS data needs to be pulled on a schedule (e.g., every 15 minutes). This is a background job, not a user-facing request. Convex cron jobs + actions serve as the queue/worker model. |
| MLS data normalization | **Pipes and Filters** | Raw MLS data from RealTrack needs to be normalized, validated, enriched (e.g., geocoding), and then stored. A pipeline of discrete steps keeps this maintainable. |

The projected architecture:

```
Next.js (Vercel)                     Convex (BaaS)
                                  +---------------------------+
  Browser  -->  Next.js  -------->|  Convex Queries/Mutations |
                                  |  (listings, CMS, search)  |
                                  +---------------------------+
                                              |
                                  +---------------------------+
                                  |  Convex Cron Job          |
                                  |  (scheduled MLS sync)     |
                                  +---------------------------+
                                              |
                                  +---------------------------+
                                  |  Convex Action            |
                                  |  fetch from RealTrack API |
                                  +---------------------------+
                                              |
                                  +---------------------------+
                                  |  Pipeline (internal)      |
                                  |  normalize -> validate -> |
                                  |  enrich -> store          |
                                  +---------------------------+
```

### Recommended Evolutionary Path

| Phase | Patterns in Use | Notes |
|---|---|---|
| **Now (Phase 1)** | Client-Server + Serverless | Custom CMS, manual listings. Keep it simple. |
| **MLS Integration (Phase 2)** | Add Async Task Execution + Pipes and Filters | Convex cron jobs trigger scheduled syncs. Data flows through a normalize/validate/store pipeline implemented as composable Convex functions. |
| **Future (if needed)** | Evaluate Event-Driven for real-time MLS updates | Only if RealTrack offers webhooks or push notifications. Do not add this preemptively. |

**What to avoid:**

- **Premature microservices.** There is no reason to split this into independent services. Convex handles the backend as a single coherent unit, and the domain (real estate listings) does not have bounded contexts complex enough to justify service decomposition.
- **Event-Driven architecture before you need it.** If MLS sync is poll-based (cron), an event bus adds complexity with no benefit. Revisit only if the integration model changes to push-based.

### How This Informs Spec Writing

When writing specs for new features on this project:

1. **Default to Convex functions for all backend logic.** Every spec should assume queries, mutations, and actions as the building blocks. Do not introduce external services or infrastructure unless the spec explicitly justifies why Convex cannot handle it.

2. **For MLS-related specs, define the pipeline stages.** Any spec that touches MLS data should clearly name the transformation steps: fetch, normalize, validate, enrich, store. Each step should be a discrete function that can be tested independently.

3. **For scheduled work, specify the cron configuration.** Specs involving background sync should include the schedule interval, retry behavior on failure, and how stale data is handled between sync cycles.

4. **Do not spec microservice boundaries.** Keep all logic within the Convex project. If a spec starts drawing boxes around "services," push back and ask whether Convex functions with clear module boundaries would accomplish the same goal with less complexity.

5. **Name the pattern in the spec.** When a spec introduces architectural decisions, reference the pattern by name (e.g., "This feature uses Async Task Execution via Convex cron jobs"). This keeps the team aligned on vocabulary and makes architecture reviews faster.
