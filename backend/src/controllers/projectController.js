const pool = require('../config/db');

const getProjects = async (req, res, next) => {
  try {
    const projectsResult = await pool.query(
      `SELECT p.id, p.title, p.description, p.created_at,
              COUNT(t.id)::int as total_tasks,
              COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0)::int as completed_tasks,
              COALESCE(SUM(CASE WHEN t.status = 'pending' AND t.due_date < CURRENT_DATE THEN 1 ELSE 0 END), 0)::int as overdue_tasks
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json(projectsResult.rows);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Project title is required' });
  }

  try {
    const newProject = await pool.query(
      'INSERT INTO projects (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), description ? description.trim() : null, req.user.id]
    );
    
    // Add default zero task counters for new project response
    const project = newProject.rows[0];
    project.total_tasks = 0;
    project.completed_tasks = 0;

    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Project title is required' });
  }

  try {
    const updated = await pool.query(
      `UPDATE projects 
       SET title = $1, description = $2 
       WHERE id = $3 AND user_id = $4 
       RETURNING *`,
      [title.trim(), description ? description.trim() : null, id, req.user.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    // Retrieve stats along with updated project
    const statsResult = await pool.query(
      `SELECT COUNT(t.id)::int as total_tasks,
              COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0)::int as completed_tasks
       FROM tasks t
       WHERE t.project_id = $1`,
      [id]
    );

    const project = updated.rows[0];
    project.total_tasks = statsResult.rows[0].total_tasks;
    project.completed_tasks = statsResult.rows[0].completed_tasks;

    return res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deleted = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    return res.status(200).json({ message: 'Project deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};
