# 🎯 Frontend – Management Application

This is the **frontend** of the Management System, built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. It provides a modern and user-friendly interface to interact with a Laravel-based backend API.

---

## 🚀 Features

- Home
- Beneficiaries
- Activities
- Projects
- Parteners
- Logical framework
- Users
- Evaluations
- Logs
- Multi Language
- ChatBot

---

## 🧰 Tech Stack

- **Next.js 14 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form + Zod** (form handling + validation)
- **Axios** (API requests)
- **SheetJS** (Excel import)
- **Shadcn/UI** (UI components)
- **Next-i18next** (multilingual support)

---

## 📁 Project Structure

```
.
├── app/                  # Next.js pages and routing
├── components/           # Reusable UI and form components
├── lib/                  # API and utility functions
├── public/               # Static assets
├── translations/         # i18n translations
├── styles/               # Tailwind config and global styles
├── .env.example          # Example environment config
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies and scripts
```

---

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file at the root of the project:

```env
# Backend API URL (with /api)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Backend base URL (without /api)
NEXT_PUBLIC_API_URL_WITHOUT_API=http://localhost:8000/

# Mistral API Key (optional)
MISTRAL_API_KEY=
```

You can copy `.env.example` and adjust values as needed.

With bash:
```bash
cp .env.exemple .env.local
```
With PowerShell:
```PowerShell
Copy-Item .env.exemple .env.local
```

---

## 🏃 Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

```bash
npm run build
```

Deploy using Vercel, Docker, or any Node.js-compatible hosting.

---

## 🧪 Linting & Formatting

```bash
npm run lint     # Run ESLint
npm run format   # Run Prettier
```
---

## 💡 Advanced Features

- **Duplicate handling**: When importing from Excel, the system detects duplicates (same name, birth date, and sex) and prompts the user for confirmation.
- **Dynamic filters**: Filter beneficiaries by region, country, zone, type, sex, gender, and name.
- **Multilingual enums**: Enum values are translated dynamically using backend-provided labels.
- **Shared form logic**: Add/edit pages use a unified form component.

---


## ✨ Author / Maintenance
Developed as part of group 12.
Maintained by: **Szymon WOJCIK**, **Yann Husmann**, **Yann Gabioux**, **Benoit Bonvin**