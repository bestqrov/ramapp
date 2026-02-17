# Deploying to Hostinger VPS with Coolify

This guide explains how to deploy your **Backend (Node.js/Express)** and **Frontend (Next.js)** to a Hostinger VPS using Coolify.

## Prerequisites
-   A Hostinger VPS with Coolify installed (or any server with Docker & Coolify).
-   This repository pushed to GitHub.

## Configuration Files Created
1.  `Dockerfile` (Backend): Builds the Node.js API.
2.  `frontend/Dockerfile` (Frontend): Builds the Next.js UI.
3.  `docker-compose.yml`: Orchestrates both services.

## Deployment Steps in Coolify

1.  **Login to Coolify**: Access your Coolify dashboard.
2.  **Create a New Service**:
    -   Go to "Projects" -> "New" -> "Application".
    -   Select "Source: Git Repository" (GitHub).
    -   Connect your repository `bestqrov/ramapp`.
3.  **Configuration**:
    -   **Build Pack**: Select "Docker Compose".
    -   **Docker Compose Location**: `docker-compose.yml` (default).
4.  **Environment Variables**:
    -   Go to "Secrets" or "Environment Variables" tab in Coolify for your service.
    -   Add the following:
        -   `DATABASE_URL`: Your MongoDB connection string.
        -   `JWT_SECRET`: A strong secret for authentication.
        -   `FRONTEND_URL`: The URL where your frontend will be accessible (e.g., `https://app.yourdomain.com`).
        -   `NEXT_PUBLIC_API_URL`: The URL where your backend will be accessible (e.g., `https://api.yourdomain.com`).
5.  **Expose Ports**:
    -   Coolify typically handles reverse proxying. Ensure:
        -   Backend service is mapped to internal port `3000`.
        -   Frontend service is mapped to internal port `3001`.
    -   Assign domains to each service in Coolify settings (e.g., `api.example.com` -> Backend:3000, `app.example.com` -> Frontend:3001).

## Notes
-   If you are using a managed MongoDB (like MongoDB Atlas), just provide the `DATABASE_URL`.
-   If you want to host MongoDB yourself within this stack, uncomment the `mongodb` section in `docker-compose.yml` and configure the volumes.
