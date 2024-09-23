const { insertData } = require("./uploader");

const getTest = async (req, res) => {
  const message = await insertData();
  return res.status(200).json( message );
};

module.exports = {
  getTest,
};
