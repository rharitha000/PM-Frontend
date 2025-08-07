// app.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// -- UPDATE THESE WITH YOUR DB DETAILS --
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "n3u3da!",
  database: "project"
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// --- 1. OVERALL INVESTMENT DISTRIBUTION (landing page doughnut) ---
app.get("/api/overall-investments", async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(`
      SELECT it.name AS category, 
        SUM(t.quantity * t.price_per_unit) AS total
      FROM investments i
      JOIN investment_types it ON i.type_id = it.type_id
      JOIN transactions t ON i.investment_id = t.investment_id AND t.txn_type='BUY'
      GROUP BY it.type_id, it.name
      ORDER BY it.type_id
    `);
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
});

// --- 2. INVESTMENT SUBCATEGORY DISTRIBUTION (per-type doughnut) ---
app.get("/api/investment/:typeName", async (req, res) => {
  try {
    const { typeName } = req.params;
    const conn = await getConnection();

    // Find type_id for the requested typeName
    const [typeRows] = await conn.execute(
      "SELECT type_id FROM investment_types WHERE name = ? LIMIT 1", [typeName]);
    if (typeRows.length === 0) return res.status(404).json({error: 'Type not found'});
    const typeId = typeRows[0].type_id;

    // Sum of invested amount per subcategory under this type
    const [rows] = await conn.execute(`
      SELECT isc.name AS sub_category, 
        SUM(t.quantity * t.price_per_unit) AS total
      FROM investments i
      JOIN investment_subcategories isc ON i.subcat_id = isc.subcat_id
      JOIN transactions t ON i.investment_id = t.investment_id AND t.txn_type='BUY'
      WHERE i.type_id = ?
      GROUP BY isc.subcat_id, isc.name
      ORDER BY isc.subcat_id
    `, [typeId]);

    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
});

// --- 3. BUY/SELL TRANSACTIONS FOR INVESTMENT TYPE (for scatter plot) ---
app.get("/api/buy-sell/:typeName", async (req, res) => {
  try {
    const { typeName } = req.params;
    const conn = await getConnection();

    // Find type_id for the requested typeName
    const [typeRows] = await conn.execute(
      "SELECT type_id FROM investment_types WHERE name = ? LIMIT 1", [typeName]);
    if (typeRows.length === 0) return res.status(404).json({error: 'Type not found'});
    const typeId = typeRows[0].type_id;

    // Transactions for the relevant investments
    const [rows] = await conn.execute(`
      SELECT t.txn_date AS date, t.txn_type AS type, 
        (t.price_per_unit * t.quantity) AS amount
      FROM transactions t
      JOIN investments i ON t.investment_id = i.investment_id
      WHERE i.type_id = ?
      ORDER BY t.txn_date ASC
    `, [typeId]);

    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
});

// --- [OPTIONAL] API for price history, individual investments etc. ---
// Add more endpoints here as your app grows

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
