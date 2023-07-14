const fs = require("fs");
const { DataSource } = require("typeorm");
require("dotenv").config();

const appData = new DataSource({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const csv = fs.readFileSync("../mockData.csv", "utf-8").trim();
const temps = csv.split("\n");
const rowDatas = temps.map((temp) => temp.split(","));
const header = rowDatas[0];
const rows = rowDatas.splice(1);
rows.map((row) => row.unshift("1"));

appData
  .initialize()
  .then(() => {
    console.log("DataSource has been initialized!!");
    while (index < rows.length) {
      setTimeout(insertData, 1000);
    }
  })
  .catch((err) => {
    console.error("Error during DataSource intitialization", err);
    appData.destroy();
  });

// appData.query(
//   `INSER INTO data (WellId, Flow, Static, Diff, Casing, Temp, Roads)
//   VALUE ?;`
// )

const insertData = () => {
  if (index < rows.length) {
    appData.query(
      `INSERT INTO data (WellId, Flow, Static, Diff, Casing, Temp, Roads)
    VALUES (?);`,
      [rows[index]]
    );
    index++;
  } else {
    return;
  }
};
