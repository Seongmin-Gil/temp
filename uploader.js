const fs = require("fs");
const { DataSource } = require("typeorm");
require("dotenv").config();

//DB 주소
const appData = new DataSource({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

//MockData 전처리
const csv = fs.readFileSync("../mockData.csv", "utf-8").trim();
const temps = csv.split("\n");
const rowDatas = temps.map((temp) => temp.split(","));
const header = rowDatas[0];
const rows = rowDatas.splice(1);
rows.map((row) => row.unshift("1"));

let index = 0;
let time = new Array();

//DB 연결
const uploader = () => {
  appData
    .initialize()
    .then(() => {
      console.log("DataSource has been initialized!!");
      //1초 간격으로 MockData Upload
      setInterval(insertData, 1000);
    })
    .catch((err) => {
      console.error("Error during DataSource intitialization", err);
      appData.destroy();
    });
};

//Mock Data UpLoad 합수
const insertData = () => {
  const startTime = performance.now();
  if (index < rows.length) {
    appData.query(
      `INSERT INTO data (WellId, Flow, Static, Diff, Casing, Temp, Roads)
      VALUES (?);`,
      [rows[index]]
    );
    index++;
    console.log(`${index}번째 데이터 업로드 완료`);
  } else {
    index = 0;
    time = new Array();
  }
  //처리 속도 측정
  const endTime = performance.now();
  const deltaTime = endTime - startTime;
  time.push(deltaTime);
};

//처리 속도 전달
const getTimeArray = () => {
  return time[index];
};

module.exports = { uploader, getTimeArray };
