# Laravel Backend - Beneficiary Management

## 📍 Description
This is a Laravel backend to manage beneficiaries, activities, and project logical frameworks. It provides a secure REST API using Laravel Sanctum, supports Excel import/export, handles async jobs and logs, and manages multiple entities.

---

## ⚙️ Requirements
- PHP 8.4.7
- Composer 2.8.9
- Laravel 12.x
- MySQL 9.3.0
- (Optional for tests) SQLite

---

## ⚡ Project Installation

### ✅ Steps

```bash
# 1. Clone the repository
git clone <repo_url>
cd backend

# 2. Copy the .env file
cp .env.example .env

# 3. Install dependencies
composer install

# 4. Generate application key
php artisan key:generate

# 5. Run migrations and optionally seed data
php artisan migrate --seed

# 6. Start the development server
php artisan serve
```

### 🔐 Required .env fields
Before starting the project, fill in the following:

```env
APP_KEY=                # Generated by `php artisan key:generate`
DB_DATABASE=pdsm_groupe12
DB_USERNAME=root
DB_PASSWORD=root

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

> The default email configuration uses `log` driver. You don't need actual credentials unless using a real SMTP service.

### ⚠️ Application Access

To be able to log in to the application, you must create at least one user account.

#### ✏️ Step 1 – Prepare a default user

You can define one or more users directly inside the seeder file:

```
database/seeders/UserSeeder.php
```

In this file, locate or edit the `$users` array to customize the accounts to be created. For example:

```php
$users = [
    ['nom' => 'Wojcik',   'prenom' => 'Szymon',  'email' => 'szymon.wojcik@hes-so.ch'],
    ['nom' => 'Husmann',  'prenom' => 'Yann',    'email' => 'yann.husmann@hes-so.ch'],
    ['nom' => 'Gabioux',  'prenom' => 'Yann',    'email' => 'yann.gabioux@hes-so.ch'],
    ['nom' => 'Bonvin',   'prenom' => 'Benoît',  'email' => 'benoit.bonvin@hes-so.ch'],
];
```

Each user is created with:
- The password: `Password123!`
- The role: `SIEGE`
- A default `Partenaire`, created if none exists
```php
foreach ($users as $user) {
    User::create([
        ...$user,
        'password' => Hash::make('Password123!'),
        'role' => Role::SIEGE->value,
        'partenaire_id' => $partenaire->part_id,
    ]);
}
```

You can add, remove, or change these users as needed before running the seed.

#### ✅ Step 2 – Run the seeder

Once you're ready, run:

```bash
php artisan db:seed --class=UserSeeder
```

This will insert the defined users into the database.

---

### ✉️ Important – Email configuration required for 2FA

After login, the application will send a **two-factor authentication (2FA) code by email**.

Make sure your `.env` email settings are correct. If not, login will fail since the code won’t be delivered.

Default email setup (logs only, no actual emails):

```env
MAIL_MAILER=log
```

To use a real SMTP provider, update your `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.yourprovider.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=yourpassword
MAIL_FROM_ADDRESS=your@email.com
MAIL_FROM_NAME="Your App"
```

> ⚠️ A working email setup is mandatory to complete the login process.


## 🛠️ Environment Variables (.env)
This is the complete `.env.example` content:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pdsm_groupe12
DB_USERNAME=root
DB_PASSWORD=root

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
# CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
```

---

## 🔄 Key Features

| Controller                    | Methods             | Description                          |
|------------------------------|---------------------|--------------------------------------|
| AuthController               | login               | User authentication                  |
| PasswordResetController      | sendResetLink       | Password reset via email             |
| BeneficiaireController       | index               | List all beneficiaries               |
| BeneficiaireImportController | import              | Excel import of beneficiaries        |
| ProjetController             | index, store        | Manage projects                      |
| PartenaireController         | index, store        | Manage partners                      |
| ActivitesController          | index, store        | Manage activities                    |
| ActivitesImportController    | import              | Excel import of activities           |
| EvaluationController         | index, store        | Handle evaluations                   |
| IndicateurController         | index, store        | Manage performance indicators        |

And more: logical framework structure, outputs, outcomes, logs, enums, etc.

---

## 🗃️ Main Database Tables
- **beneficiaires**: Core table for individuals
- **activites**, **activite_beneficiaire**: Activities and participation
- **projet**, **partenaires**, **users**: Project and team management
- **cadre_logique**, **objectif_general**, **output**, **outcome**, **indicateur**: Logical framework

---

## 🚀 REST API Routes
```http
POST   /login
POST   /logout
GET    /profile
POST   /password/forgot
POST   /password/reset
GET    /beneficiaires
POST   /beneficiaires/import
... (run `php artisan route:list` for full list)
```

---

## 🧪 Testing
To run unit tests:
```bash
php artisan test
```

---

## 📦 Key Packages
- `laravel/sanctum` – Token-based API authentication
- `maatwebsite/excel` – Excel import/export
- `phpunit/phpunit` – Unit testing

---

## 🚀 Deployment
Set the correct `.env` variables and run:
```bash
php artisan migrate --force
php artisan config:cache
```

---

## ✨ Author / Maintenance
Developed as part of group 12.
Maintained by: **Szymon WOJCIK**, **Yann Husmann**, **Yann Gabioux**, **Benoit Bonvin**
