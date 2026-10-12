import React, { useState } from 'react';
import { AppView, TelemetrySession } from '../../types';
import { INITIAL_TELEMETRY } from '../../data/mockData';

interface DeveloperDashboardViewProps {
  onNavigate: (view: AppView) => void;
  onShowToast: (title: string, desc?: string) => void;
}

export const DeveloperDashboardView: React.FC<DeveloperDashboardViewProps> = ({
  onNavigate,
  onShowToast
}) => {
  const [filter, setFilter] = useState<'all' | 'voice' | 'failed' | 'webhook'>('all');
  const [telemetry, setTelemetry] = useState<TelemetrySession[]>(INITIAL_TELEMETRY);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const filteredTelemetry = telemetry.filter((t) => {
    if (filter === 'voice') return t.authStatus === 'verified';
    if (filter === 'failed') return t.authStatus === 'rejected';
    if (filter === 'webhook') return t.status >= 400 || t.actionName.includes('refund');
    return true;
  });

  const handleTestTool = (toolName: string) => {
    onShowToast(`Simulating ${toolName}() execution`, `Triggered test runner webhook. 200 OK in 142ms.`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Copied to clipboard', `${label} copied successfully.`);
  };

  const handleRegenerateKey = () => {
    onShowToast('API Key Rotated', 'New 256-bit rotating token generated for cluster.');
  };

  const handleDeploySchema = () => {
    onShowToast('Tool Schema Deployed', '18 active tool nodes compiled into agent vector memory.');
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      {/* Top Level App Workspace Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 border border-[#FFE6DC] shadow-sm">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#FF7E5F]/20 via-[#FFAE33]/15 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-['Outfit'] text-[11px] font-bold text-[#A53B22] uppercase tracking-widest bg-[#FFDAD2] px-3 py-1 rounded-full">
                Core Cluster
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EBF8] text-[#57423D] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-ping"></span>
                <span>Production - ap-south-1</span>
              </div>
              <span className="text-xs text-[#8B716B]">
                Cluster ID: <span className="font-mono font-bold text-[#1D1A23]">ts-prod-node-8802</span>
              </span>
            </div>

            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-[#1D1A23] tracking-tight">
              App Workspace: Acme Product Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#57423D] max-w-3xl leading-relaxed">
              Voice-to-action engine that converts human speech into instant software actions in under 850 milliseconds.
            </p>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={handleRegenerateKey}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#1D1A23] text-xs font-semibold border border-[#FFE6DC] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#A53B22]">key</span>
              <span>Regenerate API Key</span>
            </button>
            <button
              onClick={handleDeploySchema}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#1D1A23] text-xs font-semibold border border-[#FFE6DC] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#006688]">data_object</span>
              <span>Deploy Tool Schema</span>
            </button>
            <button
              onClick={() => onNavigate('visual-tool-builder')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#1D1A23] text-xs font-semibold border border-[#FFE6DC] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#845400]">account_tree</span>
              <span>Tool Builder</span>
            </button>
            <button
              onClick={() => onNavigate('live-voice-playground')}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              <span>Test in Playground</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Blooming Bento Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: End-to-End Latency */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['Outfit'] text-[11px] uppercase tracking-wider text-[#8B716B] font-bold">
                Acoustic Roundtrip
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006688] px-2.5 py-0.5 rounded-full bg-[#C2E8FF]">
                <span className="material-symbols-outlined text-[13px]">bolt</span> Sub-850ms SLA
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Outfit'] text-4xl sm:text-5xl font-extrabold text-[#1D1A23]">680</span>
              <span className="font-['Outfit'] text-lg text-[#57423D] font-semibold">ms</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#57423D] text-xs">
              <span className="material-symbols-outlined text-[#006688] text-[16px]">verified</span>
              <span>99.4% within target window</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#FFE6DC]/60 flex flex-col gap-1.5">
            <div className="w-full h-8 flex items-end gap-1">
              {[40, 60, 50, 75, 85, 70, 62, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-t-sm transition-all ${
                    i === 7 ? 'bg-[#00C2FF] shadow-[0_0_8px_rgba(0,194,255,0.4)]' : 'bg-[#EDE5F2] hover:bg-[#FFDAD2]'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[#8B716B] text-[10px] font-mono uppercase">
              <span>T-60s</span>
              <span>Live Stream</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Live Concurrency */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['Outfit'] text-[11px] uppercase tracking-wider text-[#8B716B] font-bold">
                Live Concurrency
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#643F00] px-2.5 py-0.5 rounded-full bg-[#FFDDB6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFAE33] animate-pulse"></span>
                99.98% Uptime
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Outfit'] text-4xl sm:text-5xl font-extrabold text-[#1D1A23]">142</span>
              <span className="font-['Outfit'] text-lg text-[#57423D] font-semibold">Streams</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#57423D] text-xs">
              <span className="material-symbols-outlined text-[#845400] text-[16px]">dns</span>
              <span>Render 24/7 Keep-Alive Uptime</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between bg-[#FAF9F6] p-2.5 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B716B] font-['Outfit'] block">Peak</span>
              <span className="font-bold text-[#1D1A23]">189 Streams</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#8B716B] font-['Outfit'] block">Drop Rate</span>
              <span className="font-bold text-[#1D1A23]">&lt; 0.02%</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Monthly Unit Consumption */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['Outfit'] text-[11px] uppercase tracking-wider text-[#8B716B] font-bold">
                Unit Burn Rate
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#84240D] px-2.5 py-0.5 rounded-full bg-[#FFDAD2]">
                84.2% Quota
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Outfit'] text-4xl sm:text-5xl font-extrabold text-[#1D1A23]">16.8k</span>
              <span className="font-['Outfit'] text-lg text-[#57423D] font-semibold">/ 20k</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#57423D] text-xs">
              <span className="material-symbols-outlined text-[#FF7E5F] text-[16px]">shield</span>
              <span>+10% Grace Buffer Active</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#FFE6DC]/60 flex flex-col gap-1.5">
            <div className="relative w-full h-3 bg-[#EDE5F2] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-[#00C2FF] via-[#FFAE33] to-[#FF7E5F] rounded-l-full"
                style={{ width: '84%' }}
              ></div>
              <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-white z-10"></div>
            </div>
            <div className="flex justify-between items-center text-[#8B716B] text-[10px] font-mono">
              <span>0</span>
              <span className="text-[#845400] font-semibold">80% Alert</span>
              <span className="text-[#A53B22] font-semibold">100% (20k)</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Registered Operational Tools */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['Outfit'] text-[11px] uppercase tracking-wider text-[#8B716B] font-bold">
                Function Execution
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004D67] px-2.5 py-0.5 rounded-full bg-[#C2E8FF]">
                100% Health
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Outfit'] text-4xl sm:text-5xl font-extrabold text-[#1D1A23]">18</span>
              <span className="font-['Outfit'] text-lg text-[#57423D] font-semibold">Tools</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#57423D] text-xs">
              <span className="material-symbols-outlined text-[#006688] text-[16px]">webhook</span>
              <span>Zero webhook timeouts (24h)</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#FFE6DC]/60 flex flex-wrap gap-1 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[#57423D] border border-[#FFE6DC]">create_task</span>
            <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[#57423D] border border-[#FFE6DC]">refund_order</span>
            <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[#57423D] border border-[#FFE6DC]">lookup_crm</span>
            <span className="px-2 py-0.5 rounded-md bg-[#FFDAD2] text-[#84240D] font-bold">+15 more</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split: Real-Time Stream (Left) & Service Management (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Session Telemetry Stream (Col 8) */}
        <div className="xl:col-span-8 flex flex-col gap-4 bg-white p-6 rounded-3xl border border-[#FFE6DC] shadow-sm">
          {/* Stream Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF7E5F] animate-pulse shadow-[0_0_8px_rgba(255,126,95,0.8)]"></div>
              <h2 className="font-['Outfit'] text-lg font-bold text-[#1D1A23]">
                Live Activity & Call History
              </h2>
              <span className="text-[10px] font-bold text-[#8B716B] bg-[#FAF9F6] border border-[#FFE6DC] px-2 py-0.5 rounded-full uppercase font-['Outfit']">
                REALTIME INGEST
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF9F6] border border-[#FFE6DC] rounded-full text-xs">
              {[
                { id: 'all', label: 'All Calls' },
                { id: 'voice', label: 'Voice Only' },
                { id: 'failed', label: 'Blocked / Failed' },
                { id: 'webhook', label: 'Exceptions' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilter(pill.id as any)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${
                    filter === pill.id
                      ? 'bg-white text-[#1D1A23] shadow-sm font-bold'
                      : 'text-[#57423D] hover:text-[#1D1A23]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF9F6] text-[#8B716B] text-[11px] font-['Outfit'] uppercase tracking-wider border-b border-[#FFE6DC]">
                  <th className="py-2.5 px-3 rounded-l-xl">Caller / Wake Phrase</th>
                  <th className="py-2.5 px-3">Spoken Words & Security</th>
                  <th className="py-2.5 px-3">Run Live Action on App Backend</th>
                  <th className="py-2.5 px-3">Speed Breakdown</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFE6DC]/60 text-xs">
                {filteredTelemetry.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="hover:bg-[#FAF9F6]/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-[#1D1A23]">{item.sessionId}</span>
                          <div className="flex items-center gap-1 text-[#FF5F45] mt-0.5">
                            <span className="material-symbols-outlined text-[13px]">graphic_eq</span>
                            <span className="font-['Outfit'] font-bold text-[10px]">"{item.wakeWord}"</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[240px]">
                        <p className="font-medium text-[#1D1A23] truncate">"{item.transcript}"</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                              item.authStatus === 'verified'
                                ? 'bg-[#C2E8FF] text-[#004D67]'
                                : 'bg-[#FFDAD6] text-[#93000A]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[11px]">
                              {item.authStatus === 'verified' ? 'lock' : 'gpp_bad'}
                            </span>
                            bcrypt:{item.authStatus}
                          </span>
                          <span className="text-[#8B716B]">{item.timeAgo}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-[#A53B22]">{item.actionName}</span>
                          <span className="font-mono text-[10px] text-[#57423D] truncate max-w-[170px]">
                            {item.endpoint}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 min-w-[130px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] text-[#57423D]">
                            <span>Total {item.totalLatency}ms</span>
                            <span className="font-bold text-[#006688]">
                              {item.totalLatency < 700 ? 'Fast' : 'Optimal'}
                            </span>
                          </div>
                          <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-[#EDE5F2]">
                            <div className="h-full bg-[#FFAE33]" style={{ width: `${(item.asrLatency / item.totalLatency) * 100}%` }}></div>
                            <div className="h-full bg-[#FF7E5F]" style={{ width: `${(item.llmLatency / item.totalLatency) * 100}%` }}></div>
                            <div className="h-full bg-[#00C2FF]" style={{ width: `${(item.actLatency / item.totalLatency) * 100}%` }}></div>
                          </div>
                          <span className="text-[9px] text-[#8B716B]">
                            ASR {item.asrLatency} · LLM {item.llmLatency} · Act {item.actLatency}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.status < 300
                              ? 'bg-[#C2E8FF] text-[#004D67]'
                              : 'bg-[#FFDAD6] text-[#93000A]'
                          }`}
                        >
                          {item.statusText}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable JSON details */}
                    {expandedId === item.id && (
                      <tr className="bg-[#FAF9F6]">
                        <td colSpan={5} className="p-4">
                          <div className="rounded-xl bg-[#1D1A23] p-3 text-white font-mono text-[11px]">
                            <div className="flex items-center justify-between pb-1 border-b border-white/10 mb-2">
                              <span className="text-[#FFAE33] font-bold">Execution Payload Context</span>
                              <span className="text-white/60">Voice Confidence: {(item.voiceConfidence * 100).toFixed(1)}%</span>
                            </div>
                            <pre className="text-emerald-300 overflow-x-auto">
                              {JSON.stringify(item.taskPayload, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#FFE6DC]/60 text-xs text-[#57423D]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse"></span>
              <span>WebSocket Stream: Connected (wss://ap-south-1.tas-acoustic.net/feed)</span>
            </div>
            <button
              onClick={() => onShowToast('Exporting Telemetry Logs', 'session_telemetry_20261010.json downloaded')}
              className="text-[#A53B22] hover:underline font-semibold"
            >
              Export JSON Logs →
            </button>
          </div>
        </div>

        {/* Quick Tool Schema & Service Management Widget (Col 4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Active Operational Tools Widget */}
          <div className="bg-white p-6 rounded-3xl border border-[#FFE6DC] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A53B22] text-[20px]">hub</span>
                <h3 className="font-['Outfit'] text-base font-bold text-[#1D1A23]">Active Operational Tools</h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#57423D]">
                18 Loaded
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { name: 'create_task', desc: 'v1.2 · Linear, Jira', icon: 'task_alt', color: '#A53B22' },
                { name: 'refund_order', desc: 'v2.0 · Stripe, Razorpay', icon: 'payments', color: '#845400' },
                { name: 'lookup_crm', desc: 'v3.4 · HubSpot, Salesforce', icon: 'contacts', color: '#006688' }
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex items-center justify-between group hover:bg-[#F8F1FE] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#A53B22] shadow-xs">
                      <span className="material-symbols-outlined text-[16px]">{tool.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono font-bold text-xs text-[#1D1A23] truncate">{tool.name}</span>
                      <span className="text-[10px] text-[#8B716B] truncate">{tool.desc}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTestTool(tool.name)}
                    className="px-3 py-1 rounded-full bg-white hover:bg-[#FF7E5F] hover:text-white text-[#57423D] text-[11px] font-bold border border-[#FFE6DC] transition-all"
                  >
                    Test
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('visual-tool-builder')}
              className="w-full py-2.5 rounded-2xl bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#1D1A23] text-xs font-bold border border-[#FFE6DC] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Visual Schema Builder</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Service Credentials Widget */}
          <div className="bg-white p-6 rounded-3xl border border-[#FFE6DC] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#845400] text-[20px]">security</span>
                <h3 className="font-['Outfit'] text-base font-bold text-[#1D1A23]">Service Credentials</h3>
              </div>
              <span className="text-[10px] font-bold text-[#84240D] bg-[#FFDAD2] px-2 py-0.5 rounded-full font-['Outfit']">
                256-BIT ROTATING
              </span>
            </div>

            {/* Secret Key Field */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B716B] font-['Outfit']">
                Engine Client Secret
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] font-mono text-xs">
                <span className="text-[#1D1A23]">
                  {showSecret ? 'tas_live_89f029148b3049a2' : 'tas_live_89f0••••••••49a2'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[#8B716B] hover:text-[#1D1A23] p-1"
                    title={showSecret ? 'Hide secret' : 'Show secret'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showSecret ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <button
                    onClick={() => copyToClipboard('tas_live_89f029148b3049a2', 'Engine Client Secret')}
                    className="text-[#8B716B] hover:text-[#1D1A23] p-1"
                    title="Copy key"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Inbound Relay URL */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B716B] font-['Outfit']">
                Inbound Voice Relay URL
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] font-mono text-xs">
                <span className="text-[#1D1A23] truncate">https://api.tas.ai/v1/acme/relay</span>
                <button
                  onClick={() => copyToClipboard('https://api.tas.ai/v1/acme/relay', 'Inbound Voice Relay URL')}
                  className="text-[#8B716B] hover:text-[#1D1A23] p-1"
                  title="Copy URL"
                >
                  <span className="material-symbols-outlined text-[16px]">link</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFDAD2]/40 border border-[#FF7E5F]/30 flex items-start gap-2.5 text-xs text-[#57423D]">
              <span className="material-symbols-outlined text-[#A53B22] text-[18px] shrink-0 mt-0.5">verified_user</span>
              <div>
                <p className="font-bold text-[#84240D]">Protected by Voice Passphrase</p>
                <p className="text-[11px] text-[#57423D] leading-snug">
                  High-risk operations execute only when the caller's spoken secret passphrase matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acoustic Engine Architecture Status Bar */}
      <div className="p-4 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] shadow-[0_0_8px_rgba(0,194,255,0.6)]"></span>
            <span className="font-bold text-[#1D1A23]">Gemini Live Multimodal Core</span>
          </div>
          <span className="text-[#DEC0B9] font-mono">|</span>
          <div className="flex items-center gap-1.5 text-[#57423D]">
            <span className="material-symbols-outlined text-[#A53B22] text-[16px]">mic_double</span>
            <span>Whisper ASR: <strong className="text-[#1D1A23]">190ms stream-flush</strong></span>
          </div>
          <span className="hidden lg:inline text-[#DEC0B9] font-mono">|</span>
          <div className="hidden lg:flex items-center gap-1.5 text-[#57423D]">
            <span className="material-symbols-outlined text-[#845400] text-[16px]">terminal</span>
            <span>Tool Execution Runtime: <strong className="text-[#1D1A23]">Node.js V8 isolates</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#8B716B] font-['Outfit'] uppercase">SYSTEM: OPTIMAL</span>
          <button
            onClick={() => onShowToast('Network Topology', 'All 4 regional edge nodes responding in <8ms.')}
            className="px-3 py-1 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#1D1A23] font-bold text-[11px] border border-[#FFE6DC] transition-colors"
          >
            Network Topology →
          </button>
        </div>
      </div>
    </div>
  );
};
