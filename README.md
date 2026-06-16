# CareerBot

**Agente Inteligente para Criação de Currículos e Simulação de Entrevistas**

Aplicação web acadêmica desenvolvida para um Workshop de Inteligência Artificial.
O usuário informa seus dados profissionais, a IA gera um currículo personalizado e,
em seguida, simula uma entrevista de emprego com perguntas e avaliação das respostas.

## Tecnologias

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** para estilização
- **API interna** em Next.js para conversar com o LLM
- **localStorage** para histórico e perfil (sem login e sem banco de dados)
- **Web Speech API** para resposta por voz (quando o navegador permite)

## Agentes inteligentes

O sistema simula cinco agentes especializados, definidos nos prompts de sistema (`lib/prompts.ts`):

1. **Coletor de Perfil** — organiza e interpreta os dados do usuário.
2. **Criador de Currículo** — gera o currículo personalizado.
3. **Simulador de Entrevista** — cria perguntas de acordo com a vaga.
4. **Avaliador de Respostas** — avalia a resposta e sugere melhorias.
5. **Orientador Profissional** — sugere habilidades, cursos e melhorias.

## RAG simples

O arquivo `lib/knowledge-base.ts` contém uma base de conhecimento com dicas de currículo
e entrevista. Antes de chamar o LLM, o sistema recupera as dicas mais relevantes
(`retrieveKnowledge`) e as injeta no prompt, simulando um fluxo de RAG.

## IA real obrigatória

Este projeto **usa OpenAI API como integração principal de LLM real**.
Não há fallback local para gerar resultado final.

- **Sem chave / chave inválida / placeholder:** o sistema **bloqueia** a geração
  de currículo, entrevista e avaliação. A mensagem exibida é:
  *"A IA real não está configurada. Configure uma chave válida da OpenAI no arquivo `.env.local`."*
- **Com chave válida:** o sistema chama a OpenAI de verdade usando o modelo
  `gpt-4o-mini`, com resposta exigida em JSON válido.
- **Segurança:** a chave fica **somente no backend**, lida no servidor pela rota
  `app/api/careerbot/route.ts`. O frontend nunca recebe nem acessa `process.env.LLM_API_KEY`.

## Estrutura

```
app/
  page.tsx                 Página principal (formulário, currículo, entrevista, histórico)
  layout.tsx               Layout e metadados
  globals.css              Estilos base (Tailwind)
  api/careerbot/route.ts   API interna: generate_resume | start_interview | evaluate_answer
lib/
  prompts.ts               Prompts de sistema dos 5 agentes
  knowledge-base.ts        Base de conhecimento + recuperação (RAG simples)
  llm.ts                   Integração com a OpenAI API
  types.ts                 Tipos compartilhados
components/
  ResumeView.tsx           Exibição do currículo
  useSpeechRecognition.ts  Hook de entrada por voz
```

## Como rodar o projeto (passo a passo)

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar a IA real**
   - Copie o arquivo de exemplo:
     ```bash
     copy .env.example .env.local
     ```
   - Edite `.env.local` e preencha:
     ```
     LLM_PROVIDER=openai
     LLM_API_KEY=COLE_SUA_CHAVE_DA_OPENAI_AQUI
     LLM_MODEL=gpt-4o-mini
     ```
   - A chave é **obrigatória**: sem ela, com placeholder ou inválida, o sistema
     mostra o erro amigável e **não gera** currículo, entrevista ou avaliação.

3. **Rodar em desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse: http://localhost:3000

4. **Build de produção (opcional)**
   ```bash
   npm run build
   npm run start
   ```

## Como usar

1. Preencha o formulário com seus dados reais (mínimo: Nome e Vaga desejada).
2. Clique em **Gerar Currículo com IA**.
3. Use **Copiar currículo** para levar o texto para onde quiser.
4. Clique em **Iniciar entrevista**, responda (texto ou voz) e clique em **Avaliar resposta**.
5. Veja o histórico salvo no navegador na seção final.

## Variáveis de ambiente

| Variável       | Descrição                                        | Padrão              |
| -------------- | ------------------------------------------------ | ------------------- |
| `LLM_PROVIDER` | provedor principal do app                        | `openai`            |
| `LLM_API_KEY`  | Chave da API — **obrigatória** (vazio = app não gera) | —              |
| `LLM_MODEL`    | Modelo usado                                     | `gpt-4o-mini`       |

> A chave de API é lida apenas no servidor. Nunca a coloque em código do frontend.
