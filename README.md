# The Perfect Shot - Photographer's Dashboard 📸✨

> **Plan with Precision. Capture with Passion.**

The Perfect Shot is a premium, dark-mode-first dashboard built for the modern astrophotographer. It unifies complex planning data—weather forecasts, celestial event tracking, and location scouting—into a single, high-performance interface.

## 🔥 Product Value

Planning for the perfect shot often involves juggling multiple apps (maps, weather, moon phases). This application solves that fragmentation by providing a **unified source of truth**:
- **Scout**: High-resolution satellite maps with locationcuration.
- **Timing**: Specialized weather metrics including "Seeing" and "Cloud Cover" visual timelines.
- **Targets**: Integrated celestial event tracking so you always know what's rising.
- **Share**: A community gallery to showcase high-resolution results directly from the dashboard.

## 🎨 User Experience (UX)

Designed with a **Visual Excellence** first mindset:

- **Red Mode**: A dedicated high-contrast red mode to preserve night vision while in the field.
- **Unified Dashboard**: Rearranged layout that prioritizes the most critical data points side-by-side (Map + Forecast).
- **Premium Aesthetics**: Built with a sleek glassmorphism aesthetic, smooth transitions, and a mobile-responsive grid system.

## 💡 Technical Excellence

The frontend is not just a UI; it's an optimized engine built for **reliability** and **performance**:

- **Next.js 15 (App Router)**: Utilizing Server Components for lightning-fast initial loads and centralized data fetching.
- **Vercel Build-Resilience**: Implemented a custom `ApiClient` with **x-vercel-protection-skip** support and robust try-catch logic. This ensures that the application build process is resilient to temporary API protection or downtime, guaranteeing successful deployments.
- **Secure Storage Flow**: Handles direct-to-cloud uploads using presigned URLs, keeping user secrets secure and reducing server load.
- **Tailwind CSS & shadcn/ui**: Leveraging a modern design system for consistent, premium visuals and modular code.

---

## 🚦 Getting Started

### Prerequisites
- Node.js 22+
- pnpm

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Environment**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:7000/api"
   NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
   # Optional: For build-time bypass of protected backends
   VERCEL_BYPASS_TOKEN="your-bypass-secret"
   ```

3. **Run Development Server**:
   ```bash
   pnpm dev
   ```

---

## 📖 Feature Highlights

### 🛰️ Interactive Sky Map
Scout your next location with high-resolution satellite imagery. Integrated with Mapbox for smooth exploration and location-specific metadata.

### 🌡️ Precision Weather
Don't just look at "Rain/Sun". Our dashboard breaks down:
- **Cloud Cover %**: Knowing exactly when the sky clears.
- **Seeing Metric**: Predicting atmospheric stability for long exposures.
- **Sky Score**: An aggregate rating of the night's potential.

### 🌑 Red Light Mode
Toggle the night vision mode to keep your pupils dilated while checking the dashboard in the dark. Essential for field work.

### 🖼️ Instant Gallery
Upload your captures directly to the community gallery. Powered by DigitalOcean Spaces for high-speed delivery of raw image previews.
