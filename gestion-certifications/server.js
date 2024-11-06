// Importation des modules
const express = require('express');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // To load environment variables from a .env file

const app = express();
const port = process.env.PORT || 3000;

// Configuration du middleware CORS
app.use(cors({
  origin: 'http://localhost:8080' // Replace with your frontend URL
}));

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Connexion à PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'certifications_db',
  password: 'Ilearn',
  port: 5432,
});

const db = {
  query: (text, params) => pool.query(text, params),
};

// Middleware pour vérifier les tokens

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };

// Route de test
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Ajouter une certification
app.post('/certifications', async (req, res) => {
  const { employee_id, title, pdf_url, issued_date } = req.body;
  const query = "INSERT INTO certifications (employee_id, title, pdf_url, issued_date) VALUES ($1, $2, $3, $4) RETURNING *";
  const values = [employee_id, title, pdf_url, issued_date];

  try {
    const result = await db.query(query, values);
    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).send('Server error');
  }
});

// Lire les certifications d'un employé avec son nom
app.get('/certifications/:employee_id', async (req, res) => {
  const employee_id = parseInt(req.params.employee_id);

  if (isNaN(employee_id)) {
    return res.status(400).send('Invalid employee ID');
  }

  const query = `
    SELECT employees.name, certifications.title, certifications.pdf_url, certifications.issued_date
    FROM certifications
    JOIN employees ON certifications.employee_id = employees.id
    WHERE employees.id = $1;
  `;

  try {
    const result = await db.query(query, [employee_id]);
    if (result.rows.length === 0) {
      return res.status(404).send('No certifications found for this employee');
    }
    res.send(result.rows);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).send('Server error');
  }
});

// Route pour récupérer tous les employés
app.get('/employees', async (req, res) => {
  const query = 'SELECT id, name, position, enterprise_id FROM employees';

  try {
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lire un employé spécifique
app.get('/employees/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).send('Invalid employee ID');
  }

  try {
    const query = 'SELECT * FROM employees WHERE id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).send('Employee not found');
    }

    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).send('Server error');
  }
});
// Ajouter un employé
app.post('/employees', authenticateToken, async (req, res) => {
	const { name, position } = req.body;

	try {
	  const managerId = req.user.id;
	  const managerQuery = 'SELECT enterprise_id FROM users WHERE id = $1';
	  const managerResult = await db.query(managerQuery, [managerId]);
	  if (managerResult.rows.length === 0) {
		return res.status(404).send('Manager not found');
	  }
  
	  const enterprise_id = managerResult.rows[0].enterprise_id;
	  const query = 'INSERT INTO employees (name, position, enterprise_id) VALUES ($1, $2, $3) RETURNING *';
	  const values = [name, position, enterprise_id];
  
	  const result = await db.query(query, values);
	  res.status(201).send(result.rows[0]);
	} catch (error) {
	  console.error('Error adding employee:', error);
	  res.status(500).send('Server error');
	}
  });

// Mettre à jour un employé
app.put('/employees/:id', authenticateToken, async (req, res) => {
	const { id } = req.params;
	const { name, position } = req.body;
  
	if (isNaN(id)) {
	  return res.status(400).send('Invalid employee ID');
	}
  
	try {
	  const managerId = req.user.id;
	  const managerQuery = 'SELECT enterprise_id FROM users WHERE id = $1';
	  const managerResult = await db.query(managerQuery, [managerId]);
  
	  if (managerResult.rows.length === 0) {
		return res.status(404).send('Manager not found');
	  }
  
	  const enterprise_id = managerResult.rows[0].enterprise_id;
	  const query = 'UPDATE employees SET name = $1, position = $2, enterprise_id = $3 WHERE id = $4 RETURNING *';
	  const values = [id, name, position, enterprise_id];
  
	  const result = await db.query(query, values);
  
	  if (result.rows.length === 0) {
		return res.status(404).send('Employee not found');
	  }
  
	  res.send(result.rows[0]);
	} catch (error) {
	  console.error('Error updating employee:', error);
	  res.status(500).send('Server error');
	}
  });

// Supprimer un employé
app.delete('/employees/:id', authenticateToken, async (req, res) => {
	const { id } = req.params;
  
	if (isNaN(id)) {
	  return res.status(400).send('Invalid employee ID');
	}
  
	try {
	  await db.query('DELETE FROM certifications WHERE employee_id = $1', [id]);
	  const query = 'DELETE FROM employees WHERE id = $1 RETURNING *';
	  const result = await db.query(query, [id]);
  
	  if (result.rows.length === 0) {
		return res.status(404).send('Employee not found');
	  }
  
	  res.send(result.rows[0]);
	} catch (error) {
	  console.error('Error deleting employee:', error);
	  res.status(500).send('Server error');
	}
  });

// Ajouter un utilisateur
app.post('/register', async (req, res) => {
	const { username, password, role } = req.body;
	const saltRounds = 10;
  
	try {
	  const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  
	  if (user.rows.length > 0) {
		return res.status(400).send('Cet utilisateur est déjà dans la base de donnée, veuillez vous connecter');
	  }
  
	  let enterprise_id = null;
	  if (role === 'manager') {
		enterprise_id = Math.floor(Math.random() * 1000000);
	  }
  
	  const hashedPassword = await bcrypt.hash(password, saltRounds);
	  const newUser = await db.query('INSERT INTO users (username, password, role, enterprise_id) VALUES ($1, $2, $3, $4) RETURNING *', [username, hashedPassword, role, enterprise_id]);
  
	  res.status(201).send(newUser.rows[0]);
	} catch (error) {
	  console.error('Error registering user:', error);
	  res.status(500).send('Server error');
	}
  });

// Authentification d'un utilisateur
app.post('/login', (req, res) => {
	const { username, password } = req.body;
  
	db.query('SELECT * FROM users WHERE username = $1', [username])
	  .then(result => {
		if (result.rows.length === 0) {
		  return res.status(404).send('Utilisateur non trouvé');
		}
		const user = result.rows[0];
		bcrypt.compare(password, user.password, (err, isMatch) => {
		  if (err || !isMatch) {
			res.status(401).send({ message: 'Mot de passe incorrect' });
		  }
		  const accessToken = generateAccessToken({ id: user.id, role: user.role });
		  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
		  res.json({
			message: 'Login successful',
			accessToken,
			refreshToken,
			user: {
			  id: user.id,
			  username: user.username,
			  role: user.role
			}
		  });
		});
	  })
	  .catch(e => res.status(500).send(e.stack));
  });

// Route de déconnexion
app.post('/logout', (req, res) => {
	res.send({ message: 'Logout successful' });
  });

// Function to generate an access token
function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  }

// Function to generate a refresh token
function generateRefreshToken(user) {
	return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  }

// Route to get employees managed by a specific manager
app.get('/admin/employees', authenticateToken, async (req, res) => {
	if (req.user.role !== 'manager') {
	  return res.sendStatus(403);
	}
  
	const managerId = req.user.id;
	const query = 'SELECT id, name, position, enterprise_id FROM employees WHERE manager_id = $1';
  
	try {
	  const result = await db.query(query, [managerId]);
	  res.json(result.rows);
	} catch (error) {
	  console.error('Error fetching employees for manager:', error);
	  res.status(500).json({ error: error.message });
	}
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// Route pour générer un QR code
app.get('/certifications/:employee_id/qrcode', async (req, res) => {
  const employee_id = parseInt(req.params.employee_id);

  if (isNaN(employee_id)) {
	return res.status(400).send('Invalid employee ID');
  }

  const query = 'SELECT * FROM certifications WHERE employee_id = $1';
  const values = [employee_id];

  try {
	const result = await db.query(query, values);
	if (result.rows.length === 0) {
	  return res.status(404).send('No certifications found for this employee');
	}

	const certifications = result.rows;
	const urls = certifications.map(certification => certification.pdf_url);
	const qrCodes = await Promise.all(urls.map(url => QRCode.toDataURL(url)));

	res.send(qrCodes);
  } catch (error) {
	console.error('Error fetching certifications:', error);
	res.status(500).send('Server error');
  }
});
//Route to get all managers
app.get('/admin/managers', authenticateToken, async (req, res) => {
	if (req.user.role !== 'admin') {
	  return res.sendStatus(403);
	}
  
	try {
	  const query = 'SELECT id, username, role, enterprise_id FROM users WHERE role = $1';
	  const result = await db.query(query, ['manager']);
	  res.json(result.rows);
	} catch (error) {
	  console.error('Error fetching managers:', error);
	  res.status(500).json({ error: error.message });
	}
});

//Route to delete a manager
app.delete('/admin/managers/:id', authenticateToken, async (req, res) => {
	const { id } = req.params;
  
	if (req.user.role !== 'admin') {
	  return res.sendStatus(403);
	}
  
	if (isNaN(id)) {
	  return res.status(400).send('Invalid manager ID');
	}
  
	try {
	  const query = 'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING *';
	  const result = await db.query(query, [id, 'manager']);
  
	  if (result.rows.length === 0) {
		return res.status(404).send('Manager not found');
	  }
  
	  res.send(result.rows[0]);
	} catch (error) {
	  console.error('Error deleting manager:', error);
	  res.status(500).send('Server error');
	}
});
