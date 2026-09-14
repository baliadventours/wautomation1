import React, { useState } from 'react';
import { ClusterNode } from '../../types';
import { 
  Server, 
  Cpu, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  HardDrive,
  Database,
  Radio,
  Clock
} from 'lucide-react';

interface SuperAdminInfrastructureProps {
  nodes: ClusterNode[];
  onShowNotice: (msg: string) => void;
}

export const SuperAdminInfrastructure: React.FC<SuperAdminInfrastructureProps> = ({
  nodes,
  onShowNotice,
}) => {
  const [clusterNodes, setClusterNodes] = useState<ClusterNode[]>(nodes);
  const [antiBanPacing, setAntiBanPacing] = useState<'fast' | 'balanced' | 'safe' | 'ultra_safe'>('balanced');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cluster aggregate numbers
  const totalSockets = clusterNodes.reduce((acc, n) => acc + n.activeSockets, 0);
  const totalQueued = clusterNodes.reduce((acc, n) => acc + n.queuedMessages, 0);
  const avgCpu = Math.round(clusterNodes.reduce((acc, n) => acc + n.cpuPercent, 0) / clusterNodes.length);
  const avgMemory = Math.round(clusterNodes.reduce((acc, n) => acc + n.memoryPercent, 0) / clusterNodes.length);

  const handleRefreshCluster = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Slightly randomize values to simulate live real-time telemetry
      setClusterNodes(prev => prev.map(n => ({
        ...n,
        cpuPercent: Math.max(12, Math.min(92, n.cpuPercent + Math.floor(Math.random() * 7 - 3))),
        memoryPercent: Math.max(25, Math.min(88, n.memoryPercent + Math.floor(Math.random() * 5 - 2))),
        pingMs: Math.max(6, n.pingMs + Math.floor(Math.random() * 4 - 2)),
      })));
      setIsRefreshing(false);
      onShowNotice('Cluster nodes pinged. Real-time telemetry refreshed.');
    }, 600);
  };

  const handleRestartSockets = () => {
    if (confirm('Soft-restart idle WhatsApp multi-device sockets across all cluster nodes? Active chats will reconnect smoothly.')) {
      onShowNotice('Dispatched soft-reload signal to Baileys socket pool. Sockets re-synchronized.');
    }
  };

  const handleFlushCache = () => {
    if (confirm('Flush Redis rate-limit and quota cache?')) {
      onShowNotice('Redis memory cache flushed. Counters synchronized with persistent database.');
    }
  };

  const handleRebalanceTraffic = () => {
    onShowNotice('Load balancer reweighted. Distributed traffic evenly across all healthy nodes.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>WhatsApp Socket Gateway & Cluster Health</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Distributed microservices running WhatsApp Web multi-device connection pools and webhook queues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshCluster}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-neutral-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Aggregate Cluster Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Active WhatsApp Sockets</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalSockets}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Multi-Device Baileys connections</span>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Queued Outbound Messages</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">{totalQueued}</div>
          <span className="text-[11px] text-neutral-400">BullMQ Redis queue backlog</span>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Cluster Average CPU</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{avgCpu}%</div>
          <div className="w-full bg-neutral-800 rounded-full h-1 mt-1">
            <div style={{ width: `${avgCpu}%` }} className="bg-blue-500 h-full rounded-full" />
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Cluster Memory Usage</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{avgMemory}%</div>
          <div className="w-full bg-neutral-800 rounded-full h-1 mt-1">
            <div style={{ width: `${avgMemory}%` }} className="bg-amber-500 h-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Cluster Nodes Table */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="font-bold text-white text-xs flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Distributed Gateway Nodes ({clusterNodes.length})</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">Auto-scaling group: enabled</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Node Name / Host</th>
                <th className="py-3 px-4 font-semibold">Cloud Region</th>
                <th className="py-3 px-4 font-semibold">CPU Utilization</th>
                <th className="py-3 px-4 font-semibold">Memory Usage</th>
                <th className="py-3 px-4 font-semibold">Live Sockets</th>
                <th className="py-3 px-4 font-semibold">Ping Latency</th>
                <th className="py-3 px-4 font-semibold">Node Uptime</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {clusterNodes.map((n) => (
                <tr key={n.id} className="hover:bg-neutral-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-white text-xs">{n.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{n.id}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {n.region}
                    </span>
                  </td>

                  <td className="py-3 px-4 min-w-[120px]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-white">{n.cpuPercent}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${n.cpuPercent}%` }}
                        className={`h-full rounded-full ${n.cpuPercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-4 min-w-[120px]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-white">{n.memoryPercent}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${n.memoryPercent}%` }}
                        className={`h-full rounded-full ${n.memoryPercent > 85 ? 'bg-red-500' : 'bg-purple-500'}`}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-white text-xs">{n.activeSockets}</div>
                    <div className="text-[10px] text-neutral-500">{n.queuedMessages} in queue</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-mono text-xs font-semibold">{n.pingMs}ms</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-neutral-400 font-mono text-xs">{n.uptime}</span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{n.status.toUpperCase()}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anti-Ban Engine & Global Cluster Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Anti-Ban Pacing Configuration */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Global Anti-Ban Pacing Engine</h3>
              <p className="text-xs text-neutral-400">Controls dispatch rate, human typing simulation, and jitter delays</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                setAntiBanPacing('fast');
                onShowNotice('Pacing set to Fast (1.8s avg). Higher throughput.');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                antiBanPacing === 'fast'
                  ? 'bg-purple-950/70 border-purple-600 text-white'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-xs">Fast</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">1.8s delay</div>
              <div className="text-[10px] text-amber-400 mt-1">High volume</div>
            </button>

            <button
              onClick={() => {
                setAntiBanPacing('balanced');
                onShowNotice('Pacing set to Balanced (3.2s avg). Recommended for general traffic.');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                antiBanPacing === 'balanced'
                  ? 'bg-purple-950/70 border-purple-600 text-white'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-xs">Balanced</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">3.2s delay</div>
              <div className="text-[10px] text-emerald-400 mt-1">Default safety</div>
            </button>

            <button
              onClick={() => {
                setAntiBanPacing('safe');
                onShowNotice('Pacing set to Safe (4.8s avg). Adds typing indicator simulation.');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                antiBanPacing === 'safe'
                  ? 'bg-purple-950/70 border-purple-600 text-white'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-xs">Safe</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">4.8s delay</div>
              <div className="text-[10px] text-blue-400 mt-1">Human typing</div>
            </button>

            <button
              onClick={() => {
                setAntiBanPacing('ultra_safe');
                onShowNotice('Pacing set to Ultra-Safe (6.5s random jitter). Maximum protection.');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                antiBanPacing === 'ultra_safe'
                  ? 'bg-purple-950/70 border-purple-600 text-white'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-xs">Ultra-Safe</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">6.5s + jitter</div>
              <div className="text-[10px] text-purple-400 mt-1">Zero ban risk</div>
            </button>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs text-neutral-400 leading-relaxed">
            WhatsApp actively monitors burst rates. The WhatsCRM Anti-Ban engine dynamically adjusts typing presence indicators (<code className="text-purple-300 font-mono">composing</code>) and inserts pseudo-random jitter (±650ms) before sending messages to emulate organic device behavior.
          </div>
        </div>

        {/* Global Cluster Operations */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Cluster Maintenance Operations</h3>
              <p className="text-xs text-neutral-400">Execute distributed administrative routines</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <div>
                <div className="text-xs font-bold text-white">Soft-Restart Sockets Pool</div>
                <div className="text-[11px] text-neutral-400">Reconnects stale Baileys socket listeners without dropping messages</div>
              </div>
              <button
                onClick={handleRestartSockets}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Restart
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <div>
                <div className="text-xs font-bold text-white">Flush Redis Quota Cache</div>
                <div className="text-[11px] text-neutral-400">Forces instant sync of message counters from PostgreSQL/Firestore</div>
              </div>
              <button
                onClick={handleFlushCache}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Flush
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <div>
                <div className="text-xs font-bold text-white">Rebalance Gateway Traffic</div>
                <div className="text-[11px] text-neutral-400">Evenly redistribute active WhatsApp connections across all regional nodes</div>
              </div>
              <button
                onClick={handleRebalanceTraffic}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Rebalance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
