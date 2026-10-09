# WayFinder - Full-Stack Tourism & Travel Platform

WayFinder is a modern, full-stack travel planning and tourism platform designed to help travelers discover destinations, generate intelligent itineraries with spot details and interactive map routes, estimate trip budgets, receive real-time weather information, and consult an AI-powered travel assistant.

---

## Features

- **Authentication & User Management**: Secure user registration and login powered by Spring Security with stateless JWT authentication and client-side session management.
- **Plan Trip**: Custom trip planning with comprehensive tourist spot details, interactive Google / Leaflet map directions, and grounded real-time budget calculations (accommodation, food, travel, activities).
- **Explore Destinations**: Browse, search, and filter tourist spots across categories with ratings, rich media, and community traveler reviews.
- **Live Info & Weather**: Real-time weather forecasts, location search, and geocoded coordinates.
- **AI Travel Assistant**: Conversational AI companion powered by Google Gemini API for localized tips, recommendations, and contextual destination answers.
- **Settings & Personalization**: Light and dark theme toggles, multi-language support (English and Hindi), currency preferences, and profile configuration.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Leaflet](https://leafletjs.com/), [Lucide React](https://lucide.dev/) |
| **Backend** | [Spring Boot](https://spring.io/projects/spring-boot) (Java 25), [Spring Security](https://spring.io/projects/spring-security) (JWT), [Spring Data JPA](https://spring.io/projects/spring-data-jpa) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (Relational DB for users, tourist spots, reviews, trips, fares) |
| **AI / Services** | [Google Gemini API](https://ai.google.dev/) (Travel assistant & grounded budget planning), [OpenStreetMap / Nominatim](https://nominatim.openstreetmap.org/) |

---

## Project Structure

```text
WayFinder/
├── backend/            # Spring Boot REST API
│   ├── src/main/java/  # Controllers, services, entities, repositories, security
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-example.properties
│   ├── pom.xml
│   └── .env.example
├── frontend/           # Next.js 16 Web Application
│   ├── app/            # App Router pages (plan-trip, explore, ai-assistant, settings, etc.)
│   ├── components/     # Reusable UI, layout, and assistant components
│   ├── messages/       # i18n localization dictionaries (en.json, hi.json)
│   ├── package.json
│   └── .env.example
├── .env.example        # Root environment template
├── .gitignore          # Repository-wide ignore rules
└── README.md
```

---

## Environment Variables

### Backend Configuration

| Variable | Property Key | Default / Fallback | Description |
| :--- | :--- | :--- | :--- |
| `DB_URL` | `spring.datasource.url` | `jdbc:postgresql://localhost:5432/tourism_db` | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | `spring.datasource.username` | `postgres` | Database username |
| `DB_PASSWORD` | `spring.datasource.password` | *(empty)* | Database password |
| `JWT_SECRET` | `app.jwt.secret` | *(empty)* | Secret key for JWT signing (minimum 32 UTF-8 bytes) |
| `JWT_EXPIRATION_SECONDS` | `app.jwt.expiration-seconds` | `3600` | JWT token expiration in seconds (1 hour) |
| `GEMINI_API_KEY` | `app.gemini.api-key` | *(empty)* | Google Gemini API key for AI assistant & budgeting |
| `FRONTEND_ORIGIN` | `app.cors.allowed-origin` | `http://localhost:3000` | Allowed CORS origin for frontend requests |

### Frontend Configuration

| Variable | Default / Fallback | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | URL of the backend Spring Boot REST API |
| `NEXT_PUBLIC_GEMINI_API_KEY` | *(optional)* | Optional client-side Gemini key if using direct client AI features |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(optional)* | Optional client-side Google Maps API key |

---

## Setup & Running Locally

### Prerequisites

- **Java JDK 25**
- **Node.js 18+** & **pnpm** (or npm)
- **PostgreSQL 14+** running locally

---

### 1. Database Setup

Create the PostgreSQL database before launching the backend:

```sql
CREATE DATABASE tourism_db;
```

---

### 2. Backend Setup (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file and configure your credentials:
   ```bash
   cp .env.example .env
   ```
   *Alternatively, configure your environment variables or update `src/main/resources/application.properties`.*

3. Run the backend service:
   - **Linux / macOS**:
     ```bash
     ./mvnw spring-boot:run
     ```
   - **Windows PowerShell**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```

Backend API will be running on `http://localhost:8080`.

---

### 3. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

Frontend application will be accessible at `http://localhost:3000`.

---

## License

This project is licensed under the MIT License.
