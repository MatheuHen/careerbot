export type ProfileData = {
  nome: string;
  vaga: string;
  escolaridade: string;
  experiencias: string;
  cursos: string;
  habilidades: string;
  dificuldade: string;
};

export type ResumeResult = {
  analise: string;
  resumo: string;
  objetivo: string;
  formacao: string;
  experiencias: string;
  cursos: string;
  habilidades: string;
  dicas: string[];
};

export type InterviewQuestion = {
  pergunta: string;
  foco: string;
};

export type EvaluationResult = {
  nota: number;
  positivos: string[];
  melhorar: string[];
  respostaSugerida: string;
};

export type CareerBotAction =
  | "generate_resume"
  | "start_interview"
  | "evaluate_answer";

export type HistoryEntry = {
  id: string;
  data: string;
  vaga: string;
  nome: string;
  resume: ResumeResult;
};
