const taskService = require("@/services/task.service");

const getAll = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks(req.user.id);
    res.success(tasks);
  } catch (error) {
    res.error(error.message, 500);
  }
};

const getOne = async (req, res) => {
  try {
    const task = await taskService.getTaskById(+req.params.id, req.user.id);
    res.success(task);
  } catch (error) {
    res.error(error.message, 404);
  }
};

const create = async (req, res) => {
  try {
    const newTask = await taskService.createTask(req.user.id, req.body.title);
    res.success(newTask, 201);
  } catch (error) {
    res.error(error.message, 400);
  }
};

const update = async (req, res) => {
  try {
    const updateTask = await taskService.updateTask(
      +req.params.id,
      req.user.id,
      req.body,
    );
    res.success(updateTask);
  } catch (error) {
    res.error(error.message, 400);
  }
};

const destroy = async (req, res) => {
  try {
    await taskService.deletedTask(+req.params.id, req.user.id);
    res.success({ message: "Task deleted successfully" });
  } catch (error) {
    res.error(error.message, 404);
  }
};

module.exports = { getAll, getOne, create, update, destroy };
