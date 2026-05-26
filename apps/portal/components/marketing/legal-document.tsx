import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { LegalParagraph, LegalSection } from "@/lib/legal/types";

function renderParagraph(paragraph: LegalParagraph, key: number) {
  if (typeof paragraph === "string") {
    return (
      <p key={key} className="mb-4 leading-relaxed text-slate-700">
        {paragraph}
      </p>
    );
  }

  const { text, links = [] } = paragraph;
  if (links.length === 0) {
    return (
      <p key={key} className="mb-4 leading-relaxed text-slate-700">
        {text}
      </p>
    );
  }

  const parts: ReactNode[] = [];
  let remaining = text;

  for (const link of links) {
    const index = remaining.indexOf(link.match);
    if (index === -1) continue;

    if (index > 0) {
      parts.push(remaining.slice(0, index));
    }

    parts.push(
      <Link
        key={`${key}-${link.match}`}
        href={link.href}
        className="font-medium text-emerald-500 hover:text-emerald-600"
      >
        {link.match}
      </Link>,
    );

    remaining = remaining.slice(index + link.match.length);
  }

  if (remaining) {
    parts.push(remaining);
  }

  return (
    <p key={key} className="mb-4 leading-relaxed text-slate-700">
      {parts}
    </p>
  );
}

function renderList(items: string[]) {
  return (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalDocument({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="prose prose-slate mt-10 max-w-none">
      {sections.map((section) => (
        <section key={section.title} id={section.id} className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">{section.title}</h2>

          {section.paragraphs?.map((paragraph, index) => renderParagraph(paragraph, index))}
          {section.list && renderList(section.list)}

          {section.subsections?.map((subsection) => (
            <div key={subsection.title} className="mb-6">
              <h3 className="mb-3 text-xl font-semibold text-slate-800">{subsection.title}</h3>
              {subsection.paragraphs?.map((paragraph, index) =>
                renderParagraph(paragraph, index),
              )}
              {subsection.list && renderList(subsection.list)}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
