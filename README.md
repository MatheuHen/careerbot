# CareerBot

Aplicação web para montar um currículo com IA e treinar entrevista a partir do perfil informado pelo usuário.
O projeto foi feito com foco acadêmico, mas roda como uma aplicação Next normal, sem login e sem banco.

## O que ele faz

O usuário preenche nome, vaga, formação, experiências, cursos, habilidades e dificuldade em entrevista.
Com isso, o sistema gera um currículo em texto, cria perguntas de entrevista e avalia as respostas.

O histórico fica salvo no navegador.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenAI API
- Web Speech API
- localStorage

## Como rodar

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env.local` na raiz com este conteúdo:

```env
LLM_PROVIDER=openai
LLM_API_KEY=sua_chave_aqui
LLM_MODEL=gpt-4o-mini
```

3. Inicie o projeto:

```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000).
5. Abra https://careerbot-two.vercel.app/
