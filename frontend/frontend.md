Estrutura de Pastas - Frontend (Next.js)

Este projeto usa Next.js (App Router) com TypeScript e TailwindCSS. A estrutura é pensada para suportar crescimento, reutilização e customização por clínicas (white-label).

Estrutura de pastas sugerida:
frontend/
├── src/
│   ├── app/               # Rotas (App Router) e layouts
│   │   ├── layout.tsx     # Layout global (ex: Navbar, tema)
│   │   ├── page.tsx       # Página inicial
│   │   ├── login/         # Tela de login
│   │   └── dashboard/     # Área logada protegida
│   ├── components/        # Componentes reutilizáveis (Button, Card, etc.)
│   ├── context/           # Contextos globais (auth, tenant, tema)
│   ├── hooks/             # Hooks customizados (useAuth, useTheme)
│   ├── lib/               # Funções utilitárias, clients de API, serviços
│   ├── styles/            # Estilos globais, Tailwind config
│   └── types/             # Tipagens globais compartilhadas
├── public/                # Imagens públicas (logos, ícones)
├── tailwind.config.ts     # Configuração de temas
├── postcss.config.js
├── tsconfig.json

Organização e propósito:

app/: Cada subpasta representa uma rota. layout.tsx define o visual global e é usada para aplicar temas e navegação. Tudo aqui segue o modelo do App Router.

components/: Armazena componentes visuais reutilizáveis e independentes. Ex: Button.tsx, Modal.tsx, Sidebar.tsx.

context/: Armazena Providers React para autenticação, tenant, tema visual, etc.

hooks/: Hooks personalizados para abstrair lógica de estado, fetch, controle de auth, etc.

lib/: Helpers como funções de API, cliente Axios, formatação de data, carregamento de configs.

styles/: Arquivos CSS globais, temas, Tailwind utilities personalizadas.

types/: Interfaces e tipagens compartilhadas entre componentes, contextos e hooks.

Benefícios

Fácil escalabilidade do front-end

Permite temas e logos diferentes por clínica (white-label)

Separação clara entre páginas, lógica e visual

Reutilização de componentes e hooks