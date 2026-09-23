const taskModel = require("@/models/task.model");

class TaskService {
  async getAllTasks(userId) {
    return await taskModel.findByUserId(userId);
  }
  async getTaskById(id, userId) {
    const task = await taskModel.findByIdAndUserId(id, userId);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  }

  async createTask(userId, title) {
    if (!title) {
      throw new Error("Title is required");
    }
    return await taskModel.create(userId, title.trim());
  }
  async updateTask(id, userId, { title, is_completed }) {
    const existingTask = await taskModel.findByIdAndUserId(id, userId);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    const newTitle = title !== undefined ? title.trim() : existingTask.title;
    const newIsCompleted =
      is_completed !== undefined ? is_completed : existingTask.is_completed;
    await taskModel.update(id, userId, {
      title: newTitle,
      is_completed: newIsCompleted,
    });
    return await taskModel.findByIdAndUserId(id, userId);
  }

  async deletedTask(id, userId) {
    const affected = await taskModel.destroy(id, userId);
    if (!affected) {
      throw new Error("Task not found");
    }
    return true;
  }
}

module.exports = new TaskService();
