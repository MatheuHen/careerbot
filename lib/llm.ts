type LlmMessages = { system: string; user: string };

type LlmConfig = {
  apiKey: string;
  model: string;
};

// Erro de chamada ao LLM real. `status` é o HTTP do provedor (ex.: 401/403
// indicam chave inválida/sem permissão).
export class LlmError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "LlmError";
    this.status = status;
  }
  // Chave inválida, ausente ou sem permissão.
  get isAuthError(): boolean {
    if (this.status === 401 || this.status === 403) return true;
    return /api[_ ]?key|invalid[_ ]?api[_ ]?key|unauthorized|unauthenticated/i.test(
      this.message
    );
  }
}

const OPENAI_PROVIDER = "openai";
const OPENAI_MODEL = "gpt-4o-mini";

// Valores que NÃO contam como chave válida (vazio, placeholders, "undefined").
const INVALID_KEYS = new Set([
  "",
  "undefined",
  "openai_api_key_informada_abaixo",
  "cole_sua_chave_da_openai_aqui",
  "cole_sua_chave_da_openai_aqui_no_env_local",
  "cole_sua_chave_do_gemini_aqui",
  "cole_sua_chave_aqui"
]);

// Lê a configuração a cada chamada (lazy) para que o .env.local seja
// considerado de forma confiável assim que a chave for adicionada.
function getConfig(): LlmConfig {
  const provider = (process.env.LLM_PROVIDER || OPENAI_PROVIDER).toLowerCase();
  return {
    apiKey: (process.env.LLM_API_KEY || "").trim(),
    model: provider === OPENAI_PROVIDER ? process.env.LLM_MODEL || OPENAI_MODEL : ""
  };
}

// Verdadeiro só quando a configuração usa OpenAI e há uma chave real.
export function isLlmConfigured(): boolean {
  const provider = (process.env.LLM_PROVIDER || OPENAI_PROVIDER).toLowerCase();
  const key = getConfig().apiKey;
  if (provider !== OPENAI_PROVIDER) return false;
  return key.length > 0 && !INVALID_KEYS.has(key.toLowerCase());
}

function extractJson(raw: string): any {
  // Remove cercas de markdown (```json ... ```) que alguns modelos
  // adicionam mesmo pedindo resposta em JSON.
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new LlmError("Resposta da IA sem JSON válido.");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callOpenAi(
  cfg: LlmConfig,
  { system, user }: LlmMessages
): Promise<string> {
  const url = "https://api.openai.com/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.apiKey}`
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });

  if (!res.ok) {
    throw new LlmError(
      `OpenAI respondeu ${res.status}: ${await res.text()}`,
      res.status
    );
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

export async function runLlm(messages: LlmMessages): Promise<any> {
  const cfg = getConfig();
  return extractJson(await callOpenAi(cfg, messages));
}
