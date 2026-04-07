'use client';
import React from 'react';
import { getFileGitHub, saveFileGitHub } from '@/app/actions/admin';
import { Save, Check, AlertCircle, Plus, Trash2, Globe, User, Wrench, Wifi } from 'lucide-react';

type Tab = 'general' | 'about' | 'uses' | 'availability';

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

  return (
    <div className="space-y-6">
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
    </div>
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

// ── Main settings page ─────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('general');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Globe size={15} /> },
    { id: 'availability', label: 'Availability', icon: <Wifi size={15} /> },
    { id: 'about', label: 'About & CV', icon: <User size={15} /> },
    { id: 'uses', label: 'Uses / Setup', icon: <Wrench size={15} /> },
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
        {tab === 'general' && <GeneralTab />}
        {tab === 'availability' && <AvailabilityTab />}
        {tab === 'about' && <AboutTab />}
        {tab === 'uses' && <UsesTab />}
      </div>
    </div>
  );
}
