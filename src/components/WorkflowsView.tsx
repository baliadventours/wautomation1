import React, { useState } from 'react';
import { WorkflowRule } from '../types';
import { 
  Workflow, 
  Play, 
  CheckCircle2, 
  Plus, 
  Zap, 
  Filter, 
  ArrowRight, 
  Send, 
  Clock, 
  Sparkles,
  Bot,
  MessageSquare,
  ShieldCheck,
  Radio,
  CornerDownLeft
} from 'lucide-react';

interface WorkflowsViewProps {
  workflows: WorkflowRule[];
  onToggleWorkflow: (id: string) => void;
  onAddWorkflow: (rule: WorkflowRule) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  workflows,
  onToggleWorkflow,
  onAddWorkflow,
}) => {
  const [activeSimulationLog, setActiveSimulationLog] = useState<{
    workflowName: string;
    steps: { text: string; status: 'done' | 'pending' | 'active' }[];
  } | null>(null);

  // Chatbot Sandbox State
  const [sandboxInput, setSandboxInput] = useState('PRICE');
  const [sandboxLog, setSandboxLog] = useState<{
    inboundText: string;
    matchedRule: string;
    botReply: string;
    complianceNote?: string;
  } | null>({
    inboundText: 'PRICE',
    matchedRule: 'Rule #2: Tour Catalog & Price Inquiry',
    botReply: '🌴 *BALI ADVENTOURS — EXPEDITION PACKAGES*\n\n1. 🌋 *Mount Batur Sunrise Trekking & Hot Springs* — $90 USD/pax\n2. 🏝️ *Nusa Penida Manta Snorkeling & West Coast* — $110 USD/pax\n3. 🐒 *Ubud Jungle Swing & Tegenungan Waterfall* — $65 USD/pax\n4. 🛕 *Uluwatu Sunset Temple & Kecak Fire Dance* — $55 USD/pax\n\n_Includes private A/C car, hotel transfer, entrance fees & guide. Reply BOOK to reserve._',
  });
  const [isSimulatingSandbox, setIsSimulatingSandbox] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState<'keyword' | 'tripbone_booking_created' | 'tour_reminder_24h' | 'first_message'>('keyword');
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [newRuleAction, setNewRuleAction] = useState('send_template');

  const handleTestKeyword = (kw: string) => {
    setSandboxInput(kw);
    setIsSimulatingSandbox(true);

    setTimeout(() => {
      const lower = kw.toLowerCase().trim();
      let matchedRule = 'Fallback / No Keyword Match';
      let botReply = '🤖 Thanks for messaging Bali Adventours! A live expedition specialist will respond shortly. You can also reply *MENU* to see automated self-service options.';
      let complianceNote: string | undefined;

      if (['stop', 'berhenti', 'unsubscribe', 'cancel', 'quit'].includes(lower)) {
        matchedRule = 'Compliance Rule: TCPA & Meta WhatsApp Opt-Out Trigger';
        botReply = 'AUTOMATED COMPLIANCE NOTICE: You have been unsubscribed from automated WhatsApp updates. Reply START to resume notifications.';
        complianceNote = 'Customer marked as opted-out. All automated reminders and marketing paused.';
      } else if (['start', 'unstop', 'resume', 'mulai'].includes(lower)) {
        matchedRule = 'Compliance Rule: TCPA & Meta WhatsApp Opt-In Trigger';
        botReply = 'AUTOMATED COMPLIANCE NOTICE: Welcome back! You are re-subscribed to WhatsApp tour updates.';
        complianceNote = 'Customer opt-out flag cleared.';
      } else if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('biaya')) {
        matchedRule = 'Workflow Rule: Tour Pricing & Expeditions Catalog';
        botReply = '🌴 *BALI ADVENTOURS — EXPEDITION PACKAGES*\n\n1. 🌋 *Mount Batur Sunrise Trekking & Hot Springs* — $90 USD/pax\n2. 🏝️ *Nusa Penida Manta Snorkeling & West Coast* — $110 USD/pax\n3. 🐒 *Ubud Jungle Swing & Tegenungan Waterfall* — $65 USD/pax\n4. 🛕 *Uluwatu Sunset Temple & Kecak Fire Dance* — $55 USD/pax\n\n_Includes private A/C car, hotel transfer, entrance fees & guide. Reply BOOK to reserve._';
      } else if (lower.includes('pickup') || lower.includes('driver') || lower.includes('jemput')) {
        matchedRule = 'Workflow Rule: Driver & Hotel Pickup Status';
        botReply = '🚙 *TOUR PICKUP & DRIVER STATUS*\n\n*Tour:* Mount Batur Sunrise Trekking\n*Pickup Time:* 02:30 AM WITA\n*Meeting Lobby:* Padma Resort Ubud (Main Lobby)\n*Assigned Driver:* Pak Made Wijaya (+62 812-9876-5432, Innova DK 1829 FB)\n\n_Your driver will be in the lobby holding a personalized Bali Adventours placard 15 minutes prior._';
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('cuaca')) {
        matchedRule = 'Workflow Rule: Mountain Weather & Marine Advisory';
        botReply = '⛅ *BALI WEATHER & CLIMBING ADVISORY*\n\n• *Mount Batur Summit:* 14°C – 17°C (Clear skies expected for sunrise. Wind jacket recommended!)\n• *Nusa Penida Waters:* Swell 1.2m, calm, manta visibility excellent (15-20m).\n• *Ubud Highlands:* Warm, 26°C with light afternoon breeze.';
      } else if (lower.includes('menu') || lower.includes('help') || lower.includes('bantuan')) {
        matchedRule = 'Workflow Rule: Quick Interactive Service Menu';
        botReply = '🤖 *BALI ADVENTOURS QUICK BOT MENU*\n\nReply with any of these keywords:\n• *PRICE* - View all tour package rates\n• *PICKUP* - Check your driver & pickup schedule\n• *WEATHER* - Mountain summit & sea forecast\n• *OPERATOR* - Connect directly with our live dispatch team';
      }

      setSandboxLog({
        inboundText: kw,
        matchedRule,
        botReply,
        complianceNote,
      });
      setIsSimulatingSandbox(false);
    }, 450);
  };

  const handleSimulateRun = (wf: WorkflowRule) => {
    setActiveSimulationLog({
      workflowName: wf.name,
      steps: [
        { text: `1. Ingesting event: [${wf.triggerValue}]...`, status: 'active' },
      ],
    });

    setTimeout(() => {
      setActiveSimulationLog((prev) => prev && ({
        ...prev,
        steps: [
          { text: `1. Ingested event: [${wf.triggerValue}]`, status: 'done' },
          { text: `2. Evaluating condition rules: (${wf.conditions.join(' AND ')}) ➔ MATCHED`, status: 'active' },
        ],
      }));

      setTimeout(() => {
        setActiveSimulationLog((prev) => prev && ({
          ...prev,
          steps: [
            { text: `1. Ingested event: [${wf.triggerValue}]`, status: 'done' },
            { text: `2. Evaluating condition rules: (${wf.conditions.join(' AND ')}) ➔ MATCHED`, status: 'done' },
            { text: `3. Dispatching action: [${wf.actionPayload}] via WhatsApp Socket Gateway...`, status: 'done' },
            { text: `4. Result: Message delivered to recipient (+61 412 345 678). ACK returned in 118ms.`, status: 'done' },
          ],
        }));
      }, 1000);
    }, 800);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: WorkflowRule = {
      id: 'wf-' + Date.now(),
      tenantId: 'tenant-bali-adventours',
      name: newRuleName.trim(),
      description: `Custom automated workflow triggered by ${newRuleTrigger}.`,
      triggerType: newRuleTrigger,
      triggerValue: newRuleKeyword || 'any_inbound_match',
      conditions: ['WhatsApp account connected == true'],
      actionType: 'send_template',
      actionPayload: 'Automated response with tour info and booking link',
      isActive: true,
      runsCount: 0,
      lastRunAt: 'Never',
    };

    onAddWorkflow(newRule);
    setIsCreating(false);
    setNewRuleName('');
    setNewRuleKeyword('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Messaging Workflow Engine</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Trigger ➔ Condition ➔ Action
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Automate booking confirmations, 24-hour driver reminders, and keyword inquiries across WhatsApp and Tripbone.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Workflow</span>
        </button>
      </div>

      {/* Interactive Chatbot Keyword Auto-Responder Simulator Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Interactive Chatbot & Keyword Simulator</h2>
              <p className="text-xs text-neutral-500">Test inbound WhatsApp customer messages against automated auto-responder rules</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Auto-Responder Engine Active</span>
          </div>
        </div>

        {/* Quick Keyword Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500">Try Keyword:</span>
          {[
            { kw: 'PRICE', label: 'PRICE (Tour Rates)' },
            { kw: 'PICKUP', label: 'PICKUP (Driver Details)' },
            { kw: 'WEATHER', label: 'WEATHER (Summit & Sea)' },
            { kw: 'MENU', label: 'MENU (Bot Options)' },
            { kw: 'STOP', label: 'STOP (Compliance Opt-Out)' },
            { kw: 'START', label: 'START (Re-Subscribe)' },
          ].map((item) => (
            <button
              key={item.kw}
              onClick={() => handleTestKeyword(item.kw)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                sandboxInput.toUpperCase() === item.kw
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={sandboxInput}
            onChange={(e) => setSandboxInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTestKeyword(sandboxInput);
              }
            }}
            placeholder="Type any inbound traveler inquiry e.g. How much is Mount Batur?..."
            className="flex-1 text-xs font-medium px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={() => handleTestKeyword(sandboxInput)}
            disabled={isSimulatingSandbox || !sandboxInput.trim()}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50 shadow-xs"
          >
            {isSimulatingSandbox ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CornerDownLeft className="w-3.5 h-3.5" />
            )}
            <span>Simulate Inbound</span>
          </button>
        </div>

        {/* Live Simulation Output */}
        {sandboxLog && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Rule Match Diagnostics */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Evaluation Result</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  MATCHED
                </span>
              </div>
              <div className="font-semibold text-neutral-900">{sandboxLog.matchedRule}</div>
              <div className="text-neutral-500 text-[11px]">
                Event parsed: <code className="bg-neutral-200 px-1 py-0.5 rounded font-mono text-neutral-800">"{sandboxLog.inboundText}"</code>
              </div>
              {sandboxLog.complianceNote && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{sandboxLog.complianceNote}</span>
                </div>
              )}
            </div>

            {/* WhatsApp Phone Preview Bubble */}
            <div className="p-4 bg-[#E5DDD5] rounded-xl border border-neutral-300 space-y-2">
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>WhatsApp Guest Screen</span>
                <span className="text-[9px] font-normal text-neutral-600">Encrypted</span>
              </div>

              {/* Customer message bubble */}
              <div className="flex justify-end">
                <div className="bg-[#DCF8C6] text-neutral-900 rounded-lg rounded-tr-none px-3 py-1.5 text-xs max-w-[85%] shadow-xs">
                  <div>{sandboxLog.inboundText}</div>
                  <div className="text-[9px] text-neutral-400 text-right mt-0.5">10:45 AM ✓✓</div>
                </div>
              </div>

              {/* Bot automated response bubble */}
              <div className="flex justify-start">
                <div className="bg-white text-neutral-900 rounded-lg rounded-tl-none px-3 py-2 text-xs max-w-[90%] shadow-xs whitespace-pre-line leading-relaxed">
                  {sandboxLog.botReply}
                  <div className="text-[9px] text-neutral-400 text-right mt-1">10:45 AM • Automated</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Creator Drawer */}
      {isCreating && (
        <form onSubmit={handleCreateRule} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Define Automation Rule</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-neutral-400 hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Workflow Name</label>
              <input
                type="text"
                placeholder="e.g. Sunrise Tour FAQ Auto-responder"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Trigger Event</label>
              <select
                value={newRuleTrigger}
                onChange={(e: any) => setNewRuleTrigger(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
              >
                <option value="keyword">Incoming Keyword Match</option>
                <option value="tripbone_booking_created">Tripbone Booking Confirmed</option>
                <option value="tour_reminder_24h">24h Before Tour Pickup</option>
                <option value="first_message">First-time Customer Message</option>
              </select>
            </div>

            {newRuleTrigger === 'keyword' && (
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Keywords (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. pickup, hotel, discount, time"
                  value={newRuleKeyword}
                  onChange={(e) => setNewRuleKeyword(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Deploy Workflow
            </button>
          </div>
        </form>
      )}

      {/* Live Simulation Output Panel */}
      {activeSimulationLog && (
        <div className="bg-neutral-900 text-white p-5 rounded-2xl shadow-lg space-y-3 animate-fade-in border border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs">Live Execution Inspector: {activeSimulationLog.workflowName}</span>
            </div>
            <button
              onClick={() => setActiveSimulationLog(null)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Close Inspector
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {activeSimulationLog.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {step.status === 'done' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
                )}
                <span className={step.status === 'done' ? 'text-neutral-200' : 'text-emerald-300'}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List of Workflow Cards */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className={`bg-white rounded-2xl border transition p-6 shadow-xs space-y-4 ${
              wf.isActive ? 'border-neutral-200' : 'border-neutral-200 opacity-60 bg-neutral-50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">{wf.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    wf.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {wf.isActive ? 'Active & Listening' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{wf.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateRun(wf)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 text-emerald-600" />
                  <span>Test Run</span>
                </button>

                <button
                  onClick={() => onToggleWorkflow(wf.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    wf.isActive
                      ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {wf.isActive ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>

            {/* Visual Node Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {/* Trigger Node */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-600">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Trigger</span>
                </div>
                <div className="font-mono text-xs text-neutral-900 font-semibold truncate">
                  {wf.triggerValue}
                </div>
                <div className="text-[11px] text-neutral-500">{wf.triggerType}</div>
              </div>

              {/* Conditions Node */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-600">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Condition Filters</span>
                </div>
                <div className="text-xs text-neutral-800 font-medium truncate">
                  {wf.conditions.join(', ')}
                </div>
                <div className="text-[11px] text-neutral-500">Evaluated on event entry</div>
              </div>

              {/* Action Node */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-600">
                  <Send className="w-3.5 h-3.5" />
                  <span>Action Executed</span>
                </div>
                <div className="text-xs text-neutral-800 font-medium truncate">
                  {wf.actionPayload}
                </div>
                <div className="text-[11px] text-neutral-500">WhatsApp Gateway dispatch</div>
              </div>
            </div>

            {/* Footer metrics for this workflow */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
              <span>Total executions: <strong className="text-neutral-700">{wf.runsCount} times</strong></span>
              <span>Last triggered: {wf.lastRunAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
