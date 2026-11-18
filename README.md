**Task Manager Application Overview:The task manager application is designed to help users efficiently manage their tasks and responsibilities by providing a user-friendly interface for creating, viewing, updating, and deleting tasks. It includes essential features such as secure user authentication, allowing individuals to sign up and log in to their accounts, as well as profile management to update personal information. With built-in validation such as input field validation and email validation, the application ensures a seamless user experience while enhancing productivity and organization in both personal and professional settings. **

**This apps **contain** the following features:**

* Signup
* Login
* Logout
* Update profile
* Add tasks
* View tasks
* Update tasks
* Delete tasks

**This **app**lication** is**almost **a** precompiled** app**. However, students will develop some features,**such as adding tasks, viewing tasks, updating tasks, and **deleting** tasks**. **Students** will interact with GitHub when they develop the features.**

---

**Prerequisite:** Please install the following software and create account in following web tools** **

* **Nodejs [**[https://nodejs.org/en](https://nodejs.org/en)]** **
* **Git [**[https://git-scm.com/](https://git-scm.com/)]** **
* **VS code editor** [[https://code.visualstudio.com/](https://code.visualstudio.com/)]** **
* **MongoDB Account** [[https://account.mongodb.com/account/login](https://account.mongodb.com/account/login)]** - In tutorial, we have also showed how can you create account and database: follow step number 2.**
* **GitHub Account** [[https://github.com/signup?source=login](https://github.com/signup?source=login)]** **

---
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

**4. Configuration and access:** Backend environment variable names are `MONGO_URI`, `JWT_SECRET`, and `PORT`; do not include their values here. The Atlas allowlist uses single-address (`/32`) entries for the EC2 instance’s public IP and the developer’s own public IP, not `0.0.0.0/0`. The demo URL is `http://<EC2_PUBLIC_IP>`. The EC2 public IP changes after a stop and start, so add the new IP to the Atlas allowlist, then run `pm2 restart backend` to reconnect to the database.

**5. Known limitations:** Login state is held in memory only, so refreshing the page logs the user out.