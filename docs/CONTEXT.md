# Project Overview

## AutoStock is a Progressive Web App (PWA)-based inventory management system designed for businesses handling both:

Serialized products (e.g., vehicles with VINs)

Non-serialized products (e.g., spare parts, consumables)

## The system must support:

Stock In / Stock Out

Serialized asset tracking (VIN-level)

Inventory snapshot reporting

Movement auditing

Offline-first capability

Native-like PWA experience

## The architecture must prioritize:

Correct data modeling

Auditability

Transaction safety

Scalability

Simplicity in UI logic


# Mission

Build a production-grade inventory system that:

Tracks vehicles as unique assets (VIN-based)

Tracks spare parts by quantity

Uses movement-based inventory (stock is derived, never stored)

Supports offline warehouse/showroom operations

Feels like a native mobile app via PWA

## Core principle:

Inventory is not stored — it is derived from movements or serialized state.


# Stack

- Next.js
- Prisma
- PostgreSQL
- Tailwind CSS (for styling)
- TypeScript
- PWA (for offline support)
- Shadcn UI (for UI components)
- NextAuth.js (for authentication)


# Core Inventory Philosophy

## Two Product Behaviors

### A. Serialized Products

Examples:

Vehicles

Engines

Unique machinery

Rules:

Each unit has its own row

Identified by serial number (VIN)

Quantity is derived using COUNT

Lifecycle must be trackable

### B. Non-Serialized Products

Examples:

Brake pads

Engine oil

Tires

Rules:

Tracked by quantity

Quantity changes via stock movements

Stock derived from SUM(IN) - SUM(OUT)


# PWA Architecture

## Required Features

Installable app (manifest + service worker)

Standalone display mode

Push notifications (optional phase 2)



# System Principles

Stock is derived, never stored.

Serialized items must have their own model.

Inventory changes only through movements.

All stock operations must be transactional.

UI behavior depends on product.isSerialized.

Data integrity > short-term simplicity.

Design for auditability from day one.



# Future Expansion Readiness

The system must support:

Multiple locations

Internal transfers

Audit history per VIN

Reporting dashboards

Low-stock alerts

Branch-level stock

Role-based access

work offline

Camera support for VIN scanning

Optimistic UI updates