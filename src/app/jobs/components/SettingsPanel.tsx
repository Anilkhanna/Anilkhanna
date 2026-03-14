'use client';

import { useState, useEffect } from 'react';
import type { ProfileConfig, TargetRole, RolePriority } from '@/lib/jobs/types';

interface SettingsPanelProps {
  onClose: () => void;
}

const inputClass =
  'w-full bg-[#112240] border border-[#1d2d50] rounded-md px-3 py-2 text-sm text-[#ccd6f6] placeholder-[#4a5568] focus:outline-none focus:border-[#64ffda]';

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [config, setConfig] = useState<ProfileConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/jobs/config')
      .then((r) => r.json())
      .then((data) => setConfig(data.config))
      .catch(() => setError('Failed to load config'));
  }, []);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/jobs/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_roles: config.target_roles,
          primary_skills: config.primary_skills,
          secondary_skills: config.secondary_skills,
          negative_keywords: config.negative_keywords,
          location_prefs: config.location_prefs,
          weights: config.weights,
          min_score: config.min_score,
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setConfig(data.config);
    } catch {
      setError('Failed to save config');
    } finally {
      setSaving(false);
    }
  }

  function updateSkillsList(field: 'primary_skills' | 'secondary_skills' | 'negative_keywords', value: string) {
    if (!config) return;
    setConfig({
      ...config,
      [field]: value.split(',').map((s) => s.trim()).filter(Boolean),
    });
  }

  function updateRole(index: number, key: keyof TargetRole, value: string) {
    if (!config) return;
    const roles = [...config.target_roles];
    roles[index] = { ...roles[index], [key]: value };
    setConfig({ ...config, target_roles: roles });
  }

  function addRole() {
    if (!config) return;
    setConfig({
      ...config,
      target_roles: [...config.target_roles, { role: '', priority: 'medium' as RolePriority }],
    });
  }

  function removeRole(index: number) {
    if (!config) return;
    setConfig({
      ...config,
      target_roles: config.target_roles.filter((_, i) => i !== index),
    });
  }

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#0a0f1c] border border-[#1d2d50] rounded-lg p-6 text-[#8892b0]">
          {error || 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0f1c] border border-[#1d2d50] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0a0f1c] border-b border-[#1d2d50] p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#ccd6f6]">Profile Settings</h2>
          <button onClick={onClose} className="text-[#8892b0] hover:text-[#ccd6f6]">✕</button>
        </div>

        <div className="p-4 space-y-6">
          {/* Target Roles */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Target Roles</label>
            {config.target_roles.map((role, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className={`${inputClass} flex-1`} value={role.role} onChange={(e) => updateRole(i, 'role', e.target.value)} placeholder="Role title" />
                <select className={inputClass + ' w-28'} value={role.priority} onChange={(e) => updateRole(i, 'priority', e.target.value)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button onClick={() => removeRole(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
              </div>
            ))}
            <button onClick={addRole} className="text-xs text-[#64ffda] hover:underline">+ Add Role</button>
          </div>

          {/* Primary Skills */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Primary Skills (comma-separated)</label>
            <input className={inputClass} value={config.primary_skills.join(', ')} onChange={(e) => updateSkillsList('primary_skills', e.target.value)} />
          </div>

          {/* Secondary Skills */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Secondary Skills (comma-separated)</label>
            <input className={inputClass} value={config.secondary_skills.join(', ')} onChange={(e) => updateSkillsList('secondary_skills', e.target.value)} />
          </div>

          {/* Negative Keywords */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Negative Keywords (comma-separated)</label>
            <input className={inputClass} value={config.negative_keywords.join(', ')} onChange={(e) => updateSkillsList('negative_keywords', e.target.value)} />
          </div>

          {/* Location Preferences */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Location Preferences</label>
            <div className="space-y-2">
              {(['munich_onsite', 'hybrid_germany', 'remote'] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm text-[#ccd6f6]">
                  <input type="checkbox" checked={config.location_prefs[key]} onChange={(e) => setConfig({ ...config, location_prefs: { ...config.location_prefs, [key]: e.target.checked } })} className="accent-[#64ffda]" />
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
              ))}
            </div>
          </div>

          {/* Scoring Weights */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Scoring Weights</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(config.weights) as [string, number][]).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <label className="text-xs text-[#8892b0] flex-1">{key.replace(/_/g, ' ')}</label>
                  <input type="number" className={inputClass + ' w-20 text-right'} value={value} onChange={(e) => setConfig({ ...config, weights: { ...config.weights, [key]: parseInt(e.target.value, 10) || 0 } })} />
                </div>
              ))}
            </div>
          </div>

          {/* Min Score */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Minimum Score Threshold</label>
            <input type="number" className={inputClass + ' w-24'} value={config.min_score} onChange={(e) => setConfig({ ...config, min_score: parseInt(e.target.value, 10) || 0 })} min={0} max={100} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button onClick={handleSave} disabled={saving} className="w-full py-2 rounded-md bg-[#64ffda] text-[#0a0a0a] font-medium hover:bg-[#64ffda]/90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
