import React, { useState } from 'react';
import { AdminAuditLog } from '../../types';
import { 
  ShieldAlert, 
  Search, 
  Download, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  User, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  Info
} from 'lucide-react';

interface SuperAdminAuditLogsProps {
  logs: AdminAuditLog[];
  onShowNotice: (msg: string) => void;
}

export const SuperAdminAuditLogs: React.FC<SuperAdminAuditLogsProps> = ({
  logs,
  onShowNotice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery) ||
      JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `saas_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowNotice('Audit logs downloaded as JSON archive.');
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Administrative Audit & Security Trail</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
              {logs.length} Recorded Events
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Immutable log of privilege escalations, billing alterations, subscriber resets, and cluster operations.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-neutral-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action keyword, admin email, IP address, or payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Audit Log Feed */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl divide-y divide-neutral-800">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-neutral-500">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No audit entries matching filter</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div key={log.id} className="p-4 hover:bg-neutral-800/30 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Severity Icon */}
                    <div className="mt-0.5">
                      {log.severity === 'critical' ? (
                        <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center">
                          <AlertOctagon className="w-4 h-4" />
                        </div>
                      ) : log.severity === 'warning' ? (
                        <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Action Details */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{log.action}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          log.severity === 'critical'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : log.severity === 'warning'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}>
                          {log.severity}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1 flex-wrap font-mono">
                        <span className="flex items-center gap-1 text-neutral-300">
                          <User className="w-3 h-3 text-neutral-500" />
                          <span>{log.adminEmail}</span>
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span>IP: {log.ipAddress}</span>
                        <span className="text-neutral-600">•</span>
                        <span className="flex items-center gap-1 text-neutral-500">
                          <Clock className="w-3 h-3" />
                          <span>{log.timestamp}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expand Payload Toggle */}
                  <button
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-neutral-800 pl-10">
                    <pre className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] font-mono text-purple-300 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
