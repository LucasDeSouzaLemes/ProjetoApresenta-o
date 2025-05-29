const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
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

// HTML da página principal (interface do usuário)
const htmlPage = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciamento de Alunos</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        
        body {
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
        }
        
        h2 {
            color: #444;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        
        .form-container {
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .form-buttons {
            margin-top: 20px;
        }
        
        button {
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        
        #saveBtn {
            background-color: #4CAF50;
            color: white;
        }
        
        #cancelBtn {
            background-color: #f44336;
            color: white;
            margin-left: 10px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background-color: #f2f2f2;
        }
        
        .action-btn {
            padding: 5px 10px;
            margin-right: 5px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .edit-btn {
            background-color: #2196F3;
            color: white;
        }
        
        .delete-btn {
            background-color: #f44336;
            color: white;
        }
        
        .message {
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        
        .success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        
        .error {
            background-color: #f2dede;
            color: #a94442;
        }
        
        .matricula-readonly {
            background-color: #f5f5f5;
            cursor: not-allowed;
        }
        
        /* Estilos para as abas */
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        
        .tab-btn {
            padding: 10px 20px;
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-bottom: none;
            border-radius: 5px 5px 0 0;
            margin-right: 5px;
            cursor: pointer;
        }
        
        .tab-btn.active {
            background-color: #fff;
            border-bottom: 1px solid #fff;
            margin-bottom: -1px;
            font-weight: bold;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Estilos para a pesquisa */
        .search-container {
            margin-bottom: 30px;
        }
        
        .search-form {
            display: flex;
            align-items: flex-end;
            margin-bottom: 20px;
        }
        
        .search-form .form-group {
            flex: 1;
            margin-right: 15px;
            margin-bottom: 0;
        }
        
        .search-btn {
            background-color: #2196F3;
            color: white;
            height: 38px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sistema de Gerenciamento de Alunos</h1>
        
        <div id="message" class="message" style="display: none;"></div>
        
        <div class="tabs">
            <button class="tab-btn active" data-tab="cadastro">Cadastro</button>
            <button class="tab-btn" data-tab="pesquisa">Pesquisa</button>
        </div>
        
        <div id="cadastro" class="tab-content active">
            <div class="form-container">
            <h2>Cadastrar/Editar Aluno</h2>
            <form id="alunoForm">
                <input type="hidden" id="alunoId">
                
                <div class="form-group">
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" required>
                </div>
                
                <div class="form-group">
                    <label for="dataNascimento">Data de Nascimento:</label>
                    <input type="date" id="dataNascimento">
                </div>
                
                <div class="form-group">
                    <label for="curso">Curso:</label>
                    <input type="text" id="curso" required>
                </div>
                
                <div class="form-group">
                    <label for="matricula">Matrícula:</label>
                    <input type="text" id="matricula" readonly class="matricula-readonly" placeholder="Gerada automaticamente">
                </div>
                
                <div class="form-buttons">
                    <button type="submit" id="saveBtn">Salvar</button>
                    <button type="button" id="cancelBtn">Cancelar</button>
                </div>
            </form>
        </div>
        
        <div class="list-container">
            <h2>Lista de Alunos</h2>
            <table id="alunosTable">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Curso</th>
                        <th>Matrícula</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="alunosList">
                    <!-- Dados dos alunos serão inseridos aqui -->
                </tbody>
            </table>
        </div>
        </div>
        
        <div id="pesquisa" class="tab-content">
            <div class="search-container">
                <h2>Pesquisar Alunos</h2>
                <div class="search-form">
                    <div class="form-group">
                        <label for="searchNome">Nome do Aluno:</label>
                        <input type="text" id="searchNome" placeholder="Digite o nome para pesquisar">
                    </div>
                    <button id="searchBtn" class="search-btn">Pesquisar</button>
                </div>
                
                <div class="search-results">
                    <h3>Resultados da Pesquisa</h3>
                    <table id="searchResultsTable">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Curso</th>
                                <th>Matrícula</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="searchResultsList">
                            <!-- Resultados da pesquisa serão inseridos aqui -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const API_URL = '/api/alunos';
            const alunoForm = document.getElementById('alunoForm');
            const alunosList = document.getElementById('alunosList');
            const alunoIdInput = document.getElementById('alunoId');
            const nomeInput = document.getElementById('nome');
            const emailInput = document.getElementById('email');
            const dataNascimentoInput = document.getElementById('dataNascimento');
            const cursoInput = document.getElementById('curso');
            const matriculaInput = document.getElementById('matricula');
            const cancelBtn = document.getElementById('cancelBtn');
            const messageDiv = document.getElementById('message');
            
            // Elementos da pesquisa
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            const searchNomeInput = document.getElementById('searchNome');
            const searchBtn = document.getElementById('searchBtn');
            const searchResultsList = document.getElementById('searchResultsList');
            
            // Carregar alunos ao iniciar
            loadAlunos();
            
            // Event listeners
            alunoForm.addEventListener('submit', saveAluno);
            cancelBtn.addEventListener('click', resetForm);
            searchBtn.addEventListener('click', searchAlunos);
            searchNomeInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchAlunos();
                }
            });
            
            // Event listeners para as abas
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.dataset.tab;
                    
                    // Remover classe active de todas as abas
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Adicionar classe active na aba clicada
                    btn.classList.add('active');
                    document.getElementById(tabId).classList.add('active');
                    
                    // Se for a aba de pesquisa, limpar os resultados anteriores
                    if (tabId === 'pesquisa') {
                        searchResultsList.innerHTML = '';
                    }
                });
            });
            
            // Funções
            function loadAlunos() {
                fetch(API_URL)
                    .then(response => response.json())
                    .then(alunos => {
                        alunosList.innerHTML = '';
                        alunos.forEach(aluno => {
                            const row = document.createElement('tr');
                            row.innerHTML = \`
                                <td>\${aluno.nome}</td>
                                <td>\${aluno.email}</td>
                                <td>\${aluno.curso || '-'}</td>
                                <td>\${aluno.matricula || '-'}</td>
                                <td>
                                    <button class="action-btn edit-btn" data-id="\${aluno.id}">Editar</button>
                                    <button class="action-btn delete-btn" data-id="\${aluno.id}">Excluir</button>
                                </td>
                            \`;
                            alunosList.appendChild(row);
                        });
                        
                        // Adicionar event listeners para os botões de ação
                        document.querySelectorAll('.edit-btn').forEach(btn => {
                            btn.addEventListener('click', () => editAluno(btn.dataset.id));
                        });
                        
                        document.querySelectorAll('.delete-btn').forEach(btn => {
                            btn.addEventListener('click', () => deleteAluno(btn.dataset.id));
                        });
                    })
                    .catch(error => {
                        console.error('Erro ao carregar alunos:', error);
                        showMessage('Erro ao carregar alunos', 'error');
                    });
            }
            
            function saveAluno(e) {
                e.preventDefault();
                
                // Validação do formulário
                if (!cursoInput.value.trim()) {
                    showMessage('O campo Curso é obrigatório', 'error');
                    cursoInput.focus();
                    return;
                }
                
                const aluno = {
                    nome: nomeInput.value,
                    email: emailInput.value,
                    data_nascimento: dataNascimentoInput.value || null,
                    curso: cursoInput.value
                };
                
                const id = alunoIdInput.value;
                const method = id ? 'PUT' : 'POST';
                const url = id ? \`\${API_URL}/\${id}\` : API_URL;
                
                // Se estiver editando, inclui a matrícula existente
                if (id && matriculaInput.value) {
                    aluno.matricula = matriculaInput.value;
                }
                
                fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(aluno)
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.error || 'Erro ao salvar aluno');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    showMessage(id ? 'Aluno atualizado com sucesso!' : 'Aluno adicionado com sucesso!', 'success');
                    resetForm();
                    loadAlunos();
                })
                .catch(error => {
                    console.error('Erro:', error);
                    showMessage(error.message, 'error');
                });
            }
            
            function editAluno(id) {
                fetch(\`\${API_URL}/\${id}\`)
                    .then(response => response.json())
                    .then(aluno => {
                        alunoIdInput.value = aluno.id;
                        nomeInput.value = aluno.nome;
                        emailInput.value = aluno.email;
                        dataNascimentoInput.value = aluno.data_nascimento ? aluno.data_nascimento.split('T')[0] : '';
                        cursoInput.value = aluno.curso || '';
                        matriculaInput.value = aluno.matricula || '';
                    })
                    .catch(error => {
                        console.error('Erro ao carregar aluno:', error);
                        showMessage('Erro ao carregar dados do aluno', 'error');
                    });
            }
            
            function deleteAluno(id) {
                if (confirm('Tem certeza que deseja excluir este aluno?')) {
                    fetch(\`\${API_URL}/\${id}\`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => {
                                throw new Error(err.error || 'Erro ao excluir aluno');
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        showMessage('Aluno excluído com sucesso!', 'success');
                        loadAlunos();
                    })
                    .catch(error => {
                        console.error('Erro:', error);
                        showMessage(error.message, 'error');
                    });
                }
            }
            
            function resetForm() {
                alunoForm.reset();
                alunoIdInput.value = '';
                matriculaInput.value = '';
            }
            
            function showMessage(message, type) {
                messageDiv.textContent = message;
                messageDiv.className = \`message \${type}\`;
                messageDiv.style.display = 'block';
                
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 5000);
            }
            
            // Função para pesquisar alunos
            function searchAlunos() {
                const nome = searchNomeInput.value.trim();
                
                if (!nome) {
                    showMessage('Digite um nome para pesquisar', 'error');
                    return;
                }
                
                fetch(\`\${API_URL}?nome=\${encodeURIComponent(nome)}\`)
                    .then(response => response.json())
                    .then(alunos => {
                        searchResultsList.innerHTML = '';
                        
                        if (alunos.length === 0) {
                            searchResultsList.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum aluno encontrado</td></tr>';
                            return;
                        }
                        
                        alunos.forEach(aluno => {
                            const row = document.createElement('tr');
                            row.innerHTML = \`
                                <td>\${aluno.nome}</td>
                                <td>\${aluno.email}</td>
                                <td>\${aluno.curso || '-'}</td>
                                <td>\${aluno.matricula || '-'}</td>
                                <td>
                                    <button class="action-btn edit-btn" data-id="\${aluno.id}">Editar</button>
                                    <button class="action-btn delete-btn" data-id="\${aluno.id}">Excluir</button>
                                </td>
                            \`;
                            searchResultsList.appendChild(row);
                        });
                        
                        // Adicionar event listeners para os botões de ação
                        document.querySelectorAll('#searchResultsList .edit-btn').forEach(btn => {
                            btn.addEventListener('click', () => {
                                // Mudar para a aba de cadastro
                                tabBtns[0].click();
                                // Editar o aluno
                                editAluno(btn.dataset.id);
                            });
                        });
                        
                        document.querySelectorAll('#searchResultsList .delete-btn').forEach(btn => {
                            btn.addEventListener('click', () => deleteAluno(btn.dataset.id));
                        });
                    })
                    .catch(error => {
                        console.error('Erro ao pesquisar alunos:', error);
                        showMessage('Erro ao pesquisar alunos', 'error');
                    });
            }
        });
    </script>
</body>
</html>
`;

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
        curso VARCHAR(100) NOT NULL,
        matricula VARCHAR(20) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar sequência para matrícula se não existir
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'matricula_seq') THEN
          CREATE SEQUENCE matricula_seq START 1000;
        END IF;
      END
      $$;
    `);
    
    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
};

// Rota raiz - Retorna a página HTML
app.get('/', (req, res) => {
  res.send(htmlPage);
});

// Rotas para gerenciamento de alunos

// Listar todos os alunos
app.get('/api/alunos', async (req, res) => {
  try {
    const { nome } = req.query;
    
    let query = 'SELECT * FROM alunos';
    let params = [];
    
    if (nome) {
      query += ' WHERE LOWER(nome) LIKE LOWER($1)';
      params.push(`%${nome}%`);
    }
    
    query += ' ORDER BY nome';
    
    const result = await pool.query(query, params);
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
  const { nome, email, data_nascimento, curso } = req.body;
  
  // Validação básica
  if (!nome || !email || !curso) {
    return res.status(400).json({ error: 'Nome, email e curso são obrigatórios' });
  }
  
  try {
    // Gerar nova matrícula
    const matriculaResult = await pool.query("SELECT nextval('matricula_seq') as next_matricula");
    const anoAtual = new Date().getFullYear();
    const matricula = `${anoAtual}${matriculaResult.rows[0].next_matricula}`;
    
    const result = await pool.query(
      'INSERT INTO alunos (nome, email, data_nascimento, curso, matricula) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, email, data_nascimento, curso, matricula]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error);
    if (error.code === '23505') { // Código de erro para violação de unicidade
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao adicionar aluno' });
  }
});

// Atualizar aluno
app.put('/api/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, data_nascimento, curso, matricula } = req.body;
  
  // Validação básica
  if (!nome || !email || !curso) {
    return res.status(400).json({ error: 'Nome, email e curso são obrigatórios' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE alunos SET nome = $1, email = $2, data_nascimento = $3, curso = $4 WHERE id = $5 RETURNING *',
      [nome, email, data_nascimento, curso, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
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