# TechStore

TechStore is a React + Vite e-commerce frontend for browsing products, managing a cart, saving wishlist items, handling checkout, and viewing account pages.

## Overview

This project is built as a frontend-first store experience. It uses:

- React 19
- Vite
- Zustand for client state
- `localStorage` for persistence
- DummyJSON for product/auth mock data
- Provinces Open API for Vietnam address data

## Features

- Product browsing and search
- Category pages
- Product detail pages
- Cart with quantity and stock handling
- Wishlist with guest pending support
- Authentication UI and session persistence
- Account pages
- Checkout flow with address selection
- Order creation and local order persistence
- Province, district, and ward selection

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Environment Variables

The app reads the following environment variables:

- `VITE_API_BASE_URL`
- `VITE_ORDER_MAIL_MODE`
- `VITE_ORDER_MAIL_API_URL`
- `VITE_ORDER_MAIL_DELAY_MS`

`VITE_API_BASE_URL` overrides the default API base URL used by the app services. If empty, the app falls back to DummyJSON.

`VITE_ORDER_MAIL_MODE` controls order email behavior:
- `mock`: simulate sending mail in the browser
- `fail`: force a mock failure for testing
- `backend`: send the order to Laravel so Laravel can deliver it to Mailtrap

`VITE_ORDER_MAIL_API_URL` is the backend endpoint used when `VITE_ORDER_MAIL_MODE=backend`.

`VITE_ORDER_MAIL_DELAY_MS` controls how long the mock mode waits before returning success.

Example:

```env
VITE_API_BASE_URL=https://dummyjson.com
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_ORDER_MAIL_MODE=backend
VITE_AUTH_API_BASE_URL=/api
VITE_ORDER_MAIL_API_URL=/api/orders/send-mail
VITE_ORDER_MAIL_DELAY_MS=800
```

## Project Structure

- `src/App.jsx`: app shell, routing, auth bootstrap
- `src/services/`: API and data sync helpers
- `src/store/`: Zustand stores
- `src/utils/`: storage, auth, validation, and mapping helpers
- `src/features/`: page-level screens
- `src/components/`: shared sections and layout UI
- `src/shared/`: reusable shared UI and layout parts

## Core Data Flow

### Auth

- Login and register flows store the current session in `src/utils/authStorage.js`
- Session data is persisted in `localStorage` and a small browser cookie for session continuity
- `App.jsx` and protected routes read the current auth state from the shared auth storage
- `techstore:auth-changed` is used to refresh UI state after login, logout, or auth updates

### Cart

- Cart items are stored per user scope in `localStorage`
- Guest cart and user cart can be merged safely when a user signs in
- Cart quantity is clamped by stock
- Catalog sync keeps cart items aligned with product data
- Remote cart id is stored separately per user when remote sync is available

### Wishlist

- Wishlist items are stored per user scope in `localStorage`
- Guest favorites are queued in `techstore_wishlist_pending`
- Pending guest items are merged into the signed-in user wishlist on auth changes
- Duplicate items are deduped by product id

### Checkout

- Checkout reads cart items from the cart store
- Authenticated users can pick from saved addresses
- Manual address entry is available when needed
- Province, district, and ward options are loaded from the address API
- Orders are saved through `src/services/orderApi.js`

## Address Data

The address flow uses:

- `src/utils/addressStorage.js` for saved addresses
- `src/services/addressApi.js` for province, district, and ward lists

Saved addresses are scoped by user when a user is logged in. Guest data uses a guest scope.

## Important Notes

- Product, auth, cart, and checkout data are mostly frontend-managed in the current version.
- DummyJSON is used as a mock remote backend for some flows.
- The project is intentionally safe to run locally without a custom backend.
- If DummyJSON returns an error for a mock endpoint, the UI should still remain usable.

## Common Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Suggested Next Steps

- Add automated tests for cart, wishlist, and auth helpers
- Replace mock auth endpoints with a real backend session flow
- Add CI for lint and build
- Document deployment steps for production hosting

