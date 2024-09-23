const fs = require("fs");
const { DataSource } = require("typeorm");
const xlsx = require("xlsx");

require("dotenv").config();

class WellData {

}

const wellArray = [];
const dir = '../mock';

//DB 주소
const appData = new DataSource({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: true,
});

//빈값 null 처리
const nullDataChange = (datas) => {
  while(datas.includes("")){
    const index = datas.indexOf("");
    datas[index] = null;
  }
}

//데이터 전처리
const preText = (files) => {
  const dataArray = [];
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
    return dataArray;
  }
}

const uploadFiles = fs.readdirSync(dir);
const resultArray = preText(uploadFiles);

let index = 0;
let time = new Array();

const insertDataBase = async(dataArray) => {
  const startTime = performance.now();
    try {
      await appData.query(
        `INSERT INTO data (WellId, CurrentTime, GasFlowRate, TodayFlow, FlowTimeToday, StaticPressure, DiffPressure, Temperature, CondenstateToday, ESDZSO, HighSepLevel, OrificePlate, Voltage)
        VALUES (?);`,
        [dataArray[0].data[index]]
      );
    } catch(err) {
      console.log(err)
    }
    //처리 속도 측정
    const endTime = performance.now();
    const deltaTime = endTime - startTime;
    const message = `${index}번째 데이터 업로드 완료  (${deltaTime}ms)`;
    console.log(message);
    index++;
    return message;
}

appData
  .initialize()
  .then(() => {
    console.log("DataSource has been initialized!!");
  })
  .catch((err) => {
    console.error("Error during DataSource intitialization", err);
    appData.destroy();
  });

//Data UpLoad 합수
const insertData = async () => {
  const result = {};
  if(index < resultArray[0].data.length)
  {
    result.message = await insertDataBase(resultArray);
    result.status = 1;
  } else {
    index = 0;
    result.message = "Test Done!!"
    result.status = 0;
    console.log(result)
  }
  return result;
};


module.exports = { insertData };
