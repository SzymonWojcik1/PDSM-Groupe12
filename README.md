# 🌍 Terre des Hommes – Monitoring Platform

This repository hosts a full-stack platform developed for **Terre des Hommes Suisse**, aiming to enhance the monitoring, evaluation, and self-assessment of humanitarian projects across multiple countries.

The system centralizes field data and provides powerful tools for data entry, visualization, analysis, and partner evaluation. It is built with a **Laravel API backend** and a **Next.js 14 frontend**, hosted and deployed on **Hidora**.

---

## 🧭 Project Context

**Terre des Hommes (TDH)** is a humanitarian organization dedicated to promoting children’s rights and improving the living conditions of vulnerable communities.
This project was initially developed as part of a university mandate at the **Haute École de Gestion de Genève (HEG)** for the course **64-56 - Projet sur mandat**.
We are **Group 12**, composed of four students. Although the original collaboration with Terre des Hommes Suisse was discontinued due to external complications, we decided to continue the development of the platform independently, inspired by the same goals and use cases.

Key objectives:

- Centralize project data and prevent duplication
- Enable partners to perform structured self-evaluations
- Offer real-time visual analytics for regional and global oversight

---

## 📦 Project Structure

```
.
├── backend/     # Laravel REST API
├── frontend/    # Next.js 14 frontend
└── README.md    # Root project documentation
```

---

## 📚 Documentation

- 🖥️ [Frontend README (Next.js)](./frontend/README.md)
- 🔧 [Backend README (Laravel)](./backend/README.md)

Each folder contains setup instructions, features, and deployment guides.

---

## 🚀 Quickstart

```bash
# Clone the repository
git clone <REPO_URL>
cd <REPO_NAME>

# Backend Setup
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend Setup
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## 🎯 Main Features

- Beneficiary management and deduplication
- Partner-specific self-evaluations
- Data import via Excel and structured forms
- Role-based access (partner, national/regional coordinators, HQ)
- Analytics and reporting with dashboards
- User activity logging

---

## 🛡️ Technologies

- Laravel, PHP, MySQL
- Next.js 14, React, TypeScript
- Tailwind CSS, Shadcn UI
- Axios, Zod, React Hook Form
- Microsoft Azure, Power BI

---

*Project developed by **Szymon Wojcik**, **Yann Husmann**, **Yann Gabioux**, **Benoit Bonvin**
