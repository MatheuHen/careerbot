"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ProfileData,
  ResumeResult,
  InterviewQuestion,
  EvaluationResult,
  HistoryEntry,
  CareerBotAction
} from "@/lib/types";
import ResumeView, { resumeToPlainText } from "@/components/ResumeView";
import { useSpeechRecognition } from "@/components/useSpeechRecognition";

const EMPTY_PROFILE: ProfileData = {
  nome: "",
  vaga: "",
  escolaridade: "",
  experiencias: "",
  cursos: "",
  habilidades: "",
  dificuldade: ""
};

const HISTORY_KEY = "careerbot_history";
const PROFILE_KEY = "careerbot_profile";

const FIELDS: {
  key: keyof ProfileData;
  label: string;
  placeholder: string;
  textarea?: boolean;
}[] = [
  { key: "nome", label: "Nome", placeholder: "Ex: Maria Silva" },
  {
    key: "vaga",
    label: "Vaga desejada",
    placeholder: "Ex: Desenvolvedora Front-end Júnior"
  },
  {
    key: "escolaridade",
    label: "Escolaridade",
    placeholder: "Ex: Cursando Engenharia de Software (4º período)"
  },
  {
    key: "experiencias",
    label: "Experiências profissionais",
    placeholder: "Descreva onde trabalhou, funções e o que fez.",
    textarea: true
  },
  {
    key: "cursos",
    label: "Cursos",
    placeholder: "Ex: Lógica de Programação, Inglês intermediário...",
    textarea: true
  },
  {
    key: "habilidades",
    label: "Habilidades",
    placeholder: "Ex: JavaScript, trabalho em equipe, comunicação...",
    textarea: true
  },
  {
    key: "dificuldade",
    label: "Maior dificuldade em entrevistas",
    placeholder: "Ex: Fico nervoso ao falar sobre meus pontos fracos.",
    textarea: true
  }
];

export default function Home() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [resume, setResume] = useState<ResumeResult | null>(null);
  const [mode, setMode] = useState<"llm" | null>(null);
  const [configError, setConfigError] = useState(false);

  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<CareerBotAction | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const { supported, listening, toggle } = useSpeechRecognition((text) =>
    setAnswer((prev) => (prev ? prev + " " + text : text))
  );

  useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) setProfile({ ...EMPTY_PROFILE, ...JSON.parse(p) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  const canGenerate = useMemo(
    () => profile.nome.trim() !== "" && profile.vaga.trim() !== "",
    [profile.nome, profile.vaga]
  );

  function update(key: keyof ProfileData, value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  async function callApi(action: CareerBotAction, extra: Record<string, unknown> = {}) {
    const res = await fetch("/api/careerbot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, profile, ...extra })
    });
    const json = await res.json();
    if (!res.ok) {
      // IA real indisponível/sem configuração: sinaliza para o badge.
      setConfigError(json.code === "LLM_NOT_CONFIGURED");
      setMode(null);
      throw new Error(json.error || "Falha na requisição.");
    }
    setConfigError(false);
    setMode("llm");
    return json.data;
  }

  function saveHistory(result: ResumeResult) {
    const entry: HistoryEntry = {
      id: String(Date.now()),
      data: new Date().toLocaleString("pt-BR"),
      vaga: profile.vaga || "Vaga não informada",
      nome: profile.nome || "Sem nome",
      resume: result
    };
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 8);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  async function generateResume() {
    setError("");
    setLoading("generate_resume");
    try {
      const data = (await callApi("generate_resume")) as ResumeResult;
      setResume(data);
      saveHistory(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar currículo.");
    } finally {
      setLoading(null);
    }
  }

  async function startInterview() {
    setError("");
    setEvaluation(null);
    setAnswer("");
    setLoading("start_interview");
    try {
      const data = (await callApi("start_interview")) as InterviewQuestion;
      setQuestion(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao iniciar entrevista.");
    } finally {
      setLoading(null);
    }
  }

  async function evaluateAnswer() {
    if (!question) return;
    setError("");
    setLoading("evaluate_answer");
    try {
      const data = (await callApi("evaluate_answer", {
        question,
        answer
      })) as EvaluationResult;
      setEvaluation(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao avaliar resposta.");
    } finally {
      setLoading(null);
    }
  }

  function clearForm() {
    setProfile(EMPTY_PROFILE);
    setResume(null);
    setQuestion(null);
    setAnswer("");
    setEvaluation(null);
    setError("");
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch {}
  }

  async function copyResume() {
    if (!resume) return;
    try {
      await navigator.clipboard.writeText(
        resumeToPlainText(resume, profile.nome)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Não foi possível copiar o currículo.");
    }
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="text-center">
        <span className="chip">Workshop de Inteligência Artificial</span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Career<span className="text-brand-600">Bot</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
          Agente inteligente que cria seu currículo personalizado e simula uma
          entrevista de emprego, com feedback prático para você se preparar.
        </p>
      </header>

      <section className="card mt-10">
        <h2 className="text-lg font-bold text-slate-900">Como funciona</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Preencha seu perfil",
              d: "Informe seus dados profissionais reais no formulário."
            },
            {
              n: "2",
              t: "Gere seu currículo",
              d: "A IA organiza tudo e sugere melhorias com base no seu perfil."
            },
            {
              n: "3",
              t: "Treine a entrevista",
              d: "Responda perguntas e receba avaliação dos seus pontos."
            }
          ].map((step) => (
            <div key={step.n} className="rounded-xl bg-slate-50 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                {step.n}
              </div>
              <h3 className="mt-3 font-semibold text-slate-800">{step.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="card mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Seu perfil</h2>
          {(configError || mode === "llm") && (
            <span
              className={`text-xs font-medium ${
                configError ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {configError ? "IA não configurada" : "IA real conectada"}
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className={field.textarea ? "sm:col-span-2" : ""}
            >
              <label className="label" htmlFor={field.key}>
                {field.label}
              </label>
              {field.textarea ? (
                <textarea
                  id={field.key}
                  className="input min-h-[90px] resize-y"
                  placeholder={field.placeholder}
                  value={profile[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              ) : (
                <input
                  id={field.key}
                  className="input"
                  placeholder={field.placeholder}
                  value={profile[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="btn-primary"
            onClick={generateResume}
            disabled={!canGenerate || loading !== null}
          >
            {loading === "generate_resume"
              ? "Gerando..."
              : "Gerar Currículo com IA"}
          </button>
          <button className="btn-ghost" onClick={clearForm} disabled={loading !== null}>
            Limpar formulário
          </button>
        </div>
        {!canGenerate && (
          <p className="mt-2 text-xs text-slate-500">
            Preencha ao menos <strong>Nome</strong> e <strong>Vaga desejada</strong> para gerar.
          </p>
        )}
      </section>

      {resume && (
        <section className="card mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              Currículo gerado
            </h2>
            <button className="btn-soft" onClick={copyResume}>
              {copied ? "Copiado!" : "Copiar currículo"}
            </button>
          </div>
          <div className="mt-5">
            <ResumeView resume={resume} />
          </div>
        </section>
      )}

      <section className="card mt-6">
        <h2 className="text-lg font-bold text-slate-900">
          Simulação de entrevista
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          O agente simulador cria perguntas para a vaga de{" "}
          <strong>{profile.vaga || "..."}</strong>. Responda e receba avaliação.
        </p>

        <div className="mt-4">
          <button
            className="btn-primary"
            onClick={startInterview}
            disabled={!canGenerate || loading !== null}
          >
            {loading === "start_interview"
              ? "Preparando..."
              : question
              ? "Próxima pergunta"
              : "Iniciar entrevista"}
          </button>
        </div>

        {question && (
          <div className="mt-6 space-y-4 animate-fadeUp">
            <div className="rounded-xl bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Pergunta do entrevistador
              </span>
              <p className="mt-1 text-base font-medium text-slate-800">
                {question.pergunta}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Foco: {question.foco}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="answer">
                  Sua resposta
                </label>
                {supported && (
                  <button
                    type="button"
                    onClick={toggle}
                    className={`text-xs font-semibold ${
                      listening ? "text-red-600" : "text-brand-600"
                    }`}
                  >
                    {listening ? "● Gravando... parar" : "🎤 Responder por voz"}
                  </button>
                )}
              </div>
              <textarea
                id="answer"
                className="input min-h-[110px] resize-y"
                placeholder="Digite ou fale sua resposta para a pergunta acima."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            <button
              className="btn-primary"
              onClick={evaluateAnswer}
              disabled={loading !== null || answer.trim() === ""}
            >
              {loading === "evaluate_answer"
                ? "Avaliando..."
                : "Avaliar resposta"}
            </button>
          </div>
        )}

        {evaluation && (
          <div className="mt-6 space-y-4 animate-fadeUp">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-brand-600 text-white">
                <span className="text-lg font-bold leading-none">
                  {evaluation.nota}
                </span>
                <span className="text-[10px] opacity-80">/ 10</span>
              </div>
              <p className="text-sm text-slate-600">
                Avaliação da sua resposta pelo agente avaliador.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Pontos positivos
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {evaluation.positivos.map((p, i) => (
                    <li key={i} className="text-sm text-emerald-900">
                      ✓ {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Pontos a melhorar
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {evaluation.melhorar.map((p, i) => (
                    <li key={i} className="text-sm text-amber-900">
                      → {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-brand-200 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Resposta sugerida
              </h4>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {evaluation.respostaSugerida}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="card mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            Histórico ({history.length})
          </h2>
          {history.length > 0 && (
            <button className="btn-ghost" onClick={clearHistory}>
              Limpar histórico
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Nenhuma geração ainda. Seus currículos gerados aparecerão aqui,
            salvos no seu navegador.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-800">{h.vaga}</p>
                  <p className="text-xs text-slate-500">
                    {h.nome} · {h.data}
                  </p>
                </div>
                <button
                  className="btn-soft"
                  onClick={() => {
                    setResume(h.resume);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Ver currículo
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-10 text-center text-xs text-slate-400">
        CareerBot · Projeto acadêmico de Engenharia de Software · Feira de IA
      </footer>
    </main>
  );
}
