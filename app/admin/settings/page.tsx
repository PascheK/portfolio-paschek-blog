'use client';
import React from 'react';
import { getFileGitHub, saveFileGitHub } from '@/app/actions/admin';
import { Save, Check, AlertCircle, Plus, Trash2, Globe, User, Wrench, Wifi, Clock, GitBranch } from 'lucide-react';

type Tab = 'general' | 'about' | 'uses' | 'availability' | 'now' | 'timeline';
type AboutSubTab = 'cv' | 'timeline';


// ── Helpers ────────────────────────────────────────────────────────────────
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
      />
    </div>
  );
}

// ── Save button ────────────────────────────────────────────────────────────
function SaveButton({
  onSave,
  status,
}: {
  onSave: () => void;
  status: 'idle' | 'saving' | 'saved' | 'error';
}) {
  return (
    <button
      onClick={onSave}
      disabled={status === 'saving'}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        status === 'saved'
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : status === 'error'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30'
      }`}
    >
      {status === 'saving' ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : status === 'saved' ? (
        <Check size={15} />
      ) : status === 'error' ? (
        <AlertCircle size={15} />
      ) : (
        <Save size={15} />
      )}
      {status === 'saving'
        ? 'Saving…'
        : status === 'saved'
          ? 'Saved!'
          : status === 'error'
            ? 'Error'
            : 'Save changes'}
    </button>
  );
}

// ── General Tab ────────────────────────────────────────────────────────────
function GeneralTab() {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = React.useState(true);
  const [fields, setFields] = React.useState({
    baseUrl: '',
    title: '',
    name: '',
    description: '',
    ogImage: '',
    github: '',
    instagram: '',
    email: '',
    telephone: '',
  });

  React.useEffect(() => {
    getFileGitHub('lib/config.ts')
      .then(({ content }) => {
        const get = (key: string) => {
          const m = content.match(new RegExp(`${key}:\\s*["'\`]([^"'\`]*)["'\`]`));
          return m ? m[1] : '';
        };
        setFields({
          baseUrl: get('baseUrl'),
          title: get('title'),
          name: get('name'),
          description: get('description'),
          ogImage: get('ogImage'),
          github: get('github'),
          instagram: get('instagram'),
          email: get('email'),
          telephone: get('telephone'),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setStatus('saving');
    try {
      const { sha: currentSha } = await getFileGitHub('lib/config.ts');
      const newContent = `export const metaData = {
  baseUrl: "${fields.baseUrl}",
  title: "${fields.title}",
  name: "${fields.name}",
  ogImage: "${fields.ogImage}",
  description:
    "${fields.description}",
};

export const socialLinks = {
  github: "${fields.github}",
  instagram: "${fields.instagram}",
  email: "${fields.email}",
  telephone: "${fields.telephone}",
};

export const availability = {
  available: true,         // set to false to hide the badge
  labelEn: "Open to work",
  labelFr: "Disponible",
};
`;
      await saveFileGitHub('lib/config.ts', newContent, currentSha);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (e) {
      console.error(e);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Site metadata</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Site title"
              value={fields.title}
              onChange={(v) => setFields((f) => ({ ...f, title: v }))}
              placeholder="My Portfolio"
            />
            <Input
              label="Your name"
              value={fields.name}
              onChange={(v) => setFields((f) => ({ ...f, name: v }))}
              placeholder="John Doe"
            />
          </div>
          <Input
            label="Base URL"
            value={fields.baseUrl}
            onChange={(v) => setFields((f) => ({ ...f, baseUrl: v }))}
            placeholder="https://example.com/"
          />
          <Textarea
            label="Description"
            value={fields.description}
            onChange={(v) => setFields((f) => ({ ...f, description: v }))}
            rows={2}
          />
          <Input
            label="OG Image path"
            value={fields.ogImage}
            onChange={(v) => setFields((f) => ({ ...f, ogImage: v }))}
            placeholder="/og-image.png"
          />
        </div>
      </div>
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Social links</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="GitHub URL"
            value={fields.github}
            onChange={(v) => setFields((f) => ({ ...f, github: v }))}
            placeholder="https://github.com/..."
          />
          <Input
            label="Instagram URL"
            value={fields.instagram}
            onChange={(v) => setFields((f) => ({ ...f, instagram: v }))}
            placeholder="https://instagram.com/..."
          />
          <Input
            label="Email"
            value={fields.email}
            onChange={(v) => setFields((f) => ({ ...f, email: v }))}
            placeholder="mailto:..."
          />
          <Input
            label="Phone"
            value={fields.telephone}
            onChange={(v) => setFields((f) => ({ ...f, telephone: v }))}
            placeholder="tel:+1..."
          />
        </div>
      </div>
      <SaveButton onSave={save} status={status} />
    </div>
  );
}

// ── Availability Tab ───────────────────────────────────────────────────────
function AvailabilityTab() {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = React.useState(true);
  const [available, setAvailable] = React.useState(true);
  const [labelEn, setLabelEn] = React.useState('Open to work');
  const [labelFr, setLabelFr] = React.useState('Disponible');

  React.useEffect(() => {
    getFileGitHub('lib/config.ts')
      .then(({ content }) => {
        const availMatch = content.match(/available:\s*(true|false)/);
        const enMatch = content.match(/labelEn:\s*["']([^"']*)["']/);
        const frMatch = content.match(/labelFr:\s*["']([^"']*)["']/);
        if (availMatch) setAvailable(availMatch[1] === 'true');
        if (enMatch) setLabelEn(enMatch[1]);
        if (frMatch) setLabelFr(frMatch[1]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setStatus('saving');
    try {
      const { content, sha } = await getFileGitHub('lib/config.ts');
      const updated = content
        .replace(/available:\s*(true|false)/, `available: ${available}`)
        .replace(/labelEn:\s*["'][^"']*["']/, `labelEn: "${labelEn}"`)
        .replace(/labelFr:\s*["'][^"']*["']/, `labelFr: "${labelFr}"`);
      await saveFileGitHub('lib/config.ts', updated, sha);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
        <div>
          <div className="font-medium text-sm">Available for work</div>
          <div className="text-xs text-muted-foreground mt-0.5">Shows a badge on your portfolio</div>
        </div>
        <button
          onClick={() => setAvailable((a) => !a)}
          className={`relative w-12 h-6 rounded-full transition-colors ${available ? 'bg-green-500' : 'bg-white/20'}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${available ? 'translate-x-7' : 'translate-x-1'}`}
          />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="English label" value={labelEn} onChange={setLabelEn} placeholder="Open to work" />
        <Input label="French label" value={labelFr} onChange={setLabelFr} placeholder="Disponible" />
      </div>
      <SaveButton onSave={save} status={status} />
    </div>
  );
}

// ── About Tab ──────────────────────────────────────────────────────────────
type DictAny = Record<string, unknown>;

function AboutTab() {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = React.useState(true);
  const [dict, setDict] = React.useState<DictAny | null>(null);
  const [subTab, setSubTab] = React.useState<AboutSubTab>('cv');

  React.useEffect(() => {
    getFileGitHub('app/[lang]/dictionaries/en.json')
      .then(({ content }) => {
        setDict(JSON.parse(content));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setStatus('saving');
    try {
      const { sha } = await getFileGitHub('app/[lang]/dictionaries/en.json');
      await saveFileGitHub(
        'app/[lang]/dictionaries/en.json',
        JSON.stringify(dict, null, 2),
        sha
      );
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!dict) return <div className="text-muted-foreground text-sm">Failed to load dictionary</div>;

  const about = dict.about as DictAny;
  const experiences: DictAny[] = (about?.experiences as DictAny[]) || [];
  const skillCategories: Record<string, string[]> =
    ((about?.skills as DictAny)?.categories as Record<string, string[]>) || {};

  function updateExperiences(updater: (exps: DictAny[]) => DictAny[]) {
    setDict((d) => {
      if (!d) return d;
      const prev = d.about as DictAny;
      return {
        ...d,
        about: {
          ...prev,
          experiences: updater((prev?.experiences as DictAny[]) || []),
        },
      };
    });
  }

  function updateSkillCategories(updater: (cats: Record<string, string[]>) => Record<string, string[]>) {
    setDict((d) => {
      if (!d) return d;
      const prev = d.about as DictAny;
      const prevSkills = prev?.skills as DictAny;
      return {
        ...d,
        about: {
          ...prev,
          skills: {
            ...prevSkills,
            categories: updater((prevSkills?.categories as Record<string, string[]>) || {}),
          },
        },
      };
    });
  }

  // Timeline events in about.timeline.events
  type TEvent = { year: string; startYear: number; type: string; current: boolean; title: string; org: string; location: string; description: string; tags: string[]; url: string; };
  const aboutDict = dict.about as DictAny;
  const timelineEvents: TEvent[] = ((aboutDict?.timeline as DictAny)?.events as TEvent[]) ?? [];
  const TYPE_COLORS: Record<string, string> = { work: 'text-sky-400', education: 'text-violet-400', project: 'text-emerald-400', milestone: 'text-amber-400' };

  function updateTimelineEvents(updater: (evts: TEvent[]) => TEvent[]) {
    setDict((d) => {
      if (!d) return d;
      const about2 = d.about as DictAny;
      const tl = (about2?.timeline as DictAny) ?? {};
      return { ...d, about: { ...about2, timeline: { ...tl, events: updater((tl?.events as TEvent[]) ?? []) } } };
    });
  }

  const newEvent = (): TEvent => ({ year: String(new Date().getFullYear()), startYear: new Date().getFullYear(), type: 'work', current: false, title: '', org: '', location: '', description: '', tags: [], url: '' });

  return (
    <div className="space-y-6">
      {/* Sub-tab selector */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
        {([['cv', 'CV & Skills'], ['timeline', 'Experience Timeline']] as [AboutSubTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${subTab === id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      {subTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{timelineEvents.length} event{timelineEvents.length !== 1 ? 's' : ''}</p>
            <button onClick={() => updateTimelineEvents((evts) => [newEvent(), ...evts])}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 bg-primary/10 rounded-lg px-3 py-1.5 border border-primary/20 transition-colors">
              <Plus size={13} /> Add event
            </button>
          </div>
          {timelineEvents.map((ev, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select value={ev.type} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, type: e.target.value } : v))}
                    className={`bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer ${TYPE_COLORS[ev.type] ?? 'text-foreground'}`}>
                    <option value="work">💼 Work</option>
                    <option value="education">🎓 Education</option>
                    <option value="project">🚀 Project</option>
                    <option value="milestone">⭐ Milestone</option>
                  </select>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={ev.current} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, current: e.target.checked } : v))} className="accent-primary" />
                    Current
                  </label>
                </div>
                <button onClick={() => updateTimelineEvents((evts) => evts.filter((_, j) => j !== i))} className="text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Year label (e.g. 2025 – present)" value={ev.year} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, year: e.target.value } : v))} />
                <input type="number" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Start year" value={ev.startYear} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, startYear: Number(e.target.value) } : v))} />
              </div>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Title" value={ev.title} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, title: e.target.value } : v))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Organization" value={ev.org} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, org: e.target.value } : v))} />
                <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Location" value={ev.location} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, location: e.target.value } : v))} />
              </div>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Description" rows={2} value={ev.description} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, description: e.target.value } : v))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Tags (comma-separated)" value={ev.tags.join(', ')} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } : v))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="URL (optional)" value={ev.url} onChange={(e) => updateTimelineEvents((evts) => evts.map((v, j) => j === i ? { ...v, url: e.target.value } : v))} />
            </div>
          ))}
          <SaveButton onSave={save} status={status} />
        </div>
      )}

      {subTab === 'cv' && <div className="space-y-6">
      {/* Experiences */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Experiences</h3>
          <button
            onClick={() =>
              updateExperiences((exps) => [
                ...exps,
                { period: '', title: '', org: '', description: '', type: 'work' },
              ])
            }
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={13} /> Add experience
          </button>
        </div>
        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">Experience #{i + 1}</span>
                <button
                  onClick={() => updateExperiences((exps) => exps.filter((_, j) => j !== i))}
                  className="text-red-400/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Period"
                  value={(exp.period as string) || ''}
                  onChange={(v) =>
                    updateExperiences((exps) =>
                      exps.map((e, j) => (j === i ? { ...e, period: v } : e))
                    )
                  }
                  placeholder="2023 – Present"
                />
                <Input
                  label="Organization"
                  value={(exp.org as string) || ''}
                  onChange={(v) =>
                    updateExperiences((exps) =>
                      exps.map((e, j) => (j === i ? { ...e, org: v } : e))
                    )
                  }
                  placeholder="Company name"
                />
              </div>
              <Input
                label="Job title"
                value={(exp.title as string) || ''}
                onChange={(v) =>
                  updateExperiences((exps) =>
                    exps.map((e, j) => (j === i ? { ...e, title: v } : e))
                  )
                }
                placeholder="Software Engineer"
              />
              <Textarea
                label="Description"
                value={(exp.description as string) || ''}
                onChange={(v) =>
                  updateExperiences((exps) =>
                    exps.map((e, j) => (j === i ? { ...e, description: v } : e))
                  )
                }
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Skills (by category)</h3>
        <div className="space-y-4">
          {Object.entries(skillCategories).map(([category, skillList]) => (
            <div key={category} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill, si) => (
                  <div key={si} className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5">
                    <input
                      className="bg-transparent text-xs text-white/80 focus:outline-none w-20"
                      value={skill}
                      onChange={(e) =>
                        updateSkillCategories((cats) => ({
                          ...cats,
                          [category]: cats[category].map((s, j) =>
                            j === si ? e.target.value : s
                          ),
                        }))
                      }
                    />
                    <button
                      onClick={() =>
                        updateSkillCategories((cats) => ({
                          ...cats,
                          [category]: cats[category].filter((_, j) => j !== si),
                        }))
                      }
                      className="text-red-400/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    updateSkillCategories((cats) => ({
                      ...cats,
                      [category]: [...cats[category], 'New skill'],
                    }))
                  }
                  className="text-xs text-primary/60 hover:text-primary bg-primary/10 rounded-full px-2 py-0.5 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SaveButton onSave={save} status={status} />
    </div>}</div>
  );
}

// ── Uses Tab ───────────────────────────────────────────────────────────────
type UsesItem = { name: string; desc: string };
type UsesSection = { title: string; items: UsesItem[] };

function UsesTab() {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = React.useState(true);
  const [dict, setDict] = React.useState<DictAny | null>(null);

  React.useEffect(() => {
    getFileGitHub('app/[lang]/dictionaries/en.json')
      .then(({ content }) => {
        setDict(JSON.parse(content));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setStatus('saving');
    try {
      const { sha } = await getFileGitHub('app/[lang]/dictionaries/en.json');
      await saveFileGitHub(
        'app/[lang]/dictionaries/en.json',
        JSON.stringify(dict, null, 2),
        sha
      );
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!dict) return <div className="text-muted-foreground text-sm">Failed to load</div>;

  const usesSections = (dict.uses as DictAny)?.sections as Record<string, UsesSection>;
  const sectionEntries = Object.entries(usesSections || {});

  function updateSectionItems(
    sectionKey: string,
    updater: (items: UsesItem[]) => UsesItem[]
  ) {
    setDict((d) => {
      if (!d) return d;
      const uses = d.uses as DictAny;
      const sections = uses?.sections as Record<string, UsesSection>;
      const section = sections?.[sectionKey];
      return {
        ...d,
        uses: {
          ...uses,
          sections: {
            ...sections,
            [sectionKey]: {
              ...section,
              items: updater(section?.items || []),
            },
          },
        },
      };
    });
  }

  return (
    <div className="space-y-6">
      {sectionEntries.map(([sectionKey, section]) => {
        const items = section?.items || [];
        return (
          <div key={sectionKey}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{section.title || sectionKey}</h3>
              <button
                onClick={() =>
                  updateSectionItems(sectionKey, (its) => [
                    ...its,
                    { name: '', desc: '' },
                  ])
                }
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
              >
                <Plus size={13} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      placeholder="Item name"
                      value={item.name || ''}
                      onChange={(e) =>
                        updateSectionItems(sectionKey, (its) =>
                          its.map((it, j) => (j === i ? { ...it, name: e.target.value } : it))
                        )
                      }
                    />
                    <input
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      placeholder="Description"
                      value={item.desc || ''}
                      onChange={(e) =>
                        updateSectionItems(sectionKey, (its) =>
                          its.map((it, j) => (j === i ? { ...it, desc: e.target.value } : it))
                        )
                      }
                    />
                  </div>
                  <button
                    onClick={() =>
                      updateSectionItems(sectionKey, (its) => its.filter((_, j) => j !== i))
                    }
                    className="text-red-400/40 hover:text-red-400 transition-colors mt-1.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <SaveButton onSave={save} status={status} />
    </div>
  );
}

// ── Now Tab ────────────────────────────────────────────────────────────────
function NowTab() {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = React.useState(true);
  const [langEdit, setLangEdit] = React.useState<'en' | 'fr'>('en');
  const [dictEn, setDictEn] = React.useState<DictAny | null>(null);
  const [dictFr, setDictFr] = React.useState<DictAny | null>(null);

  React.useEffect(() => {
    Promise.all([
      getFileGitHub('app/[lang]/dictionaries/en.json').then(({ content }) => JSON.parse(content)),
      getFileGitHub('app/[lang]/dictionaries/fr.json').then(({ content }) => JSON.parse(content)),
    ]).then(([en, fr]) => { setDictEn(en); setDictFr(fr); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const dict = langEdit === 'en' ? dictEn : dictFr;
  const setDict = langEdit === 'en' ? setDictEn : setDictFr;

  async function save() {
    setStatus('saving');
    try {
      await Promise.all([
        (async () => {
          const { sha } = await getFileGitHub('app/[lang]/dictionaries/en.json');
          await saveFileGitHub('app/[lang]/dictionaries/en.json', JSON.stringify(dictEn, null, 2), sha);
        })(),
        (async () => {
          const { sha } = await getFileGitHub('app/[lang]/dictionaries/fr.json');
          await saveFileGitHub('app/[lang]/dictionaries/fr.json', JSON.stringify(dictFr, null, 2), sha);
        })(),
      ]);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  }

  function updateNow(updater: (n: DictAny) => DictAny) {
    setDict((d) => d ? { ...d, now: updater((d.now as DictAny) ?? {}) } : d);
  }

  if (loading) return <div className="flex items-center justify-center py-12"><span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!dict) return null;

  const now = (dict.now as DictAny) ?? {};
  const status2 = (now.status as DictAny) ?? {};
  const spotlight = (now.spotlight as DictAny) ?? {};
  const project = (spotlight.project as DictAny) ?? {};
  const learning = (spotlight.learningSpotlight as DictAny) ?? {};
  const listening = (now.listening as DictAny) ?? {};
  const openTo: string[] = (now.openTo as string[]) ?? [];
  const ships: DictAny[] = (now.recentShips as DictAny[]) ?? [];

  const updateField = (path: string[], value: unknown) => {
    updateNow((n) => {
      const clone = JSON.parse(JSON.stringify(n));
      let cur: any = clone;
      for (let i = 0; i < path.length - 1; i++) {
        if (!cur[path[i]]) cur[path[i]] = {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = value;
      return clone;
    });
  };

  return (
    <div className="space-y-6">
      {/* Lang toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
        {(['en', 'fr'] as const).map((l) => (
          <button key={l} onClick={() => setLangEdit(l)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${langEdit === l ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {l === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
        ))}
      </div>

      {/* Meta */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Page meta</h3>
        <div className="grid grid-cols-1 gap-3">
          <Input label="Title" value={(now.title as string) ?? ''} onChange={(v) => updateField(['title'], v)} placeholder="Now" />
          <Input label="Subtitle" value={(now.subtitle as string) ?? ''} onChange={(v) => updateField(['subtitle'], v)} placeholder="A snapshot of what I am up to…" />
          <Input label="Updated label" value={(now.updated as string) ?? ''} onChange={(v) => updateField(['updated'], v)} placeholder="Last updated April 2026" />
          <Input label="Coffee label" value={(now.coffeeLabel as string) ?? ''} onChange={(v) => updateField(['coffeeLabel'], v)} placeholder="Coffee: active" />
        </div>
      </div>

      {/* Status chips */}
      <div className="border-t border-white/5 pt-5 space-y-3">
        <h3 className="text-sm font-semibold">Status chips</h3>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Mode" value={(status2.mode as string) ?? ''} onChange={(v) => updateField(['status', 'mode'], v)} placeholder="Building" />
          <Input label="Location" value={(status2.location as string) ?? ''} onChange={(v) => updateField(['status', 'location'], v)} placeholder="France" />
          <Input label="Timezone" value={(status2.timezone as string) ?? ''} onChange={(v) => updateField(['status', 'timezone'], v)} placeholder="CET / UTC+2" />
        </div>
      </div>

      {/* Spotlight */}
      <div className="border-t border-white/5 pt-5 space-y-4">
        <h3 className="text-sm font-semibold">Spotlight — Main project</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Project name" value={(project.name as string) ?? ''} onChange={(v) => updateField(['spotlight', 'project', 'name'], v)} placeholder="my-project" />
          <Input label="Project URL" value={(project.url as string) ?? ''} onChange={(v) => updateField(['spotlight', 'project', 'url'], v)} placeholder="https://github.com/…" />
        </div>
        <Textarea label="Description" value={(project.desc as string) ?? ''} onChange={(v) => updateField(['spotlight', 'project', 'desc'], v)} rows={2} />
        <Input label="Tags (comma-separated)" value={((project.tags as string[]) ?? []).join(', ')} onChange={(v) => updateField(['spotlight', 'project', 'tags'], v.split(',').map((s: string) => s.trim()).filter(Boolean))} placeholder="Next.js, TypeScript, Tailwind" />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Spotlight — Learning</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="What you're learning" value={(learning.name as string) ?? ''} onChange={(v) => updateField(['spotlight', 'learningSpotlight', 'name'], v)} placeholder="Rust" />
          <Input label="Progress (0-100)" type="number" value={String((learning.progress as number) ?? 0)} onChange={(v) => updateField(['spotlight', 'learningSpotlight', 'progress'], Number(v))} placeholder="35" />
        </div>
        <Textarea label="Description" value={(learning.desc as string) ?? ''} onChange={(v) => updateField(['spotlight', 'learningSpotlight', 'desc'], v)} rows={2} />
      </div>

      {/* Listening */}
      <div className="border-t border-white/5 pt-5 space-y-3">
        <h3 className="text-sm font-semibold">Currently listening</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Track" value={(listening.track as string) ?? ''} onChange={(v) => updateField(['listening', 'track'], v)} placeholder="Eventually" />
          <Input label="Artist" value={(listening.artist as string) ?? ''} onChange={(v) => updateField(['listening', 'artist'], v)} placeholder="Tame Impala" />
          <Input label="Album" value={(listening.album as string) ?? ''} onChange={(v) => updateField(['listening', 'album'], v)} placeholder="Currents" />
          <Input label="Progress (0-100)" type="number" value={String((listening.progress as number) ?? 0)} onChange={(v) => updateField(['listening', 'progress'], Number(v))} placeholder="63" />
        </div>
      </div>

      {/* Open to */}
      <div className="border-t border-white/5 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Open to</h3>
          <button onClick={() => updateField(['openTo'], [...openTo, ''])} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {openTo.map((tag, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                value={tag} placeholder="e.g. Freelance missions"
                onChange={(e) => updateField(['openTo'], openTo.map((t, j) => j === i ? e.target.value : t))} />
              <button onClick={() => updateField(['openTo'], openTo.filter((_, j) => j !== i))} className="text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Recently shipped */}
      <div className="border-t border-white/5 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recently shipped</h3>
          <button onClick={() => updateField(['recentShips'], [...ships, { label: '', date: '' }])} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {ships.map((ship, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                value={(ship.label as string) ?? ''} placeholder="What you shipped"
                onChange={(e) => updateField(['recentShips'], ships.map((s, j) => j === i ? { ...s, label: e.target.value } : s))} />
              <input className="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                value={(ship.date as string) ?? ''} placeholder="Apr 2026"
                onChange={(e) => updateField(['recentShips'], ships.map((s, j) => j === i ? { ...s, date: e.target.value } : s))} />
              <button onClick={() => updateField(['recentShips'], ships.filter((_, j) => j !== i))} className="text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <SaveButton onSave={save} status={status} />
    </div>
  );
}

// ── Timeline Tab ───────────────────────────────────────────────────────────
type EventType = 'work' | 'education' | 'project' | 'milestone';
interface TEvent { year: string; startYear: number; type: EventType; current: boolean; title: string; org: string; location: string; description: string; tags: string[]; url: string; }

function TimelineTab() {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = React.useState(true);
  const [langEdit, setLangEdit] = React.useState<'en' | 'fr'>('en');
  const [dictEn, setDictEn] = React.useState<DictAny | null>(null);
  const [dictFr, setDictFr] = React.useState<DictAny | null>(null);

  React.useEffect(() => {
    Promise.all([
      getFileGitHub('app/[lang]/dictionaries/en.json').then(({ content }) => JSON.parse(content)),
      getFileGitHub('app/[lang]/dictionaries/fr.json').then(({ content }) => JSON.parse(content)),
    ]).then(([en, fr]) => { setDictEn(en); setDictFr(fr); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const dict = langEdit === 'en' ? dictEn : dictFr;
  const setDict = langEdit === 'en' ? setDictEn : setDictFr;

  async function save() {
    setStatus('saving');
    try {
      await Promise.all([
        (async () => { const { sha } = await getFileGitHub('app/[lang]/dictionaries/en.json'); await saveFileGitHub('app/[lang]/dictionaries/en.json', JSON.stringify(dictEn, null, 2), sha); })(),
        (async () => { const { sha } = await getFileGitHub('app/[lang]/dictionaries/fr.json'); await saveFileGitHub('app/[lang]/dictionaries/fr.json', JSON.stringify(dictFr, null, 2), sha); })(),
      ]);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  }

  const events: TEvent[] = ((dict?.timeline as DictAny)?.events as TEvent[]) ?? [];

  function updateEvents(updater: (evts: TEvent[]) => TEvent[]) {
    setDict((d) => d ? { ...d, timeline: { ...((d.timeline as DictAny) ?? {}), events: updater(((d.timeline as DictAny)?.events as TEvent[]) ?? []) } } : d);
  }

  const newEvent = (): TEvent => ({ year: String(new Date().getFullYear()), startYear: new Date().getFullYear(), type: 'work', current: false, title: '', org: '', location: '', description: '', tags: [], url: '' });

  if (loading) return <div className="flex items-center justify-center py-12"><span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const TYPE_COLORS: Record<EventType, string> = { work: 'text-sky-400', education: 'text-violet-400', project: 'text-emerald-400', milestone: 'text-amber-400' };

  return (
    <div className="space-y-6">
      {/* Lang toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
        {(['en', 'fr'] as const).map((l) => (
          <button key={l} onClick={() => setLangEdit(l)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${langEdit === l ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {l === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        <button onClick={() => updateEvents((evts) => [newEvent(), ...evts])} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 bg-primary/10 rounded-lg px-3 py-1.5 border border-primary/20 transition-colors">
          <Plus size={13} /> Add event
        </button>
      </div>

      <div className="space-y-3">
        {events.map((ev, i) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select value={ev.type} onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, type: e.target.value as EventType } : v))}
                  className={`bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer ${TYPE_COLORS[ev.type]}`}>
                  <option value="work">💼 Work</option>
                  <option value="education">🎓 Education</option>
                  <option value="project">🚀 Project</option>
                  <option value="milestone">⭐ Milestone</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={ev.current} onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, current: e.target.checked } : v))}
                    className="accent-primary" />
                  Current
                </label>
              </div>
              <button onClick={() => updateEvents((evts) => evts.filter((_, j) => j !== i))} className="text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Year label (e.g. 2025 – present)" value={ev.year}
                onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, year: e.target.value } : v))} />
              <input type="number" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Start year (for sorting)" value={ev.startYear}
                onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, startYear: Number(e.target.value) } : v))} />
            </div>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Title" value={ev.title}
              onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, title: e.target.value } : v))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Organization" value={ev.org}
                onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, org: e.target.value } : v))} />
              <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Location" value={ev.location}
                onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, location: e.target.value } : v))} />
            </div>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Description" rows={2} value={ev.description}
              onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, description: e.target.value } : v))} />
            <div className="grid grid-cols-1 gap-2">
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Tags (comma-separated)" value={ev.tags.join(', ')}
                onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } : v))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="URL (optional)" value={ev.url}
                onChange={(e) => updateEvents((evts) => evts.map((v, j) => j === i ? { ...v, url: e.target.value } : v))} />
            </div>
          </div>
        ))}
      </div>

      <SaveButton onSave={save} status={status} />
    </div>
  );
}

// ── Main settings page ─────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('general');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Globe size={15} /> },
    { id: 'availability', label: 'Availability', icon: <Wifi size={15} /> },
    { id: 'about', label: 'About & CV', icon: <User size={15} /> },
    { id: 'uses', label: 'Uses / Setup', icon: <Wrench size={15} /> },
    { id: 'now', label: 'Now', icon: <Clock size={15} /> },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your site content and configuration
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-primary/20 text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-surface/40 p-6">
        {tab === 'general'      && <GeneralTab />}
        {tab === 'availability' && <AvailabilityTab />}
        {tab === 'about'        && <AboutTab />}
        {tab === 'uses'         && <UsesTab />}
        {tab === 'now'          && <NowTab />}
      </div>
    </div>
  );
}
