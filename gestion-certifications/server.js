// Importation des modules
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const multer = require('multer');
require('dotenv').config(); // To load environment variables from a .env file

const app = express();
const port = process.env.PORT || 3000;

// Configuration du middleware CORS
app.use(cors({
  origin: '*' // Replace with your frontend URL
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

async function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1] || req.query.token;
    if (token == null) {
      console.log('No token provided');
      return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log('Token verification failed:', err);
        return res.sendStatus(403);
      }
      try {
        const { id, role } = decodedToken;
        let query, result;
        if (role === 'admin' || role === 'superadmin') {
          // Récupérer à partir de la table 'admin'
          query = 'SELECT * FROM admin WHERE id = $1';
          result = await db.query(query, [id]);
        } else {
          // Récupérer à partir de la table 'users' pour les autres rôles
          query = 'SELECT * FROM users WHERE id = $1';
          result = await db.query(query, [id]);
        }
        if (result.rows.length === 0) {
          return res.status(403).json({ error: 'Utilisateur non trouvé' });
        }
        const user = result.rows[0];
        if (!user.is_active) {
          return res.status(403).json({ error: 'Utilisateur désactivé' });
        }
        req.user = user;
        next();
      } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Erreur serveur' });
      }
    });
}
module.exports = { authenticateToken };

function generateRandomPassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });;

// Ajouter une certification
app.post('/certifications', authenticateToken, upload.single('pdf'), async (req, res) => {
    const { employee_id, title, issued_date } = req.body;
    const pdf_data = req.file.buffer;
  
    try {
      const query = 'INSERT INTO certifications (employee_id, title, file_data, issued_date, expire) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const values = [employee_id, title, pdf_data, issued_date, false];
  
      const result = await db.query(query, values);
      res.status(201).send(result.rows[0]);
    } catch (error) {
      console.error('Error adding certification:', error);
      res.status(500).send('Server error');
    }
  });

app.get('/certifications/:id/pdf', async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).send('Invalid certification ID');
    }
  
    try {
      const query = 'SELECT file_data FROM certifications WHERE id = $1';
      const result = await db.query(query, [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).send('Certification not found');
      }
  
      const pdfData = result.rows[0].file_data;
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfData);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      res.status(500).send('Server error');
    }
});

app.get('/certifications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
  
    if (isNaN(id)) {
      return res.status(400).send('Invalid certification ID');
    }
  
    try {
      const query = 'SELECT * FROM certifications WHERE id = $1';
      const result = await db.query(query, [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).send('Certification not found');
      }
  
      const certification = result.rows[0];
      res.send(certification);
    } catch (error) {
      console.error('Error fetching certification:', error);
      res.status(500).send('Server error');
    }
});

app.delete('/certifications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
  
    if (isNaN(id)) {
      return res.status(400).send('Invalid certification ID');
    }
  
    try {
      const query = 'DELETE FROM certifications WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).send('Certification not found');
      }
  
      res.send(result.rows[0]);
    } catch (error) {
      console.error('Error deleting certification:', error);
      res.status(500).send('Server error');
    }
});

// Route pour récupérer tous les employés
app.get('/employees', async (req, res) => {
  const query = 'SELECT id, name, position, enterprise_id, manager_id FROM employees';

  try {
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/employees/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
  
    if (isNaN(id)) {
      return res.status(400).send('Invalid employee ID');
    }
  
    try {
      const employeeQuery = 'SELECT * FROM employees WHERE id = $1';
      const employeeResult = await db.query(employeeQuery, [id]);
  
      if (employeeResult.rows.length === 0) {
        return res.status(404).send('Employee not found');
      }
  
      const employee = employeeResult.rows[0];
  
      const certificationsQuery = 'SELECT * FROM certifications WHERE employee_id = $1';
      const certificationsResult = await db.query(certificationsQuery, [id]);
  
      const certifications = certificationsResult.rows;
  
      const qrCodeData = await QRCode.toDataURL(`Employee: ${employee.name}, Position: ${employee.position}, Enterprise ID: ${employee.enterprise_id}`);
  
      res.send({ employee, certifications, qrCode: qrCodeData });
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).send('Server error');
    }
  });

// Ajouter un employé

app.post('/employees', authenticateToken, async (req, res) => {
    const { name, position, email } = req.body;
    const managerId = req.user.id;

    try {
      // Get the manager's manager_id
      const managerQuery = 'SELECT manager_id, max_employes FROM users WHERE id = $1';
      const managerResult = await db.query(managerQuery, [managerId]);
  
      if (managerResult.rows.length === 0) {
        return res.status(404).send('Manager not found');
      }
      const manager_id = managerResult.rows[0].manager_id;
      const max_employes = managerResult.rows[0].max_employes;
      const countQuery = 'SELECT COUNT(*) FROM public.employees WHERE manager_id = $1';
      const countResult = await db.query(countQuery, [manager_id]);
      const employeeCount = parseInt(countResult.rows[0].count, 10);    
      if (employeeCount >= max_employes) {
          return res.status(403).json({ error: `Vous ne pouvez pas ajouter plus de ${max_employes} employés.` });
        }
        // Generate a random password
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new employee
      const enterprise_id = req.user.enterprise_id;
      const insertQuery = 'INSERT INTO employees (name, position, email, password, manager_id, enterprise_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      const insertValues = [name, position, email, hashedPassword, manager_id, enterprise_id];
      const insertResult = await db.query(insertQuery, insertValues);

      res.status(201).send({ employee: insertResult.rows[0], password });
    } catch (error) {
      console.error('Error adding employee:', error);
      res.status(500).send('Server error');
    }
});


app.put('/employees/:id/password', async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
  
    try {
      // Verify current password
      const employeeQuery = 'SELECT password FROM employees WHERE id = $1';
      const employeeResult = await db.query(employeeQuery, [id]);
  
      if (employeeResult.rows.length === 0) {
        return res.status(404).send('Employee not found');
      }
  
      const employee = employeeResult.rows[0];
      const isMatch = await bcrypt.compare(currentPassword, employee.password);
  
      if (!isMatch) {
        return res.status(401).send('Current password is incorrect');
      }
  
      // Update to new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateQuery = 'UPDATE employees SET password = $1 WHERE id = $2';
      await db.query(updateQuery, [hashedPassword, id]);
  
      res.send({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).send('Server error');
    }
});

app.get('/employees/:id/certifications', authenticateToken, async (req, res) => {
    const { id } = req.params;
  
    if (isNaN(id)) {
      return res.status(400).send('Invalid employee ID');
    }
  
    try {
      const query = 'SELECT * FROM certifications WHERE employee_id = $1';
      const result = await db.query(query, [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).send('No certifications found for this employee');
      }
  
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      res.status(500).json({ error: error.message });
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
      const managerQuery = 'SELECT manager_id FROM users WHERE id = $1';
      const managerResult = await db.query(managerQuery, [managerId]);
  
      if (managerResult.rows.length === 0) {
        return res.status(404).send('Manager not found');
      }
  
      const manager_id = managerResult.rows[0].manager_id;
      if (isNaN(manager_id)) {
        return res.status(400).send('Invalid manager ID');
      }
  
      const query = 'UPDATE employees SET name = $1, position = $2, manager_id = $3 WHERE id = $4 RETURNING *';
      const values = [name, position, manager_id, id];
  
      const result = await db.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).send('Employee not found');
      }
      const qrCodeData = await QRCode.toDataURL(`Employee: ${name}, Position: ${position}, Manager ID: ${manager_id}`);
      res.send({ employee: result.rows[0], qrCode: qrCodeData });
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
	const { username, password, role, email } = req.body;
	const saltRounds = 10;
  
	try {
	  const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  
	  if (user.rows.length > 0) {
		return res.status(400).send('Cet utilisateur est déjà dans la base de donnée, veuillez vous connecter');
	  }
  
	  let manager_id = null;
	  if (role === 'manager') {
		manager_id = Math.floor(Math.random() * 1000000);
	  }
  
	  const hashedPassword = await bcrypt.hash(password, saltRounds);
	  const newUser = await db.query('INSERT INTO users (username, password, role, manager_id, email) VALUES ($1, $2, $3, $4, $5) RETURNING *', [username, hashedPassword, role, manager_id, email]);
  
	  res.status(201).send(newUser.rows[0]);
	} catch (error) {
	  console.error('Error registering user:', error);
	  res.status(500).send('Server error');
	}
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      let userQuery = 'SELECT * FROM admin WHERE username = $1';
      let userResult = await db.query(userQuery, [username]);
  
      let user = null;
      let role = '';
  
      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        role = user.role; // 'admin' ou 'superadmin'
      } else {
        userQuery = 'SELECT * FROM users WHERE username = $1';
        userResult = await db.query(userQuery, [username]);
  
        if (userResult.rows.length === 0) {
          return res.status(200).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }
  
        user = userResult.rows[0];
        role = user.role; // 'manager' ou autre
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(200).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
      }
      if (!user.is_active) {
        return res.status(200).json({ error: 'Utilisateur désactivé', code: 'USER_DESACTIVATED' , user: { id: user.id, username: user.username, role: user.role, active: user.is_active } });
      }
      const accessToken = generateAccessToken({ id: user.id, role: user.role,  enterprise_id: user.enterprise_id });
      const refreshToken = generateRefreshToken({ id: user.id, role: user.role, enterprise_id: user.enterprise_id });
      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          active: user.is_active
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route de déconnexion
app.post('/logout', (req, res) => {
	res.send({ message: 'Logout successful' });
  });

// Function to generate an access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}
  
  // Function to generate a refresh token
function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}


// Route to get employees managed by a specific manager
app.get('/manager/employees', authenticateToken, async (req, res) => {
    if (req.user.role !== 'manager') {
      return res.sendStatus(403);
    }
    try {
      const managerId = req.user.id;
      const managerQuery = 'SELECT manager_id FROM users WHERE id = $1';
      const managerResult = await db.query(managerQuery, [managerId]);
  
      if (managerResult.rows.length === 0) {
        return res.status(404).send('Manager not found');
      }
  
      const manager_id = managerResult.rows[0].manager_id;
      const query = 'SELECT id, name, position, manager_id, password FROM employees WHERE manager_id = $1';
      const result = await db.query(query, [manager_id]);
  
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching employees for manager:', error);
      res.status(500).json({ error: error.message });
    }
});

// Route pour générer un QR code
app.get('/employees/:id/qrcode', async (req, res) => {
    const { id } = req.params;
  
    // Generate URL for the public employee page
    const url = `http://localhost:8080/public/employee/${id}`;
  
    try {
      // Generate QR code as a data URL
      const qrCodeData = await QRCode.toDataURL(url);
      res.json({ qrCodeData });
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).send('Server error');
    }
});

app.post('/public/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
  
    if (isNaN(id)) {
      return res.status(400).send('Invalid employee ID');
    }
  
    try {
      // Get employee details   
      const employeeQuery = 'SELECT id, name, position, password, enterprise_id, manager_id, is_active FROM employees WHERE id = $1';
      const employeeResult = await db.query(employeeQuery, [id]);
      if (employeeResult.rows.length === 0) {
        return res.status(404).send('Employee not found');
      }

      const employee = employeeResult.rows[0];
      const manager_id = employee.manager_id;
      // Verify password
      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) {
        return res.status(401).send('Incorrect password');
      }
      if (employee.is_active === false) {
        return res.status(403).json({ error: 'Compte désactivé', code: 'ACCOUNT_DESACTIVATED' });
      }
      const { updateQuery, currentDate } = buildCertificationExpirationQuery();
      await db.query(updateQuery, [manager_id, currentDate]);
      const certificationQuery = 'SELECT id, title, issued_date, expire FROM certifications WHERE employee_id = $1';
      const certificationResult = await db.query(certificationQuery, [id]);
  
      const certifications = certificationResult.rows;
  
      res.json({ employee: { id: employee.id, name: employee.name, position: employee.position }, certifications });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      res.status(500).send('Server error');
    }
});
// Route to get managers
app.get('/admin/managers', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    try {
      const query = 'SELECT id, username, email, role, enterprise_id FROM users WHERE role = $1 AND enterprise_id = $2';
      const result = await db.query(query, ['manager', req.user.enterprise_id]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching managers:', error);
      res.status(500).json({ error: error.message });
    }
});

app.post('/admin/managers', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const { username, password, email } = req.body;
    try {
      // Vérifier si le username existe déjà dans la table 'users'
      let query = 'SELECT 1 FROM users WHERE username = $1';
      let result = await db.query(query, [username]);
      if (result.rows.length > 0) {
        return res.status(400).json({ error: 'Le nom d\'utilisateur est déjà utilisé par un manager.' });
      }
      // Vérifier si le username existe déjà dans la table 'admin'
      query = 'SELECT 1 FROM admin WHERE username = $1';
      result = await db.query(query, [username]);
      if (result.rows.length > 0) {
        return res.status(400).json({ error: 'Le nom d\'utilisateur est déjà utilisé par un admin.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const manager_id = Math.floor(Math.random() * 1000000);
      const enterprise_id = req.user.enterprise_id;
      const adminQuery = 'SELECT max_managers, max_employes FROM admin WHERE id = $1 AND role = $2';
      const adminResult = await db.query(adminQuery, [req.user.id, 'admin']);
      if (adminResult.rows.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      const max_managers = adminResult.rows[0].max_managers;
      const max_employes = adminResult.rows[0].max_employes;;

      const countQuery = 'SELECT COUNT(*) FROM users WHERE enterprise_id = $1 AND role = $2';
      const countResult = await db.query(countQuery, [enterprise_id, 'manager']);
      const managerCount = parseInt(countResult.rows[0].count, 10);

      if (managerCount >= max_managers) {
        return res.status(403).json({ error: `Vous ne pouvez pas ajouter plus de ${max_managers} managers.` });
      }
      const insertQuery = 'INSERT INTO users (username, password, email, role, manager_id, enterprise_id, max_employes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
      const insertValues = [username, hashedPassword, email, 'manager', manager_id, enterprise_id, max_employes];
      const insertResult = await db.query(insertQuery, insertValues);

      res.status(201).send({ manager: insertResult.rows[0], password });
    } catch (error) {
      console.error('Error adding manager:', error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout du manager.' });
    }
});

//Route to modify a manager
app.put('/admin/managers/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const managerId = req.params.id;
    const { username, email, password } = req.body;
    try {
      let updateQuery = 'UPDATE users SET username = $1, email = $2';
      const values = [username, email];
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += ', password = $3';
        values.push(hashedPassword);
      }
      updateQuery += ' WHERE id = $' + (values.length + 1) + ' AND role = $' + (values.length + 2) + ' RETURNING *';
      values.push(managerId, 'manager');
      const result = await db.query(updateQuery, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Manager non trouvé' });
      }
      res.json({ manager: result.rows[0] });
    } catch (error) {
      console.error('Error updating manager:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
});
 // Route to get certifications expiring in the specified time frame and expired certifications
app.get('/manager/expirations', authenticateToken, async (req, res) => {
    if (req.user.role !== 'manager') {
      return res.sendStatus(403);
    }
  
    const { months } = req.query;
    const managerId = req.user.id;
  
    try {
      // Get the manager's enterprise_id
      const managerQuery = 'SELECT manager_id FROM users WHERE id = $1';
      const managerResult = await db.query(managerQuery, [managerId]);
  
      if (managerResult.rows.length === 0) {
        return res.status(404).send('Manager not found');
      }
  
      const manager_id = managerResult.rows[0].manager_id;
  
      // Calculate the expiration date
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + parseInt(months));
  
      // Get certifications expiring within the specified time frame
      const query = `
        SELECT c.id AS certification_id, c.title, c.issued_date, e.name AS employee_name
        FROM certifications c
        JOIN employees e ON c.employee_id = e.id
        WHERE e.manager_id = $1 AND c.issued_date <= $2 AND c.expire = false
      `;
      const values = [manager_id, expirationDate];
  
      const result = await db.query(query, values);
  
      // Format the dates
      const formattedResult = result.rows.map(row => ({
        ...row,
        issued_date: new Date(row.issued_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }));
      // Update expired certifications
      const { updateQuery, currentDate } = buildCertificationExpirationQuery();
      await db.query(updateQuery, [manager_id, currentDate]);
      res.json(formattedResult);
    } catch (error) {
      console.error('Error fetching expirations:', error);
      res.status(500).json({ error: error.message });
    }
});
  
  // Route to get expired certifications
app.get('/manager/expired', authenticateToken, async (req, res) => {
    if (req.user.role !== 'manager') {
      return res.sendStatus(403);
    }
    const managerId = req.user.id;
    try {
      // Get the manager's enterprise_id
      const managerQuery = 'SELECT manager_id FROM users WHERE id = $1';
      const managerResult = await db.query(managerQuery, [managerId]);
  
      if (managerResult.rows.length === 0) {
        return res.status(404).send('Manager not found');
      }
  
      const manager_id = managerResult.rows[0].manager_id;
      const { updateQuery, currentDate } = buildCertificationExpirationQuery();
      await db.query(updateQuery, [manager_id, currentDate]);
      // Get expired certifications
      const query = `
        SELECT c.id AS certification_id, c.title, c.issued_date, e.name AS employee_name
        FROM certifications c
        JOIN employees e ON c.employee_id = e.id
        WHERE e.manager_id = $1 AND c.expire = true
      `;
      const values = [manager_id];
  
      const result = await db.query(query, values);
  
      // Format the dates
      const formattedResult = result.rows.map(row => ({
        ...row,
        issued_date: new Date(row.issued_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }));
  
      res.json(formattedResult);
    } catch (error) {
      console.error('Error fetching expired certifications:', error);
      res.status(500).json({ error: error.message });
    }
});

app.post('/superadmin/admins', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') {
      return res.sendStatus(403);
    }
    const { username, enterpriseName, password, email, maxManagers, maxEmployes, startDate, endDate } = req.body;
  
    try {
      // Vérifier si le username existe déjà dans la table 'admin'
      let query = 'SELECT 1 FROM admin WHERE username = $1';
      let result = await db.query(query, [username]);
      if (result.rows.length > 0) {
        return res.status(400).json({ error: 'Le nom d\'utilisateur est déjà utilisé par un admin.' });
      }
  
      // Vérifier si le username existe déjà dans la table 'users'
      query = 'SELECT 1 FROM users WHERE username = $1';
      result = await db.query(query, [username]);
      if (result.rows.length > 0) {
        return res.status(400).json({ error: 'Le nom d\'utilisateur est déjà utilisé par un manager.' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const enterpriseId = Math.floor(Math.random() * 1000000);
      const adminInsertQuery = `
        INSERT INTO admin (username, password, email, role, enterprise_id, max_managers, max_employes, is_active, start_date, end_date, enterprise_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8, $9, $10) RETURNING *
      `;
      const adminValues = [username, hashedPassword, email, 'admin', enterpriseId, maxManagers, maxEmployes, startDate, endDate, enterpriseName];
      const adminResult = await db.query(adminInsertQuery, adminValues);
      res.status(201).json({ admin: adminResult.rows[0] });
    } catch (error) {
      console.error('Error adding admin:', error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'admin.' });
    }
});

app.get('/superadmin/admins', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') {
      return res.sendStatus(403);
    }
    try {
      const query = 'SELECT id, username, email, max_managers, is_active FROM admin WHERE role = $1';
      const result = await db.query(query, ['admin']);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ error: error.message });
    }
});

app.get('/superadmin/admins/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') {
      return res.sendStatus(403);
    }
    const adminId = req.params.id;
    try {
      const adminQuery = 'SELECT id, username, email, max_managers, enterprise_id FROM admin WHERE id = $1 AND role = $2';
      const adminResult = await db.query(adminQuery, [adminId, 'admin']);
      if (adminResult.rows.length === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      const admin = adminResult.rows[0];
      const enterprise_id = admin.enterprise_id;
      const managersQuery = `
        SELECT u.id, u.username, u.email,
        (SELECT COUNT(*) FROM employees WHERE manager_id = u.manager_id) AS employee_count
        FROM users u
        WHERE u.enterprise_id = $1 AND u.role = $2
      `;
      const managersResult = await db.query(managersQuery, [enterprise_id, 'manager']);
      const employeesQuery = `
        SELECT e.id, e.name, e.email, u.username AS manager_name
        FROM employees e
        JOIN users u ON e.manager_id = u.manager_id
        WHERE e.enterprise_id = $1
      `;
      const employeesResult = await db.query(employeesQuery, [enterprise_id]);
      res.json({
        admin,
        managers: managersResult.rows,
        employees: employeesResult.rows
      });
    } catch (error) {
      console.error('Error fetching admin details:', error);
      res.status(500).json({ error: error.message });
    }
});

app.put('/superadmin/admins/:id/deactivate', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') {
      return res.sendStatus(403);
    }
  
    const adminId = req.params.id;
  
    try {
      // Démarrer une transaction
      await db.query('BEGIN');
  
      // Désactiver l'admin
      const deactivateAdminQuery = `
        UPDATE admin
        SET is_active = FALSE
        WHERE id = $1 AND role = 'admin'
        RETURNING *
      `;
      const adminResult = await db.query(deactivateAdminQuery, [adminId]);
  
      if (adminResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ error: 'Admin non trouvé' });
      }
  
      const enterpriseId = adminResult.rows[0].enterprise_id;
  
      // Désactiver les managers de cet admin
      const deactivateManagersQuery = `
        UPDATE users
        SET is_active = FALSE
        WHERE enterprise_id = $1 AND role = 'manager'
      `;
      await db.query(deactivateManagersQuery, [enterpriseId]);
  
      // Désactiver les employés de ces managers
      const deactivateEmployeesQuery = `
        UPDATE employees
        SET is_active = FALSE
        WHERE enterprise_id = $1
      `;
      await db.query(deactivateEmployeesQuery, [enterpriseId]);
  
      // Valider la transaction
      await db.query('COMMIT');
  
      res.json({ message: 'Admin et ses managers et employés associés ont été désactivés.' });
    } catch (error) {
      // Annuler en cas d'erreur
      await db.query('ROLLBACK');
      console.error('Error deactivating admin:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.put('/superadmin/admins/:id/reactivate', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') {
      return res.sendStatus(403);
    }
    const adminId = req.params.id;
    try {
      // Démarrer une transaction
      await db.query('BEGIN');
      // Réactiver l'admin
      const reactivateAdminQuery = `
        UPDATE admin
        SET is_active = TRUE
        WHERE id = $1 AND role = 'admin'
        RETURNING *
      `;
      const adminResult = await db.query(reactivateAdminQuery, [adminId]);
      if (adminResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ error: 'Admin non trouvé' });
      }
      const enterpriseId = adminResult.rows[0].enterprise_id;
      // Réactiver les managers de cet admin
      const reactivateManagersQuery = `
        UPDATE users
        SET is_active = TRUE
        WHERE enterprise_id = $1 AND role = 'manager'
      `;
      await db.query(reactivateManagersQuery, [enterpriseId]);
      // Réactiver les employés de ces managers
      const reactivateEmployeesQuery = `
        UPDATE employees
        SET is_active = TRUE
        WHERE enterprise_id = $1
      `;
      await db.query(reactivateEmployeesQuery, [enterpriseId]);
      // Valider la transaction
      await db.query('COMMIT');
      res.json({ message: 'Admin et ses managers et employés associés ont été réactivés.' });
    } catch (error) {
      // Annuler en cas d'erreur
      await db.query('ROLLBACK');
      console.error('Error reactivating admin:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
});
    
app.get('/admin/subscription', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    try {
      const adminId = req.user.id;
      const query = `
        SELECT username, email, max_managers, max_employes, is_active, enterprise_name, start_date, end_date
        FROM admin
        WHERE id = $1
      `;
      const result = await db.query(query, [adminId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Détails de l\'abonnement introuvables.' });
      }
      const adminData = result.rows[0];
      const subscriptionDetails = {
        username: adminData.username,
        email: adminData.email,
        enterpriseName: adminData.enterprise_name,
        startDate: adminData.start_date,
        endDate: adminData.end_date,
        maxManagers: adminData.max_managers,
        maxEmployes: adminData.max_employes,
      };
      res.json(subscriptionDetails);
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des détails de l\'abonnement.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

function buildCertificationExpirationQuery() {
    const currentDate = new Date();
    const updateQuery = `
        UPDATE public.certifications
        SET expire = true
        FROM employees e
        WHERE certifications.employee_id = e.id AND e.manager_id = $1 AND certifications.issued_date <= $2 AND certifications.expire = false
      `;
    return { updateQuery, currentDate };
}
