const { createApp } = require("./app");

const startServer = async () => {
  const app = createApp();
  app.set("port", process.env.PORT || 8000);

  app.listen(app.get("port"), () => {
    // process.send("ready");
    console.log(`Server Listening on Port ${app.get("port")}`);
  });
};

startServer();
