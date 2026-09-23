require("dotenv").config();
require("module-alias/register");
require("@/config/database");

const tasks = require("@/tasks");
const constants = require("@/config/constants");
const queueModel = require("@/models/queue.model");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startQueueWorker() {
  console.log("Queue running...");

  while (true) {
    const pendingJob = await queueModel.findOnePending();

    if (!pendingJob) {
      await sleep(2000);
      continue;
    }

    const { type } = pendingJob;
    const payload = JSON.parse(pendingJob.payload);

    try {
      await queueModel.updateStatus(
        pendingJob.id,
        constants.QUEUE_STATUS.INPROGRESS,
      );

      const handler = tasks[type];
      if (!handler) {
        throw new Error(`No processing task found for: "${type}"`);
      }

      await handler(payload);
      await queueModel.updateStatus(
        pendingJob.id,
        constants.QUEUE_STATUS.COMPLETED,
      );
    } catch (error) {
      console.error(error);
      await queueModel.updateStatus(
        pendingJob.id,
        constants.QUEUE_STATUS.FAILED,
      );
    }
  }
}

module.exports = startQueueWorker;
