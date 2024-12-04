## Installation
Clone the repository.
### Backend
1. Navigate to the `gestion-certifications` directory.
2. Install dependencies:
    ```sh
    npm install
    ```
3. For production, update the `.env` file with secure values:
    ```env
    ACCESS_TOKEN_SECRET=yourproductionaccesstokensecret
    REFRESH_TOKEN_SECRET=yourproductionrefreshtokensecret
    PORT=3000
    DB_USER=postgres
    DB_HOST=production-db-host
    DB_DATABASE=certifications_db
    DB_PASSWORD=production-password
    DB_PORT=5432
    ALLOWED_ORIGINS=https://production.com
    ```

### Frontend
1. Navigate to the `gestion-certifications-ui` directory.
2. Install dependencies:
    ```sh
    npm install
    ```
3. For production, update the `.env.production` file:
    ```env
    VUE_APP_API_BASE_URL=https://api.production.com
    VUE_APP_BASE_URL=https://production.com
    ```

## Usage

### Backend
Start the backend server from the `gestion-certifications` directory:
```sh
node server.js
```

### Frontend
- Start the frontend development server from the `gestion-certifications-ui` directory:
    ```sh
    npm run serve
    ```
- Build the frontend application for production:
    ```sh
    npm run build
    ```

## Features
- **Admin Dashboard**: Manage managers and employees.
- **Manager Dashboard**: Manage employees and their certifications.
- **Employee Public View**: Public view of an employee's certifications.
- **Authentication**: Login and role management (admin, manager, employee).
