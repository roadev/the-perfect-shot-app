# The Perfect Shot - Frontend

A modern Next.js application for astrophotography and landscape photography planning.

## Features

- **Sky Map**: Interactive sky map for planning shots.
- **Weather Forecasts**: Specialized forecasts for stargazing.
- **User Gallery**: Share your best captures with the community.
- **DO Spaces Integration**: Secure, direct client-side photo uploads using presigned URLs.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **API Client**: Custom Fetch wrapper with JWT support

## Development

1. **Install dependencies**:

```bash
pnpm install
```

2. **Configure environment**:

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL="http://localhost:7000/api"
```

3. **Start the development server**:

```bash
pnpm dev
```

## Storage Implementation

The application uses **DigitalOcean Spaces** for photo storage. 

1. The frontend requests a presigned `PUT` URL from the backend.
2. The file is uploaded directly from the browser to DO Spaces.
3. The backend is notified of the new photo record after a successful upload.
