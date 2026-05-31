const pool = require('../config/db');

const verifyProjectOwner = async (projectId, userId) => {
  const project = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return project.rows.length > 0;
};

const getTasks = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const isOwner = await verifyProjectOwner(projectId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasksResult = await pool.query(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC',
      [projectId]
    );
    return res.status(200).json(tasksResult.rows);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  const { projectId } = req.params;
  const { title, due_date, priority } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const isOwner = await verifyProjectOwner(projectId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newTask = await pool.query(
      "INSERT INTO tasks (title, due_date, project_id, status, priority) VALUES ($1, $2, $3, 'pending', $4) RETURNING *",
      [title.trim(), due_date || null, projectId, priority || 'medium']
    );

    return res.status(201).json(newTask.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  const { id } = req.params;
  const { title, status, due_date, priority } = req.body;

  try {
    const updated = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           status = COALESCE($2, status),
           due_date = CASE WHEN $3::boolean THEN $4::date ELSE due_date END,
           priority = COALESCE($5, priority)
       WHERE id = $6 AND project_id IN (SELECT id FROM projects WHERE user_id = $7)
       RETURNING *`,
      [
        title ? title.trim() : null,
        status || null,
        due_date !== undefined,
        due_date || null,
        priority || null,
        id,
        req.user.id
      ]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    return res.status(200).json(updated.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deleted = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND project_id IN (SELECT id FROM projects WHERE user_id = $2)
       RETURNING *`,
      [id, req.user.id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    return res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
