const { getTimeArray } = require("./uploader");

const getTest = async (req, res) => {
  const time = await getTimeArray();
  console.log(time);
  return res.status(200).json({ time });
};

module.exports = {
  getTest,
};
