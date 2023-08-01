const { getTimeArray } = require("./uploader");

const getTest = async (req, res) => {
  const time = await getTimeArray();
  return res.status(200).json({ time });
};

module.exports = {
  getTest,
};
