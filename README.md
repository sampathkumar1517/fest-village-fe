# Village Festival Manager — Frontend

Vite + React SPA that recreates [Village Festival Manager](https://village-festival-manager-kte.caffeine.xyz/) against the NestJS backend.

## Stack

- React 18 + Vite 7
- Tailwind CSS 4
- react-router-dom 7
- axios
- lucide-react
- sonner (toasts)
- recharts (analytics)

## Setup

1. Copy env:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (default `http://localhost:3000`) |

2. Install and run (backend must be running):

```bash
npm install
npm run dev
```

App: `http://localhost:5173`

## Pages / routes

| Route | Page |
|-------|------|
| `/` , `/festival` | Festivals — create / list / delete cards |
| `/collection` | Collections — family payments |
| `/expenses` | Expenses — category totals + list |
| `/analytics` | Analytics — summary, charts, WhatsApp share |
| `/review` | Review — feature checklist + star feedback |
| `/users` | Users directory (extra) |
| `/login` | Login (extra) |
| `/register` | Register (extra) |

Core tabs match the reference UI. Users and Login/Register are kept as extras.

## Design tokens

- Background cream `#FFFBEB` with dotted grid
- Primary saffron `#d35400`
- Fonts: Playfair Display (headings), Inter (body)
- Cards: white with orange top border (`.festive-card`)
- Max content width: `max-w-5xl`
- Desktop top nav + mobile bottom nav

## Build

```bash
npm run build
npm run preview
```

## Manual test checklist

- [ ] Create / delete festival
- [ ] Record collection (family name + 10-digit mobile, Cash/Online/Cheque)
- [ ] Delete collection; Paid/Due status
- [ ] Add / delete expense; category chips
- [ ] Analytics summary + WhatsApp share
- [ ] Submit / delete feedback
- [ ] Users CRUD + phone search
- [ ] Login redirects to `/`
- [ ] Mobile bottom nav + desktop tabs
