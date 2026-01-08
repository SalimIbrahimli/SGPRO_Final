const sqlite3 = require("sqlite3").verbose();

function initDb(dbPath) {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        emailAddress TEXT NOT NULL,
        companyName TEXT,
        serviceInterested TEXT,
        messageContent TEXT NOT NULL,
        ip TEXT,
        userAgent TEXT,
        createdAt TEXT NOT NULL
      )
    `);
  });

  return db;
}

function insertLead(db, lead) {
  return new Promise((resolve, reject) => {
    const stmt = `
      INSERT INTO leads
      (fullName, emailAddress, companyName, serviceInterested, messageContent, ip, userAgent, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      stmt,
      [
        lead.fullName,
        lead.emailAddress,
        lead.companyName,
        lead.serviceInterested,
        lead.messageContent,
        lead.ip,
        lead.userAgent,
        lead.createdAt
      ],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

module.exports = { initDb, insertLead };
