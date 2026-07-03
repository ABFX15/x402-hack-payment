"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * CodeBlock - a colorful, copyable code snippet with a little window chrome.
 * Lightweight syntax highlighting (HTML + JS) done with one tokenizer pass and
 * rendered as colored spans (React-escaped, no dangerouslySetInnerHTML, no dep).
 */

const PALETTE = {
  comment: "#8b949e",
  string: "#a5d6ff",
  keyword: "#ff7b72",
  number: "#79c0ff",
  tag: "#7ee787",
  attr: "#d2a8ff",
  fn: "#d2a8ff",
  def: "#e6edf3",
};

const TOKEN =
  /(<!--[\s\S]*?-->|\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:const|let|var|await|async|import|from|function|return|new|true|false|null|export|default)\b)|(\b\d+(?:\.\d+)?\b)|(<\/?[a-zA-Z][\w-]*|\/?>)|([a-zA-Z_$][\w$-]*)(?=\s*[=(])/g;

function tokenize(code: string): { t: string; c: string }[] {
  const out: { t: string; c: string }[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    if (m.index > last) out.push({ t: code.slice(last, m.index), c: PALETTE.def });
    const c = m[1]
      ? PALETTE.comment
      : m[2]
        ? PALETTE.string
        : m[3]
          ? PALETTE.keyword
          : m[4]
            ? PALETTE.number
            : m[5]
              ? PALETTE.tag
              : PALETTE.fn;
    out.push({ t: m[0], c });
    last = TOKEN.lastIndex;
  }
  if (last < code.length) out.push({ t: code.slice(last), c: PALETTE.def });
  return out;
}

export function CodeBlock({
  code,
  filename,
}: {
  code: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);
  const tokens = useMemo(() => tokenize(code), [code]);

  return (
    <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between border-b border-[#21262d] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          {filename && (
            <span className="ml-2 font-mono text-[12px] text-[#8b949e]">
              {filename}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-[#8b949e] transition-colors hover:bg-[#21262d] hover:text-[#e6edf3]"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-[#27c93f]" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code>
          {tokens.map((tok, i) => (
            <span key={i} style={{ color: tok.c }}>
              {tok.t}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
