export type KnowledgeItem = {
  id: string;
  topic: "curriculo" | "entrevista";
  tags: string[];
  tip: string;
};

export const knowledgeBase: KnowledgeItem[] = [
  {
    id: "cv-01",
    topic: "curriculo",
    tags: ["resumo", "perfil", "objetivo"],
    tip: "Comece o currículo com um resumo de 3 a 4 linhas conectando sua experiência ao que a vaga pede."
  },
  {
    id: "cv-02",
    topic: "curriculo",
    tags: ["experiencia", "resultados", "verbos"],
    tip: "Descreva experiências com verbos de ação e, quando possível, resultados mensuráveis (ex: reduzi, aumentei, organizei)."
  },
  {
    id: "cv-03",
    topic: "curriculo",
    tags: ["habilidades", "tecnicas", "comportamentais"],
    tip: "Separe habilidades técnicas das comportamentais e priorize as que aparecem na descrição da vaga."
  },
  {
    id: "cv-04",
    topic: "curriculo",
    tags: ["formacao", "cursos", "escolaridade"],
    tip: "Liste a formação mais recente primeiro e inclua cursos curtos relevantes para a área desejada."
  },
  {
    id: "cv-05",
    topic: "curriculo",
    tags: ["clareza", "tamanho", "formatacao"],
    tip: "Mantenha o currículo objetivo, idealmente em uma página, com seções claras e linguagem simples."
  },
  {
    id: "cv-06",
    topic: "curriculo",
    tags: ["palavras-chave", "ats", "vaga"],
    tip: "Use palavras-chave da vaga no currículo para passar melhor por filtros automáticos de triagem."
  },
  {
    id: "int-01",
    topic: "entrevista",
    tags: ["star", "comportamental", "exemplos"],
    tip: "Responda perguntas comportamentais usando o método STAR: Situação, Tarefa, Ação e Resultado."
  },
  {
    id: "int-02",
    topic: "entrevista",
    tags: ["nervosismo", "ansiedade", "respiracao"],
    tip: "Se ficar nervoso, respire fundo e fale com calma; pausas curtas são naturais e passam segurança."
  },
  {
    id: "int-03",
    topic: "entrevista",
    tags: ["pontos fracos", "dificuldade", "fraqueza"],
    tip: "Ao falar de um ponto fraco, mostre o que está fazendo para melhorar em vez de só apontar o problema."
  },
  {
    id: "int-04",
    topic: "entrevista",
    tags: ["empresa", "pesquisa", "preparo"],
    tip: "Pesquise sobre a empresa antes da entrevista e conecte suas respostas aos valores e desafios dela."
  },
  {
    id: "int-05",
    topic: "entrevista",
    tags: ["clareza", "objetividade", "comunicacao"],
    tip: "Seja específico: exemplos reais convencem mais do que respostas genéricas e vagas."
  },
  {
    id: "int-06",
    topic: "entrevista",
    tags: ["perguntas", "encerramento", "interesse"],
    tip: "No fim da entrevista, tenha perguntas preparadas; isso demonstra interesse genuíno pela vaga."
  }
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function retrieveKnowledge(
  query: string,
  topic: KnowledgeItem["topic"],
  limit = 4
): KnowledgeItem[] {
  const terms = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  const scored = knowledgeBase
    .filter((item) => item.topic === topic)
    .map((item) => {
      const haystack = normalize(item.tip + " " + item.tags.join(" "));
      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += 1;
      }
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  const relevant = scored.filter((s) => s.score > 0).map((s) => s.item);
  const fallback = scored.map((s) => s.item);

  return (relevant.length ? relevant : fallback).slice(0, limit);
}

export function formatKnowledgeForPrompt(items: KnowledgeItem[]): string {
  return items.map((i, idx) => `${idx + 1}. ${i.tip}`).join("\n");
}
