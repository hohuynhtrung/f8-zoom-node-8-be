const queueModel = require("@/models/queue.model");

class QueueService {
  async push({ type, payload }) {
    const stringifiedPayload = JSON.stringify(payload);
    return await queueModel.create(type, stringifiedPayload);
  }
}

module.exports = new QueueService();
