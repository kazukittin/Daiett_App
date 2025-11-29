# Daiett App Frontend

This folder contains the client-side React + Vite application. It is responsible for UI rendering, user interactions, navigation, and calling the backend over HTTP.

- No direct database or storage access is performed here.
- Heavy domain/business logic (weight, calorie, workout calculations or validations) must come from backend APIs.
- Components should focus on presentation and delegate data fetching to the API client in `src/api/` and hooks that wrap it.

Run the app with:

```bash
npm install
npm run dev
```
