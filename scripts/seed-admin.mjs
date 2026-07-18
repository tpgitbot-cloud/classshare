import pg from "pg";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://classshare_db_user:sGCrZniDcX7fZEa6n0ZBsUo2LbbvyhUw@dpg-d9dq9ajrjlhs73b5dptg-a/classshare_db",
});

const hashed = await bcrypt.hash("10022005", 12);

await pool.query(
  `INSERT INTO admins (id, name, email, username, password, role, status, created_at, updated_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
   ON CONFLICT (username) DO UPDATE SET password = $5, updated_at = NOW()`,
  [uuidv4(), "Gokul", "gokul@classshare.edu", "gokul", hashed, "super_admin", "active"]
);

console.log("Admin created: gokul / 10022005");
await pool.end();
