# 🚒 Controle de Frota - Portal Analítico Operacional

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Material UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react&logoColor=white)

Um moderno Sistema de Gestão de Frota, desenhado com foco absoluto em **Inteligência Preditiva**, **Experiência do Usuário (UX)** e **Segurança Operacional**. 

O sistema integra e normaliza dados descentralizados provenientes de múltiplas planilhas do Google Sheets (Checklists Diários, Semanais, Abastecimentos, Cadastros e Manutenções) para oferecer um **Centro de Comando centralizado** no controle das viaturas.

---

## 🎯 Principais Funcionalidades

### 📊 Dashboard de Comando
- Painel estilo *Centro de Controle* com visão macro em tempo real de todas as viaturas.
- KPIs rápidos da operação: Custo, Consumo, Viaturas Baixadas, Operando e Reserva.
- Central de notificações automatizadas classificadas por severidade (Info, Warning, Critical).

### 🔮 Inteligência Preditiva & Análises (Forecast)
- **Forecast de Manutenção:** Algoritmo que projeta e calcula a *Média de KM diário* percorrido por cada viatura no passado, prevendo a exata data no calendário em que ocorrerá o vencimento da próxima manutenção preventiva.
- **Gráficos Avançados:** Utilização da biblioteca *Recharts* para demonstrar Relação Custo vs Quilometragem e rankeamento dos maiores gargalos operacionais.
- Indicadores de tempo médio entre revisões e índices de falhas/avarias.

### 🛡️ Motor de Integridade de Dados
- Sistema anti-falhas que audita as planilhas do Google Sheets de forma contínua em busca de:
  - **Inconsistências de Odômetro:** Impede que um checklist registre KM menor que o abastecimento de ontem.
  - **Viaturas Órfãs ou Duplicadas:** Detecta viaturas com informações cadastradas incorretamente.
  - O sistema continua rodando mesmo se a planilha principal (*Consolidado*) apresentar dados faltantes, buscando KMs e gastos diretamente da fonte (Checklists e Comprovantes).

### 🎨 Design Premium (Glassmorphism & Dark Mode)
- Interface de altíssima qualidade desenvolvida em **Material UI**.
- Uso de componentes de vidro (*Glassmorphism*): fundos translúcidos com efeito blur e bordas suaves.
- Layouts complexos e modernos como o formato **Masonry** em 2 colunas rígidas (independentes de zoom).
- Nova Sidebar *flat* com dropdowns, sem barra de rolagem e ícone exclusivo.
- Totalmente **Responsivo**: Adaptação perfeita de celulares até grandes monitores de centro de operações.

### ⚡ PWA & Offline-First
- Progressive Web App ativado (Vite PWA).
- Service Workers que fazem cache do código em produção, garantindo extrema velocidade nos recarregamentos.
- *Para atualizar versões forçadamente (furar cache agressivo), utilize abas anônimas ou limpe os dados do site.*

---

## 🛠️ Arquitetura e Tecnologias

- **Front-end:** React 19, TypeScript, Vite.
- **Gerenciamento de Estado Global:** Zustand (store modular para viaturas e filtros).
- **Estilização e Componentes:** Material UI (MUI v5) e Emotion.
- **Visualização de Dados:** Recharts.
- **Tratamento de Datas:** Date-fns.
- **Banco de Dados / Backend:** Google Sheets integrado via Google Apps Script (JSON Endpoint).

---

## 🚀 Como executar o projeto localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Andre-fdias/controle_frota.git
   cd controle_frota
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   *(Ou utilize yarn / pnpm se preferir)*

3. **Inicie o servidor de desenvolvimento (Vite):**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   - O aplicativo estará rodando em `http://localhost:5173`.

---

## 🏗️ Estrutura do Projeto

```plaintext
src/
├── components/       # Componentes reaproveitáveis (Sidebar, Header, Alertas, etc)
├── pages/            # Páginas da aplicação (Dashboard, Analises, Viaturas, Integridade)
├── services/         # Motores de negócio e comunicação (Google Sheets API, Normalização, Joins)
├── store/            # Gerenciamento de estado global (Zustand: vehicleStore, filterStore)
├── types/            # Definições estritas de interfaces em TypeScript (Vehicle, Checklist, etc)
├── utils/            # Funções utilitárias diversas
└── App.tsx           # Configuração de Rotas e Layout Base
```

---

## 📡 Integração com Google Sheets

O aplicativo foi projetado para operar sem a necessidade de um servidor de banco de dados tradicional como Postgres ou MySQL, alavancando a facilidade das planilhas do Google usadas operacionalmente pela equipe.

A comunicação é feita de forma assíncrona com um Script (Google Apps Script) publicado como Web App, que transforma as abas (Cadastro, Abastecimentos, Checklists) em um Payload JSON fortemente tipado lido pelo sistema de **RelationshipService** no Front-end.

---

## 🔒 Implantação (Deployment)

O sistema foi otimizado pelo Vite, produzindo um *build* estático incrivelmente rápido que pode ser hospedado em qualquer serviço de CDN moderno (Vercel, Netlify, Firebase Hosting ou GitHub Pages).

Para gerar os arquivos de produção:
```bash
npm run build
```
O diretório `/dist` será gerado com os arquivos prontos para o deploy.

---

Desenvolvido para modernizar e garantir máxima prontidão da frota operacional. 🚒
