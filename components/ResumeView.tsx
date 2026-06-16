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

export function resumeToPlainText(r: ResumeResult, nome: string): string {
  return [
    nome ? nome.toUpperCase() : "CURRÍCULO",
    "",
    "RESUMO PROFISSIONAL",
    r.resumo,
    "",
    "OBJETIVO",
    r.objetivo,
    "",
    "FORMAÇÃO",
    r.formacao,
    "",
    "EXPERIÊNCIAS",
    r.experiencias,
    "",
    "CURSOS",
    r.cursos,
    "",
    "HABILIDADES",
    r.habilidades
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
          {resume.analise}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field title="Resumo profissional">{resume.resumo}</Field>
        <Field title="Objetivo profissional">{resume.objetivo}</Field>
        <Field title="Formação">{resume.formacao}</Field>
        <Field title="Experiências">{resume.experiencias}</Field>
        <Field title="Cursos">{resume.cursos}</Field>
        <Field title="Habilidades">{resume.habilidades}</Field>
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
