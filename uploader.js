const fs = require("fs");
const { DataSource } = require("typeorm");
const xlsx = require("xlsx");

require("dotenv").config();

class WellData {

}

const dataArray = [];
const wellArray = [];

const dir = '../test';

//DB 주소
const appData = new DataSource({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

//빈값 null 처리
const nullDataChange = (datas) => {
  while(datas.includes("")){
    const index = datas.indexOf("");
    datas[index] = null;
  }
}

const files = fs.readdirSync(dir);

//데이터 전처리
for (let i = 0; i < files.length; i++) {
  const newData = new WellData();
  const well = files[i].slice(0, -30);
  newData.well = well;
  console.log(well);
  const excelFile = xlsx.readFile(dir+"/"+files[i], { type: 'array'});
  const sheetName = excelFile.SheetNames[0];
  const sheet = excelFile.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_csv(sheet);
  const temps = data.split("\n");
  const rowDatas = temps.map((temp) => temp.split(","));
  const header = rowDatas[0];
  const rows = rowDatas.splice(1);
  rows.map((row) => {
    nullDataChange(row);
    row.unshift(i+1);
  });
  newData.data = rows;
  dataArray.push(newData);
  wellArray.push(well);
}

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

//Data UpLoad 합수
const insertData = () => {
  const startTime = performance.now();
  if (index < dataArray[0].data.length) {
    for(let i = 0; i < dataArray.length; i++) {
      appData.query(
        `INSERT INTO data (WellId, CurrentTime, GasFlowRate, TodayFlow, FlowTimeToday, StaticPressure, DiffPressure, Temperature, CondenstateToday, ESDZSO, HighSepLevel, OrificePlate, Voltage)
        VALUES (?);`,
        [dataArray[i].data[index]]
      );
      //처리 속도 측정
      const endTime = performance.now();
      const deltaTime = endTime - startTime;
      time.push(deltaTime);
    }
    index++;
    console.log(`${index}번째 데이터 업로드 완료`);
  } else {
    index = 0;
    time = new Array();
  }
};

//처리 속도 전달
const getTimeArray = () => {
  console.log(time[index-1]);
  return time[index-1];
};

module.exports = { uploader, getTimeArray };
