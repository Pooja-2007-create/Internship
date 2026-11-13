# CIT Admission Portal

This project keeps the existing React admission portal and adds an Express API
with MongoDB-backed account verification and login history.

## Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB connection URI

## Configure MongoDB

In PowerShell, copy the backend environment template:

```powershell
Copy-Item backend\.env.example backend\.env
```

Edit `backend\.env` and set `MONGO_URI` to your MongoDB connection string.
Keep this file private; it is ignored by Git. `PORT` is optional and defaults
to `5000`.

## Install dependencies

From the project root, install the frontend and backend packages:

```powershell
npm install
Set-Location backend
npm install
Set-Location ..
```

## Create an applicant account

Before signing in, create an account using the backend command. It asks for an
email and a password (the password is not displayed while typing) and stores
only a bcrypt password hash in MongoDB:

```powershell
Set-Location backend
npm run create-user
```

Repeat this command to add more accounts. Emails must be unique.

## Start the application

Open two terminals in the project root.

In the first terminal, start the backend:

```powershell
Set-Location backend
npm start
```

In the second terminal, start the existing React frontend:

```powershell
npm run dev
```

Open the local URL printed by Vite and sign in with an account created above.
The frontend uses `http://localhost:5000/api` by default. To use another API
address, set `VITE_API_URL` in the frontend environment (for example,
`http://localhost:5000/api`).

## API endpoints

- `POST /api/login` — verifies the email and password and records a login only
  after successful verification.
- `GET /api/total-logins` — returns the total and per-email successful login
  counts.
- `GET /api/user-logins/:email` — returns the successful login count for an
  email address. URL-encode the email when necessary.

Example response:

```json
{
  "totalLogins": 2,
  "loginsByEmail": [
    {
      "email": "applicant@example.com",
      "loginCount": 2
    }
  ]
}
```

Login records are stored in MongoDB's `LoginHistory` collection with the
account email and login timestamp.

## Authentication notes

The backend verifies passwords against bcrypt hashes stored in MongoDB, and
never stores account passwords in plain text. The admission page remains a
client-side screen, however; this project does not issue login sessions or
protect server-side admission data. Add session or token authorization before
using it to protect production resources.
