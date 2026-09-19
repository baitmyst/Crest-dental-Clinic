# Dr. Dental Crest Dental Surgery — Web Platform & Clinic Management System

A polished, responsive, production-ready dental clinic website and internal staff management system for **Dr. Dental Crest Dental Surgery** in **Kampala, Uganda**, built in strict accordance with the **DESIGN-crest dental** design specification and official clinic rules.

---

## 1. Confirmed Clinic Details

- **Clinic Name**: Dr. Dental Crest Dental Surgery
- **Location**: Kampala, Uganda
- **Lead Dental Specialist**: Dr. Silver
- **Primary Phone**: +256 773 003214
- **Primary Public CTA**: "Request an Appointment"
- **Secondary Public CTA**: "Call +256 773 003214"
- **Timezone**: `Africa/Kampala` (East Africa Time)
- **Safe Directions Note**: *"Visit our Kampala clinic. Please call us for directions."*

---

## 2. Core Business Rules & Healthcare Compliance

| Business Rule | Implementation & Architecture |
|---|---|
| **Zero Client Accounts** | Visitors never create an account and never sign in. There are no patient portals or public account settings. |
| **Strictly Zero Public Pricing** | Prices, deposits, payment plans, discounts, price ranges, checkouts, and invoices are prohibited and completely absent across all public pages and public APIs. |
| **Pending Appointment Workflow** | Guest appointment requests are saved with `PENDING` status for receptionist review. Confirmed status requires manual staff outreach. |
| **Strict Operating Hours & Friday Rule** | Monday–Thursday (08:00–20:00), Saturday (08:00–20:00), and Sunday (09:00–17:00). Friday (08:00–08:30) is marked `DRAFT / ADMIN CONFIRMATION REQUIRED` and locked from live public online booking until confirmed by an administrator. |
| **Patient Rating Rule** | 5.0 rating is disabled by default. When enabled by an admin, displays only *"Rated 5.0 by our patients"*. Never claims Google reviews or fabricated review counts. |
| **No Invented Information** | Unconfirmed fields (street address, email, WhatsApp, map coordinates, doctor degrees/credentials, testimonials) default to safe phrasing and remain blank until verified by clinic staff. |
| **Staff Authentication Only** | Internal staff authentication for `ADMIN`, `RECEPTIONIST`, and `DENTIST` roles using bcrypt password hashing and secure HttpOnly session cookies. Dentists can view only their assigned patients. |

---

## 3. Design System & Aesthetics (`DESIGN-crest dental`)

Built strictly to the **DESIGN-crest dental** specifications:
- **Base Canvas**: White canvas (`#ffffff`), dark ink type (`#181d26`).
- **Signature Surface Cards**:
  - Forest Green (`#0a2e0e`): Clinic introduction and lead specialist callouts.
  - Coral (`#aa2d00`): Emergency guidance and vital announcements.
  - Cream (`#f5e9d4`): Mid-page appointment CTAs and consultation banners.
  - Surface Dark (`#181d26`): Contact & location banners.
  - Soft surface (`#f8fafc`) with `#dddddd` hairline borders.
- **Buttons**:
  - Primary CTA: Near-black (`#181d26`) 12px rounded pill.
  - Secondary CTA: White background with 1px `#dddddd` hairline outline.
  - Secondary on Dark: White background with `#181d26` ink type.
- **Section Rhythm**: 96px (`spacing.section`) vertical padding between major bands.
- **Typography**: Inter Display / Haas Grotesk hierarchy (400 weights for display headlines, 500 for buttons and subtitles — never bold for its own sake).

---

## 4. Primary Dental Services

1. **General Dentistry & Check-Ups** (`/services/general-dentistry-checkups`)
2. **Cosmetic Dentistry & Veneers** (`/services/cosmetic-dentistry-veneers`)
3. **Dental Implants & Prosthetics** (`/services/dental-implants-prosthetics`)
4. **Children’s Dentistry** (`/services/childrens-dentistry`)
5. **Orthodontics** (`/services/orthodontics`)

---

## 5. Staff Test Accounts

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Administrator** | `admin@crestdentalsurgery.com` | `AdminPass2026!` | Full system access, staff roles, settings, CMS, Friday hours verification |
| **Receptionist** | `receptionist@crestdentalsurgery.com` | `ReceptPass2026!` | Appointment review, status updates, client CRM, calendar, inquiries |
| **Dentist (Dr. Silver)** | `dr.silver@crestdentalsurgery.com` | `SilverDentist2026!` | Assigned patient appointments, internal clinical notes, schedule |

Discreet Staff Login URL: `/staff/login` (or `/admin/login`).

---

## 6. Local Setup & Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Synchronize database schema (SQLite zero-configuration file db)
npx prisma db push

# 3. Seed official clinic base data, staff accounts, services, and draft articles
npm run seed

# 4. Start local development server
npm run dev
```

Visit the application at: `http://localhost:3000`
- Public Homepage: `http://localhost:3000`
- Guest Appointment Booking: `http://localhost:3000/request-appointment`
- Staff Portal: `http://localhost:3000/staff/login`
- Administration Dashboard: `http://localhost:3000/admin`
