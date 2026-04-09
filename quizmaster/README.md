# QuizMaster Pro v2.0
### Online Quiz Management System — MySQL + Node.js + Express

---

## Project Structure

```
quizmaster/
│
├── index.html                        ← Dashboard (home page)
├── server.js                         ← Express server entry point
├── package.json                      ← Node.js dependencies
├── .env.example                      ← Copy to .env and fill in DB details
│
├── pages/                            ← HTML pages
│   ├── login.html                    ← Login page
│   ├── register.html                 ← Register page
│   ├── take-quiz.html                ← Take a quiz (student)
│   ├── certificates.html             ← View & download certificates
│   ├── manage-quizzes.html           ← Admin: create/edit/delete quizzes
│   ├── results.html                  ← Admin: all quiz results
│   └── settings.html                 ← Admin: settings panel
│
├── css/                              ← Stylesheets
│   ├── global.css                    ← Variables, reset, shared components
│   ├── sidebar.css                   ← Navigation sidebar
│   ├── dashboard.css                 ← Stats cards
│   ├── quiz.css                      ← Quiz engine & score screen
│   └── admin.css                     ← Admin panel styles
│
├── js/                               ← Frontend JavaScript
│   ├── data.js                       ← API client (talks to MySQL backend)
│   ├── sidebar.js                    ← Sidebar & role toggle
│   ├── dashboard.js                  ← Dashboard page
│   ├── take-quiz.js                  ← Quiz engine (timer, answers, score)
│   ├── certificate.js                ← Canvas certificate renderer + PNG download
│   ├── manage-quizzes.js             ← Quiz editor (CRUD)
│   ├── results.js                    ← Results & analytics
│   ├── certificates.js               ← Certificate gallery
│   └── settings.js                   ← Settings page
│
└── backend/                          ← Node.js Express API
    ├── schema.sql                    ← ★ MySQL database schema (run first)
    ├── config/
    │   └── db.js                     ← MySQL connection pool
    ├── models/
    │   ├── User.js                   ← User queries
    │   ├── Quiz.js                   ← Quiz & question queries
    │   ├── Result.js                 ← Result submission & grading
    │   └── Certificate.js            ← Certificate queries
    ├── middleware/
    │   └── auth.js                   ← JWT authentication middleware
    └── routes/
        ├── auth.js                   ← /api/auth/*
        ├── quizzes.js                ← /api/quizzes/*
        ├── results.js                ← /api/results/*
        ├── certificates.js           ← /api/certificates/*
        ├── users.js                  ← /api/users/*
        └── settings.js              ← /api/settings/*
```

---

## Database: Where Data Is Saved

All data is stored permanently in **MySQL**. These are the tables:

| Table             | What it stores                              |
|-------------------|---------------------------------------------|
| `users`           | User accounts (name, email, hashed password, role) |
| `quizzes`         | Quiz info (title, category, duration, passing score) |
| `questions`       | Questions and 4 options for each quiz       |
| `results`         | Every quiz attempt (score, pass/fail, time) |
| `result_answers`  | Which option the student chose per question |
| `certificates`    | Issued certificates with unique IDs         |
| `settings`        | App settings (institution name, etc.)       |

---

## Setup Instructions

### Step 1 — Install MySQL
Download from https://dev.mysql.com/downloads/mysql/ and install it.

### Step 2 — Create the database
Open your terminal and run:
```bash
mysql -u root -p < backend/schema.sql
```
This creates the `quizmaster_db` database with all tables and sample data.

### Step 3 — Configure environment
```bash
cp .env.example .env
```
Open `.env` and set your MySQL password:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=quizmaster_db
PORT=3000
JWT_SECRET=change_this_to_any_long_random_string
```

### Step 4 — Install Node.js dependencies
```bash
npm install
```

### Step 5 — Start the server
```bash
npm start
```

### Step 6 — Open in browser
```
http://localhost:3000
```

---

## Default Login (Admin)

| Field    | Value                    |
|----------|--------------------------|
| Email    | admin@quizmaster.pro     |
| Password | admin123                 |

---

## REST API Reference

### Auth
| Method | Endpoint                   | Description             | Auth     |
|--------|----------------------------|-------------------------|----------|
| POST   | /api/auth/register         | Create account          | Public   |
| POST   | /api/auth/login            | Login, get JWT token    | Public   |
| GET    | /api/auth/me               | Get own profile         | Required |
| PUT    | /api/auth/me               | Update profile          | Required |
| PUT    | /api/auth/change-password  | Change password         | Required |

### Quizzes
| Method | Endpoint                      | Description          | Auth       |
|--------|-------------------------------|----------------------|------------|
| GET    | /api/quizzes                  | List all quizzes     | Optional   |
| GET    | /api/quizzes/:id              | Get quiz + questions | Optional   |
| POST   | /api/quizzes                  | Create quiz          | Admin only |
| PUT    | /api/quizzes/:id              | Update quiz          | Admin only |
| DELETE | /api/quizzes/:id              | Delete quiz          | Admin only |
| PATCH  | /api/quizzes/:id/publish      | Toggle publish       | Admin only |
| GET    | /api/quizzes/:id/stats        | Quiz statistics      | Admin only |

### Results
| Method | Endpoint                | Description               | Auth        |
|--------|-------------------------|---------------------------|-------------|
| POST   | /api/results/submit     | Submit a quiz attempt     | Optional    |
| GET    | /api/results            | List results (own/all)    | Required    |
| GET    | /api/results/:id        | Single result + answers   | Required    |
| GET    | /api/results/analytics  | Dashboard statistics      | Admin only  |
| DELETE | /api/results/:id        | Delete a result           | Admin only  |

### Certificates
| Method | Endpoint                          | Description                  | Auth       |
|--------|-----------------------------------|------------------------------|------------|
| GET    | /api/certificates                 | Own/all certificates         | Required   |
| GET    | /api/certificates/verify/:certUid | Verify certificate by ID     | Public     |

### Users
| Method | Endpoint        | Description     | Auth       |
|--------|-----------------|-----------------|------------|
| GET    | /api/users      | List all users  | Admin only |
| GET    | /api/users/:id  | User + results  | Admin only |
| DELETE | /api/users/:id  | Delete user     | Admin only |

### Settings
| Method | Endpoint       | Description         | Auth       |
|--------|----------------|---------------------|------------|
| GET    | /api/settings  | Read all settings   | Admin only |
| PUT    | /api/settings  | Update settings     | Admin only |

---

## Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Canvas API
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0+ (via mysql2 driver)
- **Authentication**: JWT (jsonwebtoken) + bcrypt password hashing
- **Certificates**: HTML5 Canvas rendered as downloadable PNG (1200×848px)
- **Fonts**: Google Fonts (Playfair Display, DM Sans, JetBrains Mono)
