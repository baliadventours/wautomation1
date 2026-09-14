import React, { useState } from 'react';
import { 
  NumberCheckResult, 
  WhapiChannel 
} from '../types';
import { INITIAL_NUMBER_CHECKS } from '../data/mockData';
import { 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Building2, 
  User, 
  Send, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Terminal,
  Upload,
  AlertCircle
} from 'lucide-react';

interface NumberCheckerViewProps {
  activeChannel: WhapiChannel;
  onSendTestMessage?: (phone: string, text: string) => void;
}

export const NumberCheckerView: React.FC<NumberCheckerViewProps> = ({
  activeChannel,
  onSendTestMessage,
}) => {
  const [results, setResults] = useState<NumberCheckResult[]>(INITIAL_NUMBER_CHECKS);
  const [inputNumber, setInputNumber] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [filterType, setFilterType] = useState<'all' | 'valid' | 'invalid' | 'business'>('all');
  const [copiedJid, setCopiedJid] = useState<string | null>(null);
  const [testMsgTarget, setTestMsgTarget] = useState<NumberCheckResult | null>(null);
  const [testMsgText, setTestMsgText] = useState('Hello! Checking your WhatsApp connection via Whapi.cloud API.');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCheckSingle = () => {
    if (!inputNumber.trim()) return;
    setIsChecking(true);

    setTimeout(() => {
      const clean = inputNumber.trim().replace(/[^0-9+]/g, '');
      const digits = clean.replace(/[^0-9]/g, '');
      const isValid = digits.length >= 10 && !clean.includes('000000');
      const isBiz = digits.startsWith('62') || digits.endsWith('8');

      const newResult: NumberCheckResult = {
        id: `chk-${Date.now()}`,
        inputNumber: inputNumber.trim(),
        formattedNumber: clean.startsWith('+') ? clean : `+${clean}`,
        jid: isValid ? `${digits}@s.whatsapp.net` : '',
        status: isValid ? 'valid' : 'invalid',
        isBusiness: isValid ? isBiz : false,
        businessName: isBiz ? 'Verified Merchant / Agency' : undefined,
        pushName: isValid ? `Guest (${digits.substring(digits.length - 4)})` : undefined,
        statusBio: isValid ? 'Hey there! I am using WhatsApp.' : undefined,
        avatarUrl: isValid ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' : undefined,
        verifiedAt: 'Just now',
      };

      setResults(prev => [newResult, ...prev]);
      setIsChecking(false);
      setInputNumber('');
      showToast(`Verification complete: ${clean} is ${isValid ? 'VALID' : 'INVALID'} on WhatsApp`);
    }, 600);
  };

  const handleCheckBulk = () => {
    if (!bulkInput.trim()) return;
    setIsChecking(true);

    setTimeout(() => {
      const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean);
      const newItems: NumberCheckResult[] = lines.map((line, idx) => {
        const clean = line.replace(/[^0-9+]/g, '');
        const digits = clean.replace(/[^0-9]/g, '');
        const isValid = digits.length >= 10 && !line.includes('0000');
        const isBiz = idx % 2 === 0;

        return {
          id: `chk-bulk-${Date.now()}-${idx}`,
          inputNumber: line,
          formattedNumber: clean.startsWith('+') ? clean : `+${clean}`,
          jid: isValid ? `${digits}@s.whatsapp.net` : '',
          status: isValid ? 'valid' : 'invalid',
          isBusiness: isValid ? isBiz : false,
          businessName: isBiz ? 'Business Account' : undefined,
          pushName: isValid ? `User ${digits.slice(-4)}` : undefined,
          statusBio: isValid ? 'Available' : undefined,
          verifiedAt: 'Just now',
        };
      });

      setResults(prev => [...newItems, ...prev]);
      setIsChecking(false);
      setBulkInput('');
      showToast(`Bulk check finished: ${newItems.length} numbers processed.`);
    }, 900);
  };

  const handleCopyJid = (jid: string, id: string) => {
    navigator.clipboard.writeText(jid);
    setCopiedJid(id);
    setTimeout(() => setCopiedJid(null), 2000);
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Phone,Formatted,Status,AccountType,JID,VerifiedAt"]
        .concat(results.map(r => `"${r.inputNumber}","${r.formattedNumber}","${r.status}","${r.isBusiness ? 'Business' : 'Personal'}","${r.jid}","${r.verifiedAt}"`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whapi_checked_numbers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported verified numbers to CSV.');
  };

  const filteredResults = results.filter(r => {
    if (filterType === 'valid') return r.status === 'valid';
    if (filterType === 'invalid') return r.status === 'invalid';
    if (filterType === 'business') return r.isBusiness;
    return true;
  });

  const validCount = results.filter(r => r.status === 'valid').length;
  const businessCount = results.filter(r => r.isBusiness).length;
  const invalidCount = results.filter(r => r.status === 'invalid').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-neutral-800 animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
              Phone Number Validator
            </span>
            <span className="text-xs text-neutral-400">• Whapi Presence API</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-1">WhatsApp Number Checker</h1>
          <p className="text-sm text-neutral-600 mt-0.5">
            Verify if target phone numbers exist on WhatsApp, detect Business vs. Personal accounts, and fetch profile bio status in real time before sending campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export Verified CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Total Numbers Checked</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{results.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Valid WhatsApp Accounts</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
            <span>{validCount}</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {results.length ? Math.round((validCount / results.length) * 100) : 0}% Valid
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">WhatsApp Business Accounts</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{businessCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Not Registered / Invalid</div>
          <div className="text-2xl font-bold text-neutral-400 mt-1">{invalidCount}</div>
        </div>
      </div>

      {/* Input Form Box */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'single' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Single Number Check
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'bulk' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Bulk List Validation (CSV/Multi-line)
          </button>
        </div>

        {activeTab === 'single' ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter phone with country code: e.g. +62 812 3456 7890 or +1 415 555 0199"
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckSingle()}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>
            <button
              onClick={handleCheckSingle}
              disabled={isChecking || !inputNumber.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Number</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-neutral-600">
              Paste phone numbers (one per line):
            </label>
            <textarea
              rows={4}
              placeholder="+62 812 3456 7890&#10;+44 7911 123456&#10;+1 415 555 0188"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="w-full p-3 border border-neutral-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCheckBulk}
                disabled={isChecking || !bulkInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Bulk List...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Run Bulk Validation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Table Header & Filters */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900">Validation Log</span>
            <span className="text-xs text-neutral-500">({filteredResults.length} records)</span>
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'valid', 'business', 'invalid'] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                  filterType === ft ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {ft === 'all' ? 'All' : ft}
              </button>
            ))}
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Contact / Phone</th>
                <th className="py-3 px-4">WhatsApp Status</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4">Status / About Bio</th>
                <th className="py-3 px-4">WhatsApp JID</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredResults.map((res) => (
                <tr key={res.id} className="hover:bg-neutral-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {res.avatarUrl ? (
                        <img 
                          src={res.avatarUrl} 
                          alt="avatar" 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold text-xs">
                          {res.status === 'valid' ? <User className="w-4 h-4" /> : <XCircle className="w-4 h-4 text-neutral-300" />}
                        </div>
                      )}
                      <div>
                        <div className="font-mono font-medium text-neutral-900">{res.formattedNumber}</div>
                        {res.pushName && (
                          <div className="text-[11px] text-neutral-500">{res.pushName}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {res.status === 'valid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                        <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                        Not on WA
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {res.isBusiness ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                        <Building2 className="w-3.5 h-3.5" />
                        WhatsApp Business
                      </span>
                    ) : res.status === 'valid' ? (
                      <span className="inline-flex items-center gap-1 text-neutral-600">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        Personal
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs truncate text-neutral-600">
                    {res.statusBio || <span className="text-neutral-400 italic">None</span>}
                  </td>

                  <td className="py-3.5 px-4">
                    {res.jid ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[11px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded truncate max-w-[150px]">
                          {res.jid}
                        </span>
                        <button
                          onClick={() => handleCopyJid(res.jid, res.id)}
                          className="p-1 hover:bg-neutral-200 rounded text-neutral-500 cursor-pointer"
                          title="Copy JID"
                        >
                          {copiedJid === res.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {res.status === 'valid' && (
                      <button
                        onClick={() => setTestMsgTarget(res)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 text-xs font-medium transition cursor-pointer border border-neutral-200 hover:border-emerald-300"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Test</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Message Modal */}
      {testMsgTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
              Send Test Message via Whapi API
            </h3>
            <div className="py-4 space-y-3 text-xs">
              <div>
                <span className="text-neutral-500 block">Recipient:</span>
                <span className="font-mono font-bold text-neutral-800 text-sm">
                  {testMsgTarget.formattedNumber} ({testMsgTarget.jid})
                </span>
              </div>
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Message Text</label>
                <textarea
                  rows={3}
                  value={testMsgText}
                  onChange={(e) => setTestMsgText(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setTestMsgTarget(null)}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onSendTestMessage) {
                    onSendTestMessage(testMsgTarget.formattedNumber, testMsgText);
                  }
                  showToast(`Message enqueued for ${testMsgTarget.formattedNumber}!`);
                  setTestMsgTarget(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Send via {activeChannel.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
