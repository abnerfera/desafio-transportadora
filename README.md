# Sistema de Gestão de Coletas (Transportadora)

Aplicação Full-Stack desenvolvida como resolução do Case Técnico para a vaga de Desenvolvedor Web Jr. O sistema permite o registro, atribuição, acompanhamento e registro de ocorrências de coletas logísticas, garantindo rastreabilidade e integridade das regras de negócio.

## Tecnologias Utilizadas

**Back-end:**
- C# com .NET 8
- Entity Framework Core (ORM)
- PostgreSQL
- xUnit (Testes Unitários)

**Front-end:**
- React + Vite
- Axios (Integração de APIs)

**Infraestrutura:**
- Docker & Docker Compose

---

## Diferenciais Implementados

Além dos requisitos obrigatórios, este projeto conta com:
- **Auto-Migration e Seed de Dados:** Ao subir os containers, o sistema cria o banco automaticamente e insere dados iniciais (Motoristas e Veículos) para facilitar o teste.
- **Docker Compose:** Orquestração completa. Banco, API e Front-end sobem juntos em um único comando.
- **Testes Unitários:** Projeto `xUnit` garantindo a integridade das regras de transição de status.
- **Renderização Condicional (UX):** A interface do React protege as ações do usuário (ex: esconde botões de ação caso a coleta esteja cancelada).

---

## Como Executar o Projeto Localmente

> **Nota sobre o Swagger:** Por questões de segurança, a interface de documentação (Swagger) é exibida apenas em ambiente de desenvolvimento. Caso precise acessar o Swagger durante os testes, já deixei como Development no arquivo 'docker-compose.yml'.

A aplicação foi desenhada para rodar de forma isolada via containers, sem a necessidade de instalar bancos de dados ou SDKs na máquina host.

---
## 🎥 Vídeo de Demonstração
Para uma visão geral das funcionalidades, regras de negócio e a orquestração do sistema, confira o vídeo de apresentação abaixo:

**[Clique aqui para assistir à demonstração do projeto](https://youtu.be/JVdHTcEIE9Y)**
---

**Pré-requisitos:** Docker e Docker Desktop/Engine instalados.

*1. Clone o repositório:*

   git clone https://github.com/abnerfera/desafio-transportadora.git
   
   cd desafio-transportadora

*2. Suba a infraestrutura completa:*

   docker-compose up -d --build

*3. Acesse as aplicações no seu navegador:*
- Front-end (Painel Operacional): http://localhost:5173
- Back-end (Documentação Swagger): http://localhost:5264/swagger/index.html

**Nota: Na primeira execução, o Back-end aplicará automaticamente as Migrations do Entity Framework, criando a estrutura do banco e os registros iniciais.**

---

## Arquitetura e Decisões Técnicas

- **Separação de Responsabilidades:** O projeto foi dividido em dois containers distintos (Frontend e Backend) se comunicando via REST. Isso facilita a escalabilidade independente de cada serviço.
- **Banco de Dados Relacional:** Optou-se pelo PostgreSQL devido à sua robustez. O uso do EF Core permite que a modelagem em C# dite as regras do banco, facilitando manutenções futuras.
- **Validações no Back-end:** Todas as restrições de negócio (como impedir que um pedido cancelado volte ao fluxo) foram travadas na API, retornando BadRequest (400) com mensagens claras. O Front-end apenas reflete essa segurança ocultando os botões, mas a fonte da verdade é o servidor.
- **Horário do Servidor:** Para garantir auditoria e evitar fraudes, o registro de DataHora nas Ocorrências é gerado pelo back-end (DateTime.UtcNow) no momento da requisição, e não enviado pelo cliente.

---

## Como rodar os Testes Unitários

O projeto possui validações automatizadas das restrições de negócio usando xUnit e In-Memory Database.
Para rodar os testes localmente via SDK do .NET:

cd backend.Tests
dotnet test

---
*Desenvolvido com dedicação por Ábner Ernesto.*
