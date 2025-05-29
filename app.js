const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Configuração do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_DATABASE || 'alunos_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Inicialização do app Express
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Inicializar o banco de dados
const initDb = async () => {
  try {
    // Criar tabela de alunos se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alunos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        data_nascimento DATE,
        curso VARCHAR(100),
        matricula VARCHAR(20) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
};

// Rotas para gerenciamento de alunos

// Listar todos os alunos
app.get('/api/alunos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// Buscar aluno por ID
app.get('/api/alunos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM alunos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

// Adicionar novo aluno
app.post('/api/alunos', async (req, res) => {
  const { nome, email, data_nascimento, curso, matricula } = req.body;
  
  // Validação básica
  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO alunos (nome, email, data_nascimento, curso, matricula) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, email, data_nascimento, curso, matricula]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error);
    if (error.code === '23505') { // Código de erro para violação de unicidade
      return res.status(400).json({ error: 'Email ou matrícula já cadastrados' });
    }
    res.status(500).json({ error: 'Erro ao adicionar aluno' });
  }
});

// Atualizar aluno
app.put('/api/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, data_nascimento, curso, matricula } = req.body;
  
  // Validação básica
  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE alunos SET nome = $1, email = $2, data_nascimento = $3, curso = $4, matricula = $5 WHERE id = $6 RETURNING *',
      [nome, email, data_nascimento, curso, matricula, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email ou matrícula já cadastrados' });
    }
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// Excluir aluno
app.delete('/api/alunos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM alunos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json({ message: 'Aluno excluído com sucesso', aluno: result.rows[0] });
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    res.status(500).json({ error: 'Erro ao excluir aluno' });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do servidor
const startServer = async () => {
  try {
    // Inicializar o banco de dados
    await initDb();
    
    // Iniciar o servidor
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();