# 🚀 TaskOrbit Backend API

TaskOrbit is a high-performance, multi-tenant Project Management API built with **NestJS**, **Prisma**, and **PostgreSQL**. The platform features enterprise-grade security armor, RBAC (Role-Based Access Control) authorization, and a multi-tiered **Redis** in-memory caching system designed to scale.

---

## 🏗️ Architectural Overview

The core system is structured around an automated, hardened lifecycle designed to protect data integrity and maximize throughput speed:

```text
       [ Client Request ]
               │
      🛡️  HELMET / CORS SECURITY (HTTP Header Masking)
               │
      ⏱️  RATE LIMITER (Global ThrottlerGuard)
               │
      🔑  AUTHENTICATION (Passport JWT Validation)
               │
      🏅  AUTHORIZATION (Dynamic Reflective RolesGuard)
               │
      📥  VALIDATION PIPE (DTO Data Payload Whitening)
               │
      ⚡  REDIS RAM LAYER (Blazing Fast Cache-Aside Hits)
               │
      🐢  POSTGRESQL LAYER (Prisma Relational Data Engine)
               │
      📤  TRANSFORM INTERCEPTOR (Standardized Corporate JSON Output)
               │
         [ Clean Response ]