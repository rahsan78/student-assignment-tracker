# Student Assignment Tracker

Live demo: [http://3.25.108.52](http://3.25.108.52). The address changes after an instance stop and start.

Student Assignment Tracker helps students keep track of shared assignments, due dates, and extension requests. It supports two roles: Students view assignments and request extensions; Instructors create assignments and manage extension requests for assignments they own.

## Main workflow

A Student can request an extension for an assignment that is not overdue. The Instructor who created the assignment can approve or reject the request. Approval adds two days to the due date for that Student only; rejection requires a comment. Each request can receive one decision.

## Features delivered

- Register Student accounts and log in. Instructor accounts are created manually in the database.
- Instructors create and list assignments.
- Students view assignments with Due soon and Overdue flags.
- Students request extensions and view their status, decision, comments, and dates.
- Instructors approve or reject extension requests for their own assignments.
- The Profile page from the course starter remains available.

## Out of scope and future capability

File attachments and student submissions are not part of the deployed application. Backend upload support was built and tested on branch `SAT-40-file-upload`, but that branch has not been merged or deployed.

Marking, notifications, and editing or deleting assignments are also out of scope.

## Architecture summary

- **Frontend:** React application in `frontend/src`, with pages, components, and authentication context.
- **Backend:** Express API in `backend`, organized into controllers, models, routes, middleware, and database configuration.
- **Database:** MongoDB Atlas.
- **Collections:** Users, assignments, and extension requests.
- **Authentication:** JWT bearer tokens with role checks on protected routes.

Main API route groups:

- `/api/auth` - registration, login, and profile.
- `/api/assignments` - Instructor assignment creation and listing, and Student assignment listing.
- `/api/extensions` - Student extension requests and Instructor pending-request decisions.

See [Deployment (manual, AWS EC2)](#deployment-manual-aws-ec2) for the Nginx, PM2, and EC2 setup.

## Local setup

Use Node.js 22.18.0. Install dependencies in both application folders:

```sh
npm install --prefix backend
npm install --prefix frontend
```

Create `backend/.env` with the variable names `MONGO_URI`, `JWT_SECRET`, and `PORT`. The `.env` file contains local configuration and is never committed.

Run the API and frontend in separate terminals:

```sh
cd backend
npm run dev
```

```sh
cd frontend
npm start
```

The backend runs on port 5001 by default, and the frontend development server runs on port 3000 and proxies API requests to the backend.

## Deployment (manual, AWS EC2)

**1. What runs where:** The EC2 instance runs Node.js processes under PM2: `backend` (ID 0), the Express API on port 5001, and `Frontend` (ID 1), which serves the built React app on port 3000. Nginx receives browser requests on port 80, and MongoDB Atlas hosts the database. Both PM2 processes came back online after a stop and start of the instance and restart automatically after a reboot.

**2. Request routing:** Nginx routes `/` to `localhost:3000` and `/api` to `localhost:5001`; the browser only uses port 80. The Nginx config is `/etc/nginx/sites-available/default` on the EC2 instance, not in this repository.

**3. How to update the deployed app:** The repository is cloned in the EC2 home folder at `~/student-assignment-tracker`. Replace the SSH placeholders with your key path and current EC2 public IP.

1. From Windows CMD, in the local repository root: `ssh -i <path-to-keypair.pem> ubuntu@<EC2_PUBLIC_IP>`
2. On EC2, from `~`: `cd student-assignment-tracker`
3. In `~/student-assignment-tracker`: `git checkout main`
4. In `~/student-assignment-tracker`: `git pull`
5. If the change adds packages, run `npm install` in the folder containing the changed `package.json`, after pulling and before building.
6. On EC2, from `~/student-assignment-tracker`: `cd frontend`
7. In `~/student-assignment-tracker/frontend`: `npm run build`
8. In `~/student-assignment-tracker/frontend`: `pm2 restart backend`
9. In `~/student-assignment-tracker/frontend`: `pm2 restart Frontend`

Optional checks: run `pm2 list` from `~`; run `pm2 logs backend --lines 10 --nostream` from `~/student-assignment-tracker/frontend`.

**4. Configuration and access:** Backend environment variable names are `MONGO_URI`, `JWT_SECRET`, and `PORT`; do not include their values here. The Atlas allowlist uses single-address (`/32`) entries for the EC2 instance's public IP and the developer's own public IP, not `0.0.0.0/0`. The demo URL is `http://3.25.108.52`. The EC2 public IP changes after a stop and start, so add the new IP to the Atlas allowlist, then run `pm2 restart backend` to reconnect to the database.

## Known limitations

- Login is lost when the page is refreshed because authentication state is held in memory.
- An approval made after the original due date can still result in an extended due date that is already in the past.
- Simultaneous decisions by two Instructors are not handled.
- Attachments are not delivered in the deployed application.
- Instructor accounts must be created manually in the database; registration creates Student accounts only.

## Release

Release tag: `v1.0.0`.
