# Honour Your Mentor

A place to honour the teachers, mentors and guides who shaped you: tributes,
letters, photos, videos and voice notes, shared with the people who follow you.

## Repository layout

```
frontend/   Expo / React Native app (web, iOS, Android)
backend/    Spring Boot API (Java 21) + Neon PostgreSQL
```

## Run it locally

### 1. Backend

```bash
cd backend
cp .env.example .env          # then fill in the Neon URL, user, password and a JWT_SECRET
.\mvnw.cmd spring-boot:run    # Windows (PowerShell / cmd)
./mvnw spring-boot:run        # macOS / Linux / Git Bash
```

No Maven install needed: the wrapper downloads Maven 3.9.16 on first run.

**Java 21 (one-time setup).** The backend must be built with JDK 21, even if a newer
Java is your default. Install a JDK 21, then create `~/.m2/toolchains.xml`
(`C:\Users\<you>\.m2\toolchains.xml` on Windows) pointing at it:

```xml
<toolchains>
  <toolchain>
    <type>jdk</type>
    <provides><version>21</version></provides>
    <configuration><jdkHome>C:\path\to\jdk-21</jdkHome></configuration>
  </toolchain>
</toolchains>
```

Maven then uses that JDK automatically for this project only.

The API runs on http://localhost:8080 and applies database migrations
(`backend/src/main/resources/db/migration`) on startup.
For a throwaway in-memory database instead of Neon:
`mvn spring-boot:run -Dspring-boot.run.profiles=dev`.

### 2. Frontend

```bash
cd frontend
npm install
npx expo start --web --port 8081
```

On localhost the app talks to the backend at http://localhost:8080/api/v1.
The backend's CORS settings allow http://localhost:8081.

## Checks

```bash
cd frontend && npx tsc --noEmit && npx expo lint
cd backend && mvn test
```

## Secrets

Never commit real credentials. `backend/.env` is git-ignored;
`backend/.env.example` documents the variables with placeholders only.
