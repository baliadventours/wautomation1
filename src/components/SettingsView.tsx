import React, { useState } from 'react';
import { Tenant } from '../types';
import { Settings, Shield, Clock, Users, Bell, Key, Check } from 'lucide-react';

interface SettingsViewProps {
  tenant: Tenant;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ tenant }) => {
  const [minDelay, setMinDelay] = useState(2.5);
  const [typingSimulation, setTypingSimulation] = useState(true);
  const [officeHoursEnabled, setOfficeHoursEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Workspace & Anti-Ban Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure multi-tenant pacing, agent roles, and automated presence states for {tenant.name}.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Anti-Ban & Pacing Guard */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-neutral-900">WhatsApp Anti-Ban Pacing & Jitter</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-neutral-700 mb-1">
                <span>Minimum Delay Between Outbound Messages</span>
                <span className="font-mono text-emerald-600 font-bold">{minDelay} seconds</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={minDelay}
                onChange={(e) => setMinDelay(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Injects randomized human jitter (±0.8s) into BullMQ queues to prevent WhatsApp multi-device rate limiting.
              </p>
            </div>

            <label className="flex items-center gap-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={typingSimulation}
                onChange={(e) => setTypingSimulation(e.target.checked)}
                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-neutral-800 block">Simulate "Typing..." Status</span>
                <span className="text-[11px] text-neutral-500">
                  Broadcasts WhatsApp presence state (<code className="font-mono">composing</code>) 1.5 seconds prior to message delivery.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Business Schedule */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Clock className="w-4 h-4 text-neutral-600" />
            <h3 className="font-bold text-sm text-neutral-900">Operating Schedule & Auto-Responder</h3>
          </div>

          <label className="flex items-center gap-3 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={officeHoursEnabled}
              onChange={(e) => setOfficeHoursEnabled(e.target.checked)}
              className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-neutral-800 block">Enforce Business Hours (08:00 - 21:00 WITA)</span>
              <span className="text-[11px] text-neutral-500">
                Outside of these hours, automatically trigger the After-Hours AI Concierge workflow for incoming chats.
              </span>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            {saved ? 'Settings Saved' : 'Save Workspace Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
