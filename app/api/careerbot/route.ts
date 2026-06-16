import { NextRequest, NextResponse } from "next/server";
import type { CareerBotAction, ProfileData, InterviewQuestion } from "@/lib/types";
import {
  buildResumePrompt,
  buildInterviewPrompt,
  buildEvaluationPrompt
} from "@/lib/prompts";
import {
  retrieveKnowledge,
  formatKnowledgeForPrompt
} from "@/lib/knowledge-base";
import { isLlmConfigured, runLlm, LlmError } from "@/lib/llm";

export const runtime = "nodejs";

// Mensagem amigável exibida na tela quando a IA real não está disponível.
const NOT_CONFIGURED_MESSAGE =
  "A IA real não está configurada. Configure uma chave válida da OpenAI no arquivo .env.local.";

type Body = {
  action: CareerBotAction;
  profile: ProfileData;
  question?: InterviewQuestion;
  answer?: string;
  index?: number;
};

function notConfigured(): NextResponse {
  return NextResponse.json(
    { error: NOT_CONFIGURED_MESSAGE, code: "LLM_NOT_CONFIGURED" },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const { action, profile } = body;
  if (!action || !profile) {
    return NextResponse.json(
      { error: "Ação ou perfil ausentes." },
      { status: 400 }
    );
  }

  // IA real é OBRIGATÓRIA. Sem chave válida, nada é gerado.
  if (!isLlmConfigured()) {
    return notConfigured();
  }

  try {
    if (action === "generate_resume") {
      const kb = formatKnowledgeForPrompt(
        retrieveKnowledge(
          `${profile.vaga} ${profile.habilidades} ${profile.experiencias}`,
          "curriculo"
        )
      );
      const data = await runLlm(buildResumePrompt(profile, kb));
      return NextResponse.json({ mode: "llm", data });
    }

    if (action === "start_interview") {
      const kb = formatKnowledgeForPrompt(
        retrieveKnowledge(`${profile.vaga} ${profile.dificuldade}`, "entrevista")
      );
      const data = await runLlm(buildInterviewPrompt(profile, kb));
      return NextResponse.json({ mode: "llm", data });
    }

    if (action === "evaluate_answer") {
      const question = body.question;
      if (!question) {
        return NextResponse.json(
          { error: "Pergunta da entrevista ausente." },
          { status: 400 }
        );
      }
      const kb = formatKnowledgeForPrompt(
        retrieveKnowledge(`${profile.dificuldade} ${question.foco}`, "entrevista")
      );
      const data = await runLlm(
        buildEvaluationPrompt(profile, question, body.answer || "", kb)
      );
      return NextResponse.json({ mode: "llm", data });
    }

    return NextResponse.json({ error: "Ação desconhecida." }, { status: 400 });
  } catch (err) {
    // Chave inválida / sem permissão (401/403) → mesma orientação amigável.
    if (err instanceof LlmError && err.isAuthError) {
      return notConfigured();
    }
    // Demais falhas da IA real: retornar erro claro.
    const message =
      err instanceof Error ? err.message : "Falha ao chamar a IA real.";
    return NextResponse.json(
      { error: `A IA real falhou: ${message}`, code: "LLM_ERROR" },
      { status: 502 }
    );
  }
}
