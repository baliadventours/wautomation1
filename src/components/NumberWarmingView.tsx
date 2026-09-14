import React, { useState } from 'react';
import { 
  WhapiChannel, 
  WarmingScheduleDay 
} from '../types';
import { INITIAL_WARMING_SCHEDULE } from '../data/mockData';
import { 
  Flame, 
  ShieldCheck, 
  Clock, 
  Sliders, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  RefreshCw, 
  HelpCircle,
  TrendingUp,
  MessageSquareQuote,
  Sparkles
} from 'lucide-react';

interface NumberWarmingViewProps {
  activeChannel: WhapiChannel;
  onUpdateChannel: (channel: WhapiChannel) => void;
}

export const NumberWarmingView: React.FC<NumberWarmingViewProps> = ({
  activeChannel,
  onUpdateChannel,
}) => {
  const [schedule, setSchedule] = useState<WarmingScheduleDay[]>(INITIAL_WARMING_SCHEDULE);
  const [isWarmingActive, setIsWarmingActive] = useState(activeChannel.warmupStatus === 'in_progress');
  const [typingDelay, setTypingDelay] = useState(2.2);
  const [jitterRange, setJitterRange] = useState<[number, number]>([1.5, 3.5]);
  const [simulateDialogues, setSimulateDialogues] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleWarming = () => {
    const nextState = !isWarmingActive;
    setIsWarmingActive(nextState);
    onUpdateChannel({
      ...activeChannel,
      warmupStatus: nextState ? 'in_progress' : 'paused',
    });
    showToast(nextState ? 'Number warming schedule RESUMED' : 'Number warming schedule PAUSED');
  };

  const handleAdvanceDay = () => {
    const currentIdx = schedule.findIndex(s => s.isCurrent);
    if (currentIdx !== -1 && currentIdx < schedule.length - 1) {
      const updated = schedule.map((s, idx) => ({
        ...s,
        isCompleted: idx <= currentIdx,
        isCurrent: idx === currentIdx + 1,
      }));
      setSchedule(updated);
      onUpdateChannel({
        ...activeChannel,
        warmupDay: currentIdx + 2,
        dailyLimit: updated[currentIdx + 1].maxMessages,
      });
      showToast(`Advanced to Day ${currentIdx + 2} (Cap: ${updated[currentIdx + 1].maxMessages} msgs/day)`);
    }
  };

  const currentDayConfig = schedule.find(s => s.isCurrent) || schedule[4];
  const completedDaysCount = schedule.filter(s => s.isCompleted).length;
  const progressPercent = Math.round((completedDaysCount / schedule.length) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-neutral-800 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold tracking-wide uppercase">
              Anti-Ban Protection
            </span>
            <span className="text-xs text-neutral-400">• Automated Ramp-up Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-1">Number Warming & Delivery Pacing</h1>
          <p className="text-sm text-neutral-600 mt-0.5">
            Gradually ramps up outbound messaging volume over 14 days with human-like typing simulation and bidirectional dialogues to establish maximum WhatsApp account trust score.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleWarming}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
              isWarmingActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isWarmingActive ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Warming</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Warming</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Channel & Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Channel</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-neutral-900 truncate">{activeChannel.name}</div>
          <div className="text-xs font-mono text-neutral-500 mt-0.5">{activeChannel.phoneNumber}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Warming Stage</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            Day {currentDayConfig.day} <span className="text-xs font-normal text-neutral-500">/ 14</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Safe Limit</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {currentDayConfig.maxMessages} <span className="text-xs font-normal text-neutral-500">msgs/day</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {activeChannel.dailyMessagesSent} sent today
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Ban Risk Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            98% <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Ultra Safe</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Zero abuse flags detected
          </div>
        </div>
      </div>

      {/* Warming Controls & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-neutral-900">Anti-Ban Pacing Parameters</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-neutral-800 mb-1">
                <span>Human Typing Delay</span>
                <span className="font-mono text-amber-600">{typingDelay}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={typingDelay}
                onChange={(e) => setTypingDelay(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Whapi sends a WhatsApp "composing..." presence indicator for this duration before delivering the payload.
              </p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-neutral-800 mb-1">
                <span>Randomized Interval Jitter</span>
                <span className="font-mono text-amber-600">{jitterRange[0]}s – {jitterRange[1]}s</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={jitterRange[0]}
                  onChange={(e) => setJitterRange([parseFloat(e.target.value), jitterRange[1]])}
                  className="w-1/2 p-2 border border-neutral-200 rounded-lg text-xs"
                />
                <input
                  type="number"
                  step="0.5"
                  value={jitterRange[1]}
                  onChange={(e) => setJitterRange([jitterRange[0], parseFloat(e.target.value)])}
                  className="w-1/2 p-2 border border-neutral-200 rounded-lg text-xs"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Randomizes delay between consecutive queue dispatches so traffic mimics organic human phone usage.
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-100 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateDialogues}
                  onChange={(e) => setSimulateDialogues(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-800 block">Simulate Bi-Directional Dialogues</span>
                  <span className="text-[11px] text-neutral-500 block">
                    Automatically exchange polite greetings with Whapi seed network accounts to boost reply ratio.
                  </span>
                </div>
              </label>
            </div>

            <button
              onClick={handleAdvanceDay}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold transition cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Manually Advance to Next Day</span>
            </button>
          </div>
        </div>

        {/* 14-Day Schedule Roadmap Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">14-Day Gradual Warmup Roadmap</h3>
              <p className="text-xs text-neutral-500">Progressive message volume increase based on WhatsApp anti-spam algorithms</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              {completedDaysCount} of 10 stages completed
            </span>
          </div>

          <div className="space-y-2.5">
            {schedule.map((item) => {
              return (
                <div
                  key={item.day}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition ${
                    item.isCurrent
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                      : item.isCompleted
                      ? 'bg-neutral-50/60 border-neutral-200 text-neutral-600'
                      : 'bg-white border-neutral-200 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      item.isCurrent
                        ? 'bg-amber-500 text-white'
                        : item.isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {item.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : `D${item.day}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-xs ${item.isCurrent ? 'text-amber-900 font-bold' : item.isCompleted ? 'text-neutral-800' : 'text-neutral-500'}`}>
                          Day {item.day}: {item.maxMessages} Messages / Day
                        </span>
                        {item.isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                            Current Active Day
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{item.description}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-medium text-neutral-700">
                      {item.typingDelaySec}s delay
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      {item.dialoguePairs} seed pairs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
