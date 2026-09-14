import React, { useState } from 'react';
import { 
  WhapiChannel, 
  ApiEndpointItem 
} from '../types';
import { WHAPI_API_ENDPOINTS } from '../data/mockData';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Code, 
  Send, 
  RefreshCw, 
  Key, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';

interface ApiExplorerViewProps {
  channels: WhapiChannel[];
  activeChannel: WhapiChannel;
  onSelectChannel: (channelId: string) => void;
  onMessageSentThroughApi?: (to: string, text: string) => void;
}

type LangTab = 'curl' | 'nodejs' | 'python' | 'php' | 'go';

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  onMessageSentThroughApi,
}) => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(WHAPI_API_ENDPOINTS[0].id);
  const [activeLang, setActiveLang] = useState<LangTab>('curl');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status: number;
    statusText: string;
    timeMs: number;
    timestamp: string;
    headers: Record<string, string>;
    body: any;
  } | null>(null);

  const selectedEndpoint = WHAPI_API_ENDPOINTS.find(e => e.id === selectedEndpointId) || WHAPI_API_ENDPOINTS[0];
  const [requestPayloadText, setRequestPayloadText] = useState<string>(
    selectedEndpoint.defaultPayload ? JSON.stringify(selectedEndpoint.defaultPayload, null, 2) : ''
  );

  const handleSelectEndpoint = (endpoint: ApiEndpointItem) => {
    setSelectedEndpointId(endpoint.id);
    setRequestPayloadText(endpoint.defaultPayload ? JSON.stringify(endpoint.defaultPayload, null, 2) : '');
    setExecutionResult(null);
  };

  const handleExecuteRequest = () => {
    setIsExecuting(true);
    const start = performance.now();

    setTimeout(() => {
      let parsedPayload: any = null;
      try {
        if (requestPayloadText) parsedPayload = JSON.parse(requestPayloadText);
      } catch (err) {
        // Invalid json fallback
      }

      const end = performance.now();
      const elapsed = Math.round(end - start + 80 + Math.random() * 40);

      // Create dynamic response
      let respBody = selectedEndpoint.defaultResponse;
      if (selectedEndpoint.id === 'post-messages-text' && parsedPayload) {
        respBody = {
          sent: true,
          message_id: `wamid.HBgL${Math.random().toString(36).substring(2, 10).toUpperCase()}==`,
          timestamp: Math.floor(Date.now() / 1000),
          to: parsedPayload.to || '6281234567890@s.whatsapp.net',
          status: 'sent',
          simulated_typing_ms: parsedPayload.typing_time ? parsedPayload.typing_time * 1000 : 1500
        };

        if (onMessageSentThroughApi && parsedPayload.body) {
          onMessageSentThroughApi(parsedPayload.to || '+62 812-3456-7890', parsedPayload.body);
        }
      }

      setExecutionResult({
        status: 200,
        statusText: 'OK',
        timeMs: elapsed,
        timestamp: new Date().toISOString(),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-whapi-request-id': `req_${Math.random().toString(36).substring(2, 10)}`,
          'x-whapi-channel-id': activeChannel.id,
          'x-rate-limit-remaining': `${Math.max(0, activeChannel.dailyLimit - activeChannel.dailyMessagesSent - 1)}`,
        },
        body: respBody,
      });

      setIsExecuting(false);
    }, 450);
  };

  const generateCodeSnippet = () => {
    const baseUrl = 'https://gate.whapi.cloud';
    const token = activeChannel.apiKey;
    const path = selectedEndpoint.path;
    const method = selectedEndpoint.method;
    const hasBody = method !== 'GET' && requestPayloadText.trim();

    if (activeLang === 'curl') {
      if (hasBody) {
        return `curl -X ${method} "${baseUrl}${path}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '${requestPayloadText.replace(/\n/g, '\n  ')}'`;
      }
      return `curl -X ${method} "${baseUrl}${path}" \\
  -H "Authorization: Bearer ${token}"`;
    }

    if (activeLang === 'nodejs') {
      if (hasBody) {
        return `// Using standard fetch (Node.js 18+)
const response = await fetch("${baseUrl}${path}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer ${token}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${requestPayloadText.split('\n').join('\n  ')})
});

const data = await response.json();
console.log(data);`;
      }
      return `// Using standard fetch
const response = await fetch("${baseUrl}${path}", {
  method: "GET",
  headers: {
    "Authorization": "Bearer ${token}"
  }
});

const data = await response.json();
console.log(data);`;
    }

    if (activeLang === 'python') {
      if (hasBody) {
        return `import requests

url = "${baseUrl}${path}"
headers = {
    "Authorization": "Bearer ${token}",
    "Content-Type": "application/json"
}
payload = ${requestPayloadText}

response = requests.${method.toLowerCase()}(url, json=payload, headers=headers)
print(response.json())`;
      }
      return `import requests

url = "${baseUrl}${path}"
headers = {
    "Authorization": "Bearer ${token}"
}

response = requests.get(url, headers=headers)
print(response.json())`;
    }

    if (activeLang === 'php') {
      return `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${baseUrl}${path}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => '${method}',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer ${token}',
    'Content-Type: application/json'
  ),
  ${hasBody ? `CURLOPT_POSTFIELDS => '${requestPayloadText.replace(/'/g, "\\'")}',` : ''}
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
    }

    if (activeLang === 'go') {
      return `package main

import (
	"fmt"
	"net/http"
	"io"
	${hasBody ? `"strings"` : ''}
)

func main() {
	url := "${baseUrl}${path}"
	${hasBody ? `payload := strings.NewReader(\`${requestPayloadText}\`)\n\treq, _ := http.NewRequest("${method}", url, payload)` : `req, _ := http.NewRequest("${method}", url, nil)`}
	req.Header.Add("Authorization", "Bearer ${token}")
	${hasBody ? `req.Header.Add("Content-Type", "application/json")` : ''}

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`;
    }

    return '';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyResponse = () => {
    if (executionResult) {
      navigator.clipboard.writeText(JSON.stringify(executionResult.body, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const categories = ['All', 'Messages', 'Contacts', 'Chats', 'Groups', 'Status', 'Channel'];
  const filteredEndpoints = categoryFilter === 'All' 
    ? WHAPI_API_ENDPOINTS 
    : WHAPI_API_ENDPOINTS.filter(e => e.category === categoryFilter);

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'POST': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'GET': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PUT': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Whapi API Explorer Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
              Swagger OpenAPI 3.0
            </span>
            <span className="text-xs text-neutral-400">• Interactive Test Console</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-1">Whapi.Cloud REST API Explorer</h1>
          <p className="text-sm text-neutral-600 mt-0.5">
            Test endpoints live, generate ready-to-use client code, and simulate WhatsApp messaging through your connected channel.
          </p>
        </div>

        {/* Channel & Token Switcher */}
        <div className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
          <div className="text-xs">
            <span className="text-neutral-500 block">Active Target Channel:</span>
            <select
              value={activeChannel.id}
              onChange={(e) => onSelectChannel(e.target.value)}
              className="bg-transparent font-semibold text-neutral-800 focus:outline-hidden cursor-pointer"
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phoneNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="h-7 w-px bg-neutral-200" />
          <div className="text-xs">
            <span className="text-neutral-500 block">Gateway Base URL:</span>
            <span className="font-mono text-neutral-700 font-medium">https://gate.whapi.cloud</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoint Navigation list */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-xs p-4 flex flex-col h-[780px]">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-3 border-b border-neutral-100 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Endpoints List */}
          <div className="flex-1 overflow-y-auto pt-3 space-y-1 pr-1">
            {filteredEndpoints.map((ep) => {
              const isSelected = ep.id === selectedEndpointId;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20 shadow-xs'
                      : 'border-transparent hover:bg-neutral-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getMethodBadgeClass(ep.method)}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-semibold text-neutral-900 truncate">
                        {ep.path}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 truncate mt-1">
                      {ep.name}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-neutral-300'}`} />
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span>{filteredEndpoints.length} endpoints available</span>
            <span className="text-emerald-600 font-medium">OpenAPI v3.0</span>
          </div>
        </div>

        {/* Right Column: Interactive Tester & Code Generator */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Details Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getMethodBadgeClass(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-base font-bold text-neutral-900">
                  {selectedEndpoint.path}
                </span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={isExecuting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Send Live Request</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3">
              <h3 className="text-sm font-semibold text-neutral-900">{selectedEndpoint.name}</h3>
              <p className="text-xs text-neutral-600 mt-1">{selectedEndpoint.description}</p>
            </div>

            {/* Request Payload Editor */}
            {selectedEndpoint.method !== 'GET' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-neutral-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span>Request Body (JSON)</span>
                    <span className="text-[11px] text-neutral-400 font-normal">Content-Type: application/json</span>
                  </span>
                  <button
                    onClick={() => setRequestPayloadText(JSON.stringify(selectedEndpoint.defaultPayload, null, 2))}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-medium cursor-pointer"
                  >
                    Reset to Default
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={requestPayloadText}
                  onChange={(e) => setRequestPayloadText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-neutral-900 text-emerald-400 rounded-xl border border-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-inner"
                  spellCheck={false}
                />
              </div>
            )}
          </div>

          {/* Live Response Panel */}
          {executionResult && (
            <div className="bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-lg p-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    HTTP {executionResult.status} {executionResult.statusText}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{executionResult.timeMs} ms</span>
                  </span>
                  <span className="text-xs text-neutral-500">• Latency</span>
                </div>

                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  {copiedResponse ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Response</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3">
                <div className="text-[11px] font-mono text-neutral-400 mb-1">Response Body:</div>
                <pre className="p-4 bg-neutral-900 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-neutral-800">
                  {JSON.stringify(executionResult.body, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Client SDK Code Generator */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-neutral-900">Client Code Generator</span>
              </div>

              {/* Language switcher */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                {(['curl', 'nodejs', 'python', 'php', 'go'] as LangTab[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                      activeLang === lang
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {lang === 'nodejs' ? 'Node.js' : lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-4">
              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs font-medium transition cursor-pointer backdrop-blur-xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>

              <pre className="p-4 bg-neutral-900 text-neutral-200 rounded-xl font-mono text-xs overflow-x-auto border border-neutral-800 leading-relaxed">
                {generateCodeSnippet()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
