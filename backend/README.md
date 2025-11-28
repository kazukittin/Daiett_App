# Daiett App Backend

This folder hosts the API server and all diet-related business logic.

- Exposes RESTful JSON endpoints under `/api/**` for weight, meals, and workouts.
- Owns domain rules and calculations (weight summaries/trends, calorie balance, workout plans) and enforces validation of incoming data.
- Handles data access/storage; frontend should not know storage details and must communicate only via HTTP requests.
- Shared calculations and validation previously in the frontend have been moved into service modules in `services/`.

Run the server with:

```bash
npm install
npm start
```
