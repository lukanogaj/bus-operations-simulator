# Bus Operations Simulator

A full-stack bus operations management application designed to simulate the day-to-day workflow of a bus garage.

The system manages drivers, duties, rota allocation, planned absences, incidents, sign-on operations and real-time operational issues. It also includes AI-assisted operational recommendations.

## Live Demo

**Application:** https://bus-operations-simulator.onrender.com

> The application is hosted on Render's free tier. The first request may take around 30–60 seconds while the service wakes up.

### Demo Account

````text
Username: demo.recruiter
Password: Demo2026!
Role: Garage Supervisor


## Overview

Bus Operations Simulator was built around real operational workflows found in bus garages.

Rather than being a simple CRUD application, the project models relationships between drivers, duties, rota patterns, absences, replacement assignments and daily operational events.

The application provides separate operational views for managing scheduled work and responding to problems that occur during the operating day.

## Features

### Dashboard

Daily operational overview including:

- scheduled duties
- available and unavailable drivers
- uncovered duties
- open incidents
- sign-on status
- operational issues

### Drivers

Driver management with operational and rota information.

### Duties

Management of scheduled duties, routes, sign-on times and rota allocation.

### Allocation

Weekly allocation view connecting drivers with scheduled duties and rota patterns.

### Planned Absences

Management of planned driver absences such as:

- holidays
- training
- sickness
- other unavailable periods

Absences affect operational availability and replacement requirements.

### Sign-On Sheet

Daily sign-on workflow used to monitor drivers before their duties.

Supported statuses include:

- `EXPECTED`
- `DUE`
- `SIGNED_ON`
- `LATE`
- `ABSENT`

The system can generate daily sign-on entries and handle replacement assignments for unavailable drivers.

### Operations Board

Operational view showing unavailable drivers, affected duties and replacement coverage.

This provides a simplified simulation of the workflow used by operational staff when managing service disruption.

### Incidents

Create, track and resolve operational incidents.

### Reports

Operational reporting based on application data.

### Administration

User administration with role-based access control.

Supported application roles include operational users and management-level access.

### AI-Assisted Operations

The application integrates with the Gemini API to generate recommendations for operational issues.

AI is used as decision support rather than replacing the underlying operational logic.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- React Router

### Backend

- Node.js
- Express
- TypeScript
- REST API
- JWT authentication
- bcrypt password hashing

### Database

- PostgreSQL
- relational data model
- foreign-key constraints
- production database hosted on Neon

### AI

- Google Gemini API

### Testing and Quality

- Vitest
- TypeScript type checking
- Oxlint
- production build validation

### DevOps / Deployment

- Docker
- Docker Compose
- Render
- Neon PostgreSQL
- environment-based configuration
- Git / GitHub

## Architecture

```text
Browser
   |
   v
React + TypeScript
   |
   | REST API / JWT
   v
Node.js + Express
   |
   +--------------------+
   |                    |
   v                    v
PostgreSQL          Gemini API
   |
   v
Neon
````

In production, the React application is built with Vite and served by the Express application from the same Docker container.

The frontend communicates with the REST API using same-origin requests.

## Backend Structure

The backend is separated into route and service layers.

```text
server/
├── db/
├── middleware/
├── routes/
├── services/
└── index.ts
```

Major API areas are separated into:

- core routes
- operations routes
- administration routes

Business logic such as rota generation and sign-on processing is handled by dedicated services.

## Authentication

Authentication is implemented using JWT.

Passwords are stored as bcrypt hashes.

Protected API endpoints require a valid bearer token:

```text
Authorization: Bearer <token>
```

Role information contained in the authenticated session is used to control access to administrative functionality.

## Database Model

The PostgreSQL database contains operational entities including:

- users
- drivers
- routes
- duties
- rest day patterns
- planned absences
- incidents
- sign-on entries
- replacement assignments

The relationships between these entities allow operational changes to affect multiple areas of the application.

For example, a driver's absence can affect duty coverage, sign-on information and the Operations Board.

## Docker

The application can run locally using Docker Compose.

```bash
docker compose up --build
```

The Docker environment contains:

- Node/Express application
- production React build
- PostgreSQL database

Production uses the same application container with an externally hosted PostgreSQL database.

## Local Development

Install dependencies:

```bash
npm install
```

Create a local `.env` file based on:

```text
.env.example
```

Start the frontend development server:

```bash
npm run dev
```

Start the backend according to the local development configuration.

## Environment Variables

The application uses environment variables for sensitive and environment-specific configuration.

```env
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
PORT=3000
VITE_API_URL=http://localhost:3000
```

Secrets are not committed to the repository.

## Quality Checks

TypeScript:

```bash
npx tsc --noEmit
```

Tests:

```bash
npm test -- --run
```

Lint:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

## Deployment

Production architecture:

```text
GitHub
   |
   v
Render Web Service
   |
   +---- Docker / Node / Express / React
   |
   +---- Neon PostgreSQL
   |
   +---- Gemini API
```

Pushes to the production branch can be automatically deployed by Render.

## Project Purpose

This project was created as a portfolio application demonstrating full-stack software development through a domain with realistic operational rules.

It demonstrates:

- frontend application development
- REST API design
- relational database modelling
- authentication and authorization
- business logic implementation
- automated testing
- third-party API integration
- Docker-based deployment
- production environment configuration

The domain is based on bus operations, allowing software engineering concepts to be applied to realistic scheduling and operational workflows.

## Author

**Lukasz Nogaj**

Full-stack / JavaScript developer focused on React, TypeScript, Node.js and PostgreSQL.
