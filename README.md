# RepoProjetoAlunos
=======
# Sistema de Gerenciamento de Alunos

Uma aplicação simples para gerenciamento de cadastro de alunos utilizando Node.js, PostgreSQL e Docker.

## Funcionalidades

- Adicionar alunos
- Listar alunos
- Buscar aluno por ID
- Atualizar cadastro de alunos
- Excluir alunos

## Tecnologias Utilizadas

- Node.js
- Express
- PostgreSQL
- Docker e Docker Compose

## Como Executar

1. Certifique-se de ter o Docker e o Docker Compose instalados em sua máquina.

2. Clone este repositório e acesse a pasta do projeto.

3. Inicie os containers:
   ```
   docker-compose up -d
   ```

4. A aplicação estará disponível em: http://localhost:3000

## Estrutura do Projeto

- `index.js`: Arquivo principal que contém toda a aplicação (backend e frontend)
- `docker-compose.yml`: Configuração dos containers Docker
- `Dockerfile`: Configuração do ambiente Node.js
- `.env`: Variáveis de ambiente

## Endpoints da API

### Listar todos os alunos
```
GET /api/alunos
```

### Buscar aluno por ID
```
GET /api/alunos/:id
```

### Adicionar novo aluno
```
POST /api/alunos
```
Corpo da requisição:
```json
{
  "nome": "Nome do Aluno",
  "email": "aluno@email.com",
  "data_nascimento": "2000-01-01",
  "curso": "Engenharia de Software",
  "matricula": "2023001"
}
```

### Atualizar aluno
```
PUT /api/alunos/:id
```
Corpo da requisição: mesmo formato do POST.

### Excluir aluno
```
DELETE /api/alunos/:id
```
