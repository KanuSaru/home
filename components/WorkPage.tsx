"use client";

import { work, type Line } from "@/content/work";
import { useT } from "@/lib/i18n";
import { MaskField } from "@/components/MaskField";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function Timeline({ lines }: { lines: Line[] }) {
  const t = useT();
  return (
    <ul className="timeline">
      {lines.map((l) => (
        <li key={(typeof l.when === "string" ? l.when : l.when.en) + l.title.en}>
          <span className="when">{typeof l.when === "string" ? l.when : t(l.when)}</span>
          <div className="tl-body">
            <p className="tl-title">
              {l.href ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {t(l.title)}
                </a>
              ) : (
                t(l.title)
              )}
            </p>
            {l.detail && <p className="small muted">{t(l.detail)}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, wide, children }: { title: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <section className={`panel ${wide ? "wide" : ""}`}>
      <h2 className="panel-title">{title}</h2>
      {children}
    </section>
  );
}

export function WorkPage() {
  const t = useT();
  const cvs = (["research", "industry"] as const).filter((k) => work.cv[k]);

  return (
    <>
      <header className="page-head">
        <h1>{t(work.title)}</h1>
        <p>{t(work.lede)}</p>
        {cvs.length > 0 && (
          <p className="cv-links">
            {cvs.map((k) => (
              <a key={k} className="cv-button" href={`${BASE}/cv/${work.cv[k]}`} download>
                {t(work.cvLabels[k])}
                <span className="tag">{t(work.cvLabels.note)}</span>
              </a>
            ))}
          </p>
        )}
      </header>

      <div className="mosaic">
        <section className="panel wide research">
          <div className="research-text">
            <h2 className="panel-title">{t(work.research.title)}</h2>
            <p>{t(work.research.where)}</p>
            <Timeline lines={work.research.lines} />
            <p className="small muted">{t(work.research.elite)}</p>
          </div>
          <MaskField note={t(work.research.mask)} noteTouch={t(work.research.maskTouch)} />
        </section>

        <Panel title={t(work.publications.title)} wide>
          <Timeline lines={work.publications.lines} />
        </Panel>

        <Panel title={t(work.talks.title)}>
          <Timeline lines={work.talks.lines} />
        </Panel>

        <Panel title={t(work.teaching.title)}>
          <Timeline lines={work.teaching.lines} />
        </Panel>

        <Panel title={t(work.projects.title)} wide>
          <Timeline lines={work.projects.lines} />
        </Panel>

        <Panel title={t(work.leadership.title)}>
          <Timeline lines={work.leadership.lines} />
        </Panel>

        <Panel title={t(work.awards.title)}>
          <Timeline lines={work.awards.lines} />
        </Panel>

        <Panel title={t(work.education.title)} wide>
          <div className="edu">
            <p className="tl-title">{t(work.education.degree)}</p>
            <p className="small muted">{t(work.education.school)}</p>
            <ul className="edu-notes">
              {work.education.notes.map((n) => (
                <li key={n.en}>{t(n)}</li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </>
  );
}
