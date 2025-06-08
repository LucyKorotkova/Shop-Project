import { createConnection, Connection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export async function initDataBase(): Promise<Connection | null> {
  let connection: Connection | null = null;
  try {
    connection = await createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log("✅ Connected to DB ProductsApplication");
  } catch (e: any) {
    console.error("❌ DB connection error:", e.message || e);
    return null;
  }
  return connection;
}
