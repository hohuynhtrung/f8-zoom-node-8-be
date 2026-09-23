const fs = require("fs");
const path = require("path");

const basePath = __dirname;
const postfix = ".task.js";

const entries = fs
  .readdirSync(basePath)
  .filter((fileName) => fileName.endsWith(postfix));

const tasksMap = entries.reduce((obj, fileName) => {
  const taskName = fileName.replace(postfix, "");
  return {
    ...obj,
    [taskName]: require(path.join(basePath, fileName)),
  };
}, {});

module.exports = tasksMap;
