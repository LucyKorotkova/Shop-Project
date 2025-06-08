require('dotenv').config();

import { Express } from "express";
import { Connection } from "mysql2/promise";
import { initDataBase } from "./Server/services/db";
import { initServer } from "./Server/services/server";
import ShopAPI from "./Shop.API";
import path from "path";
import express from "express";

export let server: Express;
export let connection: Connection;

async function launchApplication() {
  server = initServer();
  const dbConnection = await initDataBase();

  if (!dbConnection) {
    console.error("❌ DB connection failed. Exiting...");
    process.exit(1);
  }

  connection = dbConnection;
  initRouter();
}

function initRouter() {
  const shopApi = ShopAPI(connection);
  server.use("/api", shopApi);


server.use("/admin", express.static(path.join(__dirname, "shop-admin", "build")));
server.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "shop-admin", "build", "index.html"));
});

  server.use(express.static(path.join(__dirname, "shop-client", "build")));
  server.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "shop-client", "build", "index.html"));
  });
}

launchApplication();