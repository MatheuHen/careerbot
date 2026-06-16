"use client";

import type { ResumeResult } from "@/lib/types";

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        {title}
      </h4>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {children}
      </p>
    </div>
  );
}

function formatText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => formatText(item))
      .filter(Boolean)
      .join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${formatText(item)}`)
      .join("\n");
  }
  if (value == null) return "";
  return String(value);
}

export function resumeToPlainText(r: ResumeResult, nome: string): string {
  return [
    nome ? nome.toUpperCase() : "CURRÍCULO",
    "",
    "RESUMO PROFISSIONAL",
    formatText(r.resumo),
    "",
    "OBJETIVO",
    formatText(r.objetivo),
    "",
    "FORMAÇÃO",
    formatText(r.formacao),
    "",
    "EXPERIÊNCIAS",
    formatText(r.experiencias),
    "",
    "CURSOS",
    formatText(r.cursos),
    "",
    "HABILIDADES",
    formatText(r.habilidades)
  ].join("\n");
}

export default function ResumeView({ resume }: { resume: ResumeResult }) {
  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="rounded-xl bg-brand-50 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Análise do perfil
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-brand-900">
          {formatText(resume.analise)}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field title="Resumo profissional">{formatText(resume.resumo)}</Field>
        <Field title="Objetivo profissional">{formatText(resume.objetivo)}</Field>
        <Field title="Formação">{formatText(resume.formacao)}</Field>
        <Field title="Experiências">{formatText(resume.experiencias)}</Field>
        <Field title="Cursos">{formatText(resume.cursos)}</Field>
        <Field title="Habilidades">{formatText(resume.habilidades)}</Field>
      </div>

      <div className="rounded-xl border border-dashed border-brand-200 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Dicas de melhoria
        </h4>
        <ul className="mt-2 space-y-1.5">
          {resume.dicas.map((dica, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="text-brand-500">•</span>
              <span>{dica}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
