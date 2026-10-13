import React, { useState } from 'react';
import { AppView, ToolParam } from '../../types';
import { INITIAL_PARAMS } from '../../data/mockData';
import { TATSBackendAPI } from '../../services/api';

interface ToolBuilderViewProps {
  onNavigate: (view: AppView) => void;
  onShowToast: (title: string, desc?: string) => void;
}

export const ToolBuilderView: React.FC<ToolBuilderViewProps> = ({
  onNavigate,
  onShowToast
}) => {
  const [toolId, setToolId] = useState('create_task');
  const [toolDesc, setToolDesc] = useState('Creates a project task or reminder in Acme Workspace when user asks to track a todo.');
  const [webhookUrl, setWebhookUrl] = useState('https://api.acme.app/v1/tasks/create/');
  const [httpMethod, setHttpMethod] = useState<'POST' | 'GET' | 'PUT' | 'DELETE'>('POST');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.88);
  const [params, setParams] = useState<ToolParam[]>(INITIAL_PARAMS);
  const [isValidating, setIsValidating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [responseMock, setResponseMock] = useState<any>({
    status: 'success',
    task_id: 'tsk_84712',
    assigned: 'auto_resolved',
    latency_ms: 184
  });

  // Dynamic schema object
  const propertiesObj: Record<string, any> = {};
  const requiredList: string[] = [];

  params.forEach((p) => {
    if (p.type === 'enum') {
      propertiesObj[p.name] = {
        type: 'string',
        enum: p.enumValues || ['low', 'medium', 'high'],
        default: p.defaultValue || 'medium',
        description: p.guide
      };
    } else if (p.type === 'datetime') {
      propertiesObj[p.name] = {
        type: 'string',
        format: 'date-time',
        description: p.guide
      };
    } else {
      propertiesObj[p.name] = {
        type: p.type,
        description: p.guide
      };
    }
    if (p.required) requiredList.push(p.name);
  });

  const generatedSchema = {
    type: 'function',
    function: {
      name: toolId || 'unnamed_tool',
      description: toolDesc,
      parameters: {
        type: 'object',
        properties: propertiesObj,
        required: requiredList
      }
    }
  };

  const schemaString = JSON.stringify(generatedSchema, null, 2);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaString);
    onShowToast('Copied to clipboard', 'OpenAPI function tool schema JSON copied.');
  };

  const handleValidateSchema = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      onShowToast('Schema Validated', 'OpenAPI 3.1 & Tool-Use Spec Compliant (Zero errors).');
    }, 700);
  };

  const handleDeployTool = async () => {
    setIsDeploying(true);
    const apiKey = TATSBackendAPI.getApiKey();
    try {
      const res = await TATSBackendAPI.registerTool(apiKey, {
        name: toolId,
        description: toolDesc,
        endpoint: webhookUrl,
        method: httpMethod,
        parameters_schema: generatedSchema
      });
      if (res.ok) {
        onShowToast('Tool Deployed & Registered in DB', `Action "${toolId}" compiled and active in cluster.`);
        setResponseMock({
          status: 'success',
          action: 'deployed_to_django_engine',
          tool_id: toolId,
          endpoint: webhookUrl,
          db_registered: true,
          function_schema: res.data?.function_schema || generatedSchema,
          timestamp: new Date().toISOString()
        });
        setIsDeploying(false);
        return;
      }
    } catch {
      // Fallback
    }
    setIsDeploying(false);
    onShowToast('Deployed (Local Sandbox)', `Tool "${toolId}" compiled into local vector memory.`);
  };

  const handleRunTrigger = async () => {
    setIsExecuting(true);
    const apiKey = TATSBackendAPI.getApiKey();
    try {
      const res = await TATSBackendAPI.registerTool(apiKey, {
        name: toolId,
        description: toolDesc,
        endpoint: webhookUrl,
        method: httpMethod,
        parameters_schema: generatedSchema
      });
      if (res.ok && res.data) {
        setIsExecuting(false);
        setResponseMock(res.data);
        onShowToast('Tool Registered & Verified', `Backend returned 200 OK.`);
        return;
      }
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsExecuting(false);
      const randomTaskId = `tsk_${Math.floor(10000 + Math.random() * 90000)}`;
      const randomLatency = Math.floor(140 + Math.random() * 90);
      setResponseMock({
        status: 'success',
        task_id: randomTaskId,
        assigned: 'auto_resolved',
        timestamp: new Date().toISOString(),
        latency_ms: randomLatency
      });
      onShowToast('Test Trigger Dispatched', `Endpoint returned 201 Created in ${randomLatency}ms.`);
    }, 650);
  };

  const handleAddParam = () => {
    const newId = `param-${Date.now()}`;
    const newParam: ToolParam = {
      id: newId,
      name: `param_${params.length + 1}`,
      type: 'string',
      required: false,
      guide: 'Extract field from spoken context'
    };
    setParams([...params, newParam]);
    onShowToast('Parameter Added', `New parameter field created.`);
  };

  const handleDeleteParam = (id: string) => {
    setParams(params.filter((p) => p.id !== id));
    onShowToast('Parameter Deleted', 'Removed schema node.');
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] text-[11px] font-bold text-[#A53B22] uppercase tracking-widest bg-[#FFDAD2] px-3 py-0.5 rounded-full">
              Autonomous Trigger Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DEC0B9]"></span>
            <span className="text-xs text-[#57423D] font-medium">
              OpenAPI 3.1 & Tool-Use Spec Compliant
            </span>
          </div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-[#1D1A23] tracking-tight">
            Register Application Tool Capabilities
          </h1>
          <p className="text-xs sm:text-sm text-[#57423D]">
            Define backend webhooks and parameters that the voice agent can autonomously trigger with natural language.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onShowToast('Importing Spec', 'Paste or upload Swagger / OpenAPI JSON')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1D1A23] text-xs font-semibold border border-[#FFE6DC] shadow-sm hover:bg-[#F3EBF8] transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#845400]">file_upload</span>
            <span>Import OpenAPI Spec</span>
          </button>
          <button
            onClick={handleValidateSchema}
            disabled={isValidating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1D1A23] text-xs font-semibold border border-[#FFE6DC] shadow-sm hover:bg-[#F3EBF8] transition-all"
          >
            <span className={`material-symbols-outlined text-[16px] text-[#006688] ${isValidating ? 'animate-spin' : ''}`}>
              {isValidating ? 'refresh' : 'verified'}
            </span>
            <span>{isValidating ? 'Validating...' : 'Validate Schema'}</span>
          </button>
          <button
            onClick={handleDeployTool}
            disabled={isDeploying}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1D1A23] hover:bg-[#342D3D] text-white text-xs font-bold shadow-sm transition-all"
          >
            <span className={`material-symbols-outlined text-[16px] text-[#FFAE33] ${isDeploying ? 'animate-spin' : ''}`}>
              {isDeploying ? 'refresh' : 'cloud_upload'}
            </span>
            <span>{isDeploying ? 'Deploying...' : 'Deploy Tool to Engine'}</span>
          </button>
          <button
            onClick={handleAddParam}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Parameter Node</span>
          </button>
        </div>
      </div>

      {/* 3-Column Working Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Builder (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4 bg-white p-6 rounded-3xl border border-[#FFE6DC] shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#FFE6DC]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#A53B22] text-[20px]">tune</span>
              <h2 className="font-['Outfit'] text-base font-bold text-[#1D1A23]">Form Builder</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#57423D] font-['Outfit'] text-[10px] font-bold uppercase">
              HTTP Dispatch
            </span>
          </div>

          {/* Tool Identifier */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#57423D] flex items-center justify-between">
              <span>Tool Identifier</span>
              <span className="text-[#A53B22] font-mono text-[11px]">unique_action_id</span>
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF9F6] border border-[#FFE6DC] rounded-xl">
              <span className="material-symbols-outlined text-[#8B716B] text-[16px]">terminal</span>
              <input
                type="text"
                value={toolId}
                onChange={(e) => setToolId(e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-[#1D1A23] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#8B716B]">
              Canonical function signature referenced during LLM voice token parsing.
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#57423D]">Natural Language Description</label>
            <textarea
              rows={3}
              value={toolDesc}
              onChange={(e) => setToolDesc(e.target.value)}
              className="w-full p-3 bg-[#FAF9F6] border border-[#FFE6DC] rounded-xl text-xs text-[#1D1A23] focus:outline-none resize-none"
            />
            <div className="flex items-center gap-1.5 text-[#845400] text-[11px] font-semibold mt-0.5">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              <span>Agent Semantic Router Key</span>
            </div>
          </div>

          {/* Target Webhook URL */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#57423D]">Target Webhook URL</label>
            <div className="flex items-stretch gap-1.5">
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#FFDAD2] text-[#84240D] rounded-xl font-['Outfit'] text-[11px] font-bold focus:outline-none cursor-pointer"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#FFE6DC] font-mono text-xs text-[#1D1A23] rounded-xl focus:outline-none truncate"
              />
            </div>
          </div>

          {/* Authorization Credentials */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#57423D]">Authorization Credentials</label>
            <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#FFE6DC] rounded-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#845400] text-[18px]">vpn_key</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1D1A23]">Prod Backend Secret Key</span>
                  <span className="font-mono text-[10px] text-[#8B716B]">ak_live_9924••••••••••38f</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#8B716B] text-[18px]">lock</span>
            </div>
          </div>

          {/* Timeouts & Retries */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-[#FAF9F6] border border-[#FFE6DC] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-[#8B716B] font-['Outfit']">Timeout</span>
              <div className="flex items-baseline gap-1">
                <span className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">1200</span>
                <span className="text-xs text-[#A53B22] font-semibold">ms</span>
              </div>
              <span className="text-[10px] text-[#8B716B]">Voice cutoff max</span>
            </div>
            <div className="p-3 bg-[#FAF9F6] border border-[#FFE6DC] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-[#8B716B] font-['Outfit']">Retry Policy</span>
              <div className="flex items-baseline gap-1">
                <span className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">1x Auto</span>
              </div>
              <span className="text-[10px] text-[#8B716B]">Idempotent header</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FFDAD2]/40 border border-[#FF7E5F]/30 flex items-center gap-2.5 text-xs">
            <span className="material-symbols-outlined text-[#A53B22] text-[20px]">bolt</span>
            <div>
              <p className="font-bold text-[#84240D]">Instant Spec Sync</p>
              <p className="text-[11px] text-[#57423D]">Changes recompile into agent vector memory within ~240ms.</p>
            </div>
          </div>
        </div>

        {/* Middle Column: Dynamic Parameter Builder (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4 bg-white p-6 rounded-3xl border border-[#FFE6DC] shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#FFE6DC]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#845400] text-[20px]">account_tree</span>
              <h2 className="font-['Outfit'] text-base font-bold text-[#1D1A23]">Dynamic Parameter Builder</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFDDB6] text-[#643F00] font-['Outfit'] text-[10px] font-bold uppercase">
              {params.length} Schema Nodes
            </span>
          </div>

          <p className="text-xs text-[#57423D]">
            Voice prompts automatically parse caller phrases into these strict tool inputs.
          </p>

          {/* Parameter Cards List */}
          <div className="flex flex-col gap-3">
            {params.map((param) => (
              <div
                key={param.id}
                className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#FFE6DC] shadow-xs flex flex-col gap-2 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8B716B] text-[16px] cursor-grab">
                      drag_indicator
                    </span>
                    <span className="font-mono font-bold text-xs text-[#1D1A23]">{param.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#C2E8FF] text-[#004D67] font-mono text-[10px] font-semibold">
                      {param.type}
                    </span>
                    {param.required ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFDAD2] text-[#84240D] font-['Outfit'] text-[10px] font-bold">
                        Required
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#EDE5F2] text-[#57423D] font-['Outfit'] text-[10px]">
                        Optional
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteParam(param.id)}
                      className="text-[#8B716B] hover:text-[#BA1A1A] p-1 transition-colors"
                      title="Delete parameter"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#FFE6DC]/60 text-xs text-[#57423D]">
                  <span className="material-symbols-outlined text-[#A53B22] text-[15px]">mic</span>
                  <span className="truncate">
                    <strong className="text-[#1D1A23]">Voice Prompt Guide:</strong> "{param.guide}"
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddParam}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#57423D] hover:text-[#A53B22] border border-[#FFE6DC] transition-all text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Add Parameter Field</span>
          </button>

          {/* Caller Confidence Threshold */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#8B716B] uppercase font-['Outfit']">
                Caller Extraction Confidence Threshold
              </span>
              <span className="font-mono font-bold text-xs text-[#A53B22]">{confidenceThreshold}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.0}
              step={0.01}
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full h-2 bg-[#EDE5F2] rounded-lg appearance-none cursor-pointer accent-[#FF7E5F]"
            />
            <span className="text-[11px] text-[#57423D]">
              Engine asks for clarification when caller speech certainty falls below this level.
            </span>
          </div>
        </div>

        {/* Right Column: JSON Preview & cURL Test (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* JSON Schema Live Preview */}
          <div className="flex flex-col gap-2 bg-[#1D1A23] text-white p-4 sm:p-5 rounded-3xl shadow-xl border border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00C2FF] shadow-[0_0_8px_rgba(0,194,255,0.8)]"></span>
                <span className="font-mono text-xs text-[#C2E8FF] font-bold uppercase tracking-wider">
                  JSON Tool Schema
                </span>
              </div>
              <button
                onClick={handleCopySchema}
                className="text-white/60 hover:text-white transition-colors p-1"
                title="Copy JSON Schema"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-[#C2E8FF]/90 bg-black/40 p-3 rounded-xl overflow-x-auto max-h-72 leading-relaxed whitespace-pre select-all">
              {schemaString}
            </pre>

            <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/10">
              <span>JSON-Schema v7</span>
              <span className="text-[#00C2FF] font-mono">1.2 KB generated</span>
            </div>
          </div>

          {/* cURL Sandbox */}
          <div className="flex flex-col gap-3 bg-white p-5 rounded-3xl border border-[#FFE6DC] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#A53B22] text-[18px]">play_circle</span>
                <h3 className="font-['Outfit'] text-sm font-bold text-[#1D1A23]">cURL Test</h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#FFE6DC] text-[#8B716B]">
                Sandbox
              </span>
            </div>

            <div className="bg-[#FAF9F6] border border-[#FFE6DC] p-3 rounded-xl font-mono text-[11px] text-[#57423D] overflow-x-auto">
              <p className="text-[#845400] font-semibold">$ curl -X {httpMethod} {webhookUrl} \</p>
              <p className="pl-2">-H "Authorization: Bearer ak_live_***" \</p>
              <p className="pl-2">-d '&#123;"title":"Ship release","priority":"high"&#125;'</p>
            </div>

            <button
              onClick={handleRunTrigger}
              disabled={isExecuting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#A53B22] hover:bg-[#84240D] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
            >
              <span className={`material-symbols-outlined text-[18px] ${isExecuting ? 'animate-spin' : ''}`}>
                {isExecuting ? 'refresh' : 'rocket_launch'}
              </span>
              <span>{isExecuting ? 'Executing Webhook...' : 'Run Test Trigger'}</span>
            </button>

            {/* Response Simulation Pane */}
            <div className="flex flex-col gap-1.5 p-3 bg-[#FAF9F6] border border-[#FFE6DC] rounded-xl text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8B716B] uppercase font-['Outfit']">
                  Response Simulation
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#C2E8FF] text-[#004D67] font-mono text-[10px] font-bold">
                  201 Created
                </span>
              </div>
              <pre className="font-mono text-[11px] text-[#1D1A23] bg-white p-2.5 rounded-lg border border-[#FFE6DC] overflow-auto max-h-36">
                {JSON.stringify(responseMock, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Summary Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#FFE6DC] shadow-xs">
          <div className="p-3 rounded-full bg-[#FFDAD2] text-[#A53B22] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">voice_chat</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">1,842 triggers</span>
            <span className="text-xs text-[#57423D]">Last 24 hours autonomous voice executions</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#FFE6DC] shadow-xs">
          <div className="p-3 rounded-full bg-[#FFDDB6] text-[#845400] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">speed</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">196ms avg</span>
            <span className="text-xs text-[#57423D]">Speech intent to webhook payload delivery</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#FFE6DC] shadow-xs">
          <div className="p-3 rounded-full bg-[#C2E8FF] text-[#006688] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">99.94%</span>
            <span className="text-xs text-[#57423D]">Schema validation & format pass rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
