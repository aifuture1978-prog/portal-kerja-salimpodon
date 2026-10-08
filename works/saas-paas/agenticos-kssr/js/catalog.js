/**
 * Model catalogue + routing policy.
 * Direct port of apps/api/app/models/catalog.py — keep the two in sync.
 */

export const Tier = { FREE: 'free', CHEAP: 'cheap', PREMIUM: 'premium', LOCAL: 'local' };

/** @typedef {{slug:string,display_name:string,vendor:string,origin:'china'|'global'|'open',
 *   tier:string,context_window:number,input_price:number,output_price:number,
 *   supports_tools:boolean,supports_vision:boolean,strengths:string[],notes:string}} ModelSpec */

/** @type {ModelSpec[]} — the ten mandated Chinese models */
export const CHINA_MODELS = [
  { slug:'deepseek/deepseek-chat', display_name:'DeepSeek V3', vendor:'DeepSeek', origin:'china', tier:Tier.CHEAP, context_window:64000, input_price:0.27, output_price:1.10, supports_tools:true, supports_vision:false, strengths:['coding','writing','chat'], notes:'Best price/perf generalist' },
  { slug:'deepseek/deepseek-r1', display_name:'DeepSeek R1', vendor:'DeepSeek', origin:'china', tier:Tier.CHEAP, context_window:64000, input_price:0.55, output_price:2.19, supports_tools:true, supports_vision:false, strengths:['reasoning','debug','math'], notes:'Chain-of-thought reasoning' },
  { slug:'qwen/qwen-2.5-72b-instruct', display_name:'Qwen 2.5 72B', vendor:'Alibaba Qwen', origin:'china', tier:Tier.CHEAP, context_window:32768, input_price:0.35, output_price:0.40, supports_tools:true, supports_vision:false, strengths:['coding','multilingual','tools'], notes:'Strong multilingual + tool use' },
  { slug:'qwen/qwen3-235b-a22b', display_name:'Qwen 3 (235B A22B)', vendor:'Alibaba Qwen', origin:'china', tier:Tier.CHEAP, context_window:131072, input_price:0.22, output_price:0.88, supports_tools:true, supports_vision:false, strengths:['coding','reasoning','long-context'], notes:'MoE, cheap long context' },
  { slug:'moonshotai/kimi-k2', display_name:'Kimi K2', vendor:'Moonshot AI', origin:'china', tier:Tier.CHEAP, context_window:131072, input_price:0.55, output_price:2.50, supports_tools:true, supports_vision:false, strengths:['writing','long-context','agentic'], notes:'Excellent long-form writer' },
  { slug:'z-ai/glm-4-plus', display_name:'GLM-4-Plus', vendor:'Zhipu AI', origin:'china', tier:Tier.CHEAP, context_window:128000, input_price:0.60, output_price:0.60, supports_tools:true, supports_vision:true, strengths:['writing','chinese','vision'], notes:'Bilingual CN/EN, vision capable' },
  { slug:'minimax/minimax-01', display_name:'MiniMax-Text-01', vendor:'MiniMax', origin:'china', tier:Tier.CHEAP, context_window:1000000, input_price:0.20, output_price:1.10, supports_tools:true, supports_vision:false, strengths:['long-context','summarise'], notes:'1M context window' },
  { slug:'baichuan/baichuan4', display_name:'Baichuan 4', vendor:'Baichuan AI', origin:'china', tier:Tier.CHEAP, context_window:32000, input_price:0.70, output_price:0.70, supports_tools:true, supports_vision:false, strengths:['chinese','writing'], notes:'Strong Chinese fluency' },
  { slug:'01-ai/yi-large', display_name:'Yi-Large', vendor:'01.AI', origin:'china', tier:Tier.CHEAP, context_window:32000, input_price:3.00, output_price:3.00, supports_tools:true, supports_vision:false, strengths:['writing','bilingual'], notes:'Bilingual reasoning' },
  { slug:'tencent/hunyuan-large', display_name:'Hunyuan-Large', vendor:'Tencent', origin:'china', tier:Tier.CHEAP, context_window:128000, input_price:0.80, output_price:1.20, supports_tools:true, supports_vision:false, strengths:['writing','chinese','enterprise'], notes:'Enterprise-grade Chinese' },
];

/**
 * @type {ModelSpec[]} — 2026 frontier wave.
 *
 * The first-generation Chinese catalogue above is what the router was designed
 * against; this block is what a 2026 deployment actually reaches for. The
 * distinguishing feature of this wave is that every one of them was trained for
 * *tool calling and long-horizon agent loops* rather than chat, which is exactly
 * the workload an Agentic OS generates: dozens of short calls with structured
 * JSON in and structured JSON out, stitched into a graph.
 *
 * Prices are the vendors' standard text rates in USD per 1M tokens. Context
 * windows are the vendor-published numbers. Where a vendor has not published a
 * figure we keep the previous generation's value and say so in `notes` rather
 * than inventing one.
 */
export const FRONTIER_MODELS = [
  /* ---- Moonshot AI: the swarm / long-horizon specialist ---- */
  { slug:'moonshotai/kimi-k2.6', display_name:'Kimi K2.6', vendor:'Moonshot AI', origin:'china', tier:Tier.CHEAP, context_window:256000, input_price:0.60, output_price:2.50, supports_tools:true, supports_vision:true, strengths:['agentic','swarm','long-context','writing'], notes:'Swarm mode — spawns ~100 role-scoped sub-agents in one run' },
  { slug:'moonshotai/kimi-k2.7-code', display_name:'Kimi K2.7 Code', vendor:'Moonshot AI', origin:'china', tier:Tier.CHEAP, context_window:1000000, input_price:0.80, output_price:3.00, supports_tools:true, supports_vision:false, strengths:['coding','refactor','agentic'], notes:'Trillion-parameter MoE tuned for code agents' },

  /* ---- Zhipu AI: enterprise agent + whole-repo context ---- */
  { slug:'z-ai/glm-5.2', display_name:'GLM-5.2', vendor:'Zhipu AI', origin:'china', tier:Tier.CHEAP, context_window:1000000, input_price:1.00, output_price:3.20, supports_tools:true, supports_vision:true, strengths:['agentic','long-context','coding','chinese'], notes:'753B MoE · MIT licence · whole-repo context' },
  { slug:'z-ai/glm-4.7', display_name:'GLM-4.7', vendor:'Zhipu AI', origin:'china', tier:Tier.CHEAP, context_window:200000, input_price:0.60, output_price:2.20, supports_tools:true, supports_vision:true, strengths:['agentic','tools','enterprise'], notes:'Agentic coding + multi-tool orchestration, 8h+ autonomous runs' },

  /* ---- MiniMax: the self-orchestrating harness ---- */
  { slug:'minimax/minimax-m2.7', display_name:'MiniMax-M2.7', vendor:'MiniMax', origin:'china', tier:Tier.CHEAP, context_window:204800, input_price:0.30, output_price:1.20, supports_tools:true, supports_vision:false, strengths:['agentic','tools','coding'], notes:'229B MoE / 10B active · builds its own agent harness + teams' },
  { slug:'minimax/minimax-m3', display_name:'MiniMax M3', vendor:'MiniMax', origin:'china', tier:Tier.CHEAP, context_window:400000, input_price:0.40, output_price:1.60, supports_tools:true, supports_vision:true, strengths:['coding','agentic','refactor'], notes:'Coding-agent flagship of the M3 line' },

  /* ---- DeepSeek: price/performance at scale ---- */
  { slug:'deepseek/deepseek-v4-pro', display_name:'DeepSeek V4 Pro', vendor:'DeepSeek', origin:'china', tier:Tier.CHEAP, context_window:1000000, input_price:0.35, output_price:1.40, supports_tools:true, supports_vision:false, strengths:['reasoning','coding','long-context'], notes:'1.6T MoE / ~49B active · 384K max output' },
  { slug:'deepseek/deepseek-v3.2', display_name:'DeepSeek V3.2 Thinking', vendor:'DeepSeek', origin:'china', tier:Tier.CHEAP, context_window:160000, input_price:0.28, output_price:1.10, supports_tools:true, supports_vision:false, strengths:['reasoning','debug','math'], notes:'Hybrid thinking mode — toggles instant vs deep' },

  /* ---- Alibaba Qwen: multimodal + the cheap MoE coder ---- */
  { slug:'qwen/qwen3-max', display_name:'Qwen3-Max', vendor:'Alibaba Qwen', origin:'china', tier:Tier.PREMIUM, context_window:1000000, input_price:1.20, output_price:6.00, supports_tools:true, supports_vision:true, strengths:['multimodal','enterprise','reasoning'], notes:'Flagship — image, video and audio understanding' },
  { slug:'qwen/qwen3.6-35b-a3b', display_name:'Qwen3.6 35B-A3B', vendor:'Alibaba Qwen', origin:'china', tier:Tier.CHEAP, context_window:262144, input_price:0.12, output_price:0.60, supports_tools:true, supports_vision:false, strengths:['coding','agentic','cheap'], notes:'MoE, ~3B active per token — cheapest agentic coder' },

  /* ---- Xiaomi MiMo: the efficiency story ---- */
  { slug:'xiaomi/mimo-v2-flash', display_name:'MiMo-V2-Flash', vendor:'Xiaomi', origin:'china', tier:Tier.CHEAP, context_window:262144, input_price:0.10, output_price:0.30, supports_tools:true, supports_vision:false, strengths:['agentic','coding','reasoning','cheap'], notes:'309B MoE / 15B active · SWE-bench Verified 73.4 · MIT' },
  { slug:'xiaomi/mimo-v2.5-pro', display_name:'MiMo V2.5 Pro', vendor:'Xiaomi', origin:'china', tier:Tier.CHEAP, context_window:1048576, input_price:0.50, output_price:2.00, supports_tools:true, supports_vision:true, strengths:['agentic','multimodal','long-context'], notes:'1.02T MoE · native multimodal · SWE-bench ~78.9' },

  /* ---- StepFun ---- */
  { slug:'stepfun/step-3', display_name:'Step-3', vendor:'StepFun', origin:'china', tier:Tier.CHEAP, context_window:262144, input_price:0.25, output_price:1.00, supports_tools:true, supports_vision:true, strengths:['multimodal','reasoning','agentic'], notes:'321B MoE / 38B active multimodal reasoner' },
  { slug:'stepfun/step-3-vl-10b', display_name:'Step3-VL-10B', vendor:'StepFun', origin:'china', tier:Tier.CHEAP, context_window:65536, input_price:0.05, output_price:0.20, supports_tools:true, supports_vision:true, strengths:['vision','classify','cheap'], notes:'10B vision-language — runs on edge hardware' },

  /* ---- The rest of the big-five and the open-weight challengers ---- */
  { slug:'tencent/hunyuan-hy3', display_name:'Hunyuan Hy3', vendor:'Tencent', origin:'china', tier:Tier.CHEAP, context_window:256000, input_price:0.30, output_price:1.20, supports_tools:true, supports_vision:true, strengths:['agentic','chinese','enterprise'], notes:'Top of the 2026 global call-volume leaderboard' },
  { slug:'baidu/ernie-5.0', display_name:'ERNIE 5.0', vendor:'Baidu', origin:'china', tier:Tier.CHEAP, context_window:128000, input_price:0.40, output_price:1.60, supports_tools:true, supports_vision:true, strengths:['chinese','enterprise','writing'], notes:'Baidu flagship — deep Chinese enterprise coverage' },
  { slug:'bytedance/doubao-seed-1.8', display_name:'Doubao Seed 1.8', vendor:'ByteDance', origin:'china', tier:Tier.CHEAP, context_window:256000, input_price:0.15, output_price:0.60, supports_tools:true, supports_vision:true, strengths:['chat','multimodal','cheap'], notes:'Volcano Engine flagship — very high throughput' },
  { slug:'meituan/longcat-flash', display_name:'LongCat Flash', vendor:'Meituan', origin:'china', tier:Tier.CHEAP, context_window:128000, input_price:0.08, output_price:0.30, supports_tools:true, supports_vision:false, strengths:['cheap','classify','fast'], notes:'Ultra-cheap high-throughput MoE — good for bulk classify' },
  { slug:'inclusionai/ling-2.0', display_name:'Ling 2.0', vendor:'Ant Group', origin:'china', tier:Tier.CHEAP, context_window:262144, input_price:0.20, output_price:0.80, supports_tools:true, supports_vision:false, strengths:['reasoning','agentic','chinese'], notes:'Open-weight reasoning MoE from Ant Group (InclusionAI)' },
];

/** @type {ModelSpec[]} — mandated global models */
export const GLOBAL_MODELS = [
  { slug:'google/gemini-2.0-flash-001', display_name:'Gemini 2.0 Flash', vendor:'Google', origin:'global', tier:Tier.CHEAP, context_window:1000000, input_price:0.10, output_price:0.40, supports_tools:true, supports_vision:true, strengths:['design','vision','fast','cheap'], notes:'Default workhorse' },
  { slug:'google/gemini-2.0-pro-exp-02-05', display_name:'Gemini 2.0 Pro', vendor:'Google', origin:'global', tier:Tier.PREMIUM, context_window:2000000, input_price:1.25, output_price:5.00, supports_tools:true, supports_vision:true, strengths:['reasoning','long-context','vision'], notes:'Huge context, premium' },
  { slug:'anthropic/claude-3.5-sonnet', display_name:'Claude 3.5 Sonnet', vendor:'Anthropic', origin:'global', tier:Tier.PREMIUM, context_window:200000, input_price:3.00, output_price:15.00, supports_tools:true, supports_vision:true, strengths:['coding','refactor','qa','agentic'], notes:'Best-in-class code quality' },
  { slug:'anthropic/claude-3.5-haiku', display_name:'Claude 3.5 Haiku', vendor:'Anthropic', origin:'global', tier:Tier.CHEAP, context_window:200000, input_price:0.80, output_price:4.00, supports_tools:true, supports_vision:false, strengths:['qa','classify','fast'], notes:'Cheap reviewer/classifier' },
  { slug:'perplexity/sonar', display_name:'Perplexity Sonar', vendor:'Perplexity', origin:'global', tier:Tier.CHEAP, context_window:127000, input_price:1.00, output_price:1.00, supports_tools:false, supports_vision:false, strengths:['research','web'], notes:'Live web grounding' },
  { slug:'perplexity/sonar-pro', display_name:'Perplexity Sonar Pro', vendor:'Perplexity', origin:'global', tier:Tier.PREMIUM, context_window:200000, input_price:3.00, output_price:15.00, supports_tools:false, supports_vision:false, strengths:['research','web','deep'], notes:'Multi-hop research' },
];

/** @type {ModelSpec[]} — the free rung, tried first */
export const FREE_MODELS = [
  { slug:'google/gemini-2.0-flash-exp:free', display_name:'Gemini 2.0 Flash (free)', vendor:'Google', origin:'open', tier:Tier.FREE, context_window:1000000, input_price:0, output_price:0, supports_tools:true, supports_vision:true, strengths:['chat','design','vision','fast'], notes:'Free default' },
  { slug:'deepseek/deepseek-r1:free', display_name:'DeepSeek R1 (free)', vendor:'DeepSeek', origin:'open', tier:Tier.FREE, context_window:64000, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['reasoning','debug'], notes:'Free reasoning' },
  { slug:'deepseek/deepseek-chat-v3-0324:free', display_name:'DeepSeek V3 (free)', vendor:'DeepSeek', origin:'open', tier:Tier.FREE, context_window:64000, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['coding','chat'], notes:'Free coder' },
  { slug:'qwen/qwen-2.5-72b-instruct:free', display_name:'Qwen 2.5 72B (free)', vendor:'Alibaba Qwen', origin:'open', tier:Tier.FREE, context_window:32768, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['coding','multilingual'], notes:'Free multilingual' },
  { slug:'qwen/qwen3-235b-a22b:free', display_name:'Qwen 3 235B (free)', vendor:'Alibaba Qwen', origin:'open', tier:Tier.FREE, context_window:131072, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['coding','reasoning'], notes:'Free MoE' },
  { slug:'moonshotai/kimi-k2:free', display_name:'Kimi K2 (free)', vendor:'Moonshot AI', origin:'open', tier:Tier.FREE, context_window:131072, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['writing','long-context'], notes:'Free writer' },
  { slug:'z-ai/glm-4.5-air:free', display_name:'GLM-4.5 Air (free)', vendor:'Zhipu AI', origin:'open', tier:Tier.FREE, context_window:128000, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['writing','chinese'], notes:'Free GLM tier' },
  { slug:'meta-llama/llama-3.3-70b-instruct:free', display_name:'Llama 3.3 70B (free)', vendor:'Meta', origin:'open', tier:Tier.FREE, context_window:131072, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['chat','summarise'], notes:'Free open weights' },
  { slug:'mistralai/mistral-small-3.2-24b-instruct:free', display_name:'Mistral Small 3.2 (free)', vendor:'Mistral', origin:'open', tier:Tier.FREE, context_window:128000, input_price:0, output_price:0, supports_tools:true, supports_vision:true, strengths:['classify','fast'], notes:'Free small + vision' },
  { slug:'meta-llama/llama-3.2-3b-instruct:free', display_name:'Llama 3.2 3B (free)', vendor:'Meta', origin:'open', tier:Tier.FREE, context_window:131072, input_price:0, output_price:0, supports_tools:false, supports_vision:false, strengths:['classify','summarise'], notes:'Micro model for trivial tasks' },

  /* ---- 2026 frontier models with a community/free rung ---- */
  { slug:'moonshotai/kimi-k2.6:free', display_name:'Kimi K2.6 (free)', vendor:'Moonshot AI', origin:'open', tier:Tier.FREE, context_window:256000, input_price:0, output_price:0, supports_tools:true, supports_vision:true, strengths:['agentic','writing','long-context'], notes:'Free swarm rung' },
  { slug:'z-ai/glm-5.2:free', display_name:'GLM-5.2 (free)', vendor:'Zhipu AI', origin:'open', tier:Tier.FREE, context_window:1000000, input_price:0, output_price:0, supports_tools:true, supports_vision:true, strengths:['agentic','long-context','chinese'], notes:'Free 1M-context rung' },
  { slug:'minimax/minimax-m2.7:free', display_name:'MiniMax-M2.7 (free)', vendor:'MiniMax', origin:'open', tier:Tier.FREE, context_window:204800, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['agentic','tools'], notes:'Free agent-harness rung' },
  { slug:'xiaomi/mimo-v2-flash:free', display_name:'MiMo-V2-Flash (free)', vendor:'Xiaomi', origin:'open', tier:Tier.FREE, context_window:262144, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['coding','agentic'], notes:'Free MiMo rung' },
  { slug:'deepseek/deepseek-v4-pro:free', display_name:'DeepSeek V4 Pro (free)', vendor:'DeepSeek', origin:'open', tier:Tier.FREE, context_window:1000000, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['reasoning','coding'], notes:'Free 1M-context reasoner' },
  { slug:'qwen/qwen3.6-35b-a3b:free', display_name:'Qwen3.6 35B-A3B (free)', vendor:'Alibaba Qwen', origin:'open', tier:Tier.FREE, context_window:262144, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['coding','agentic'], notes:'Free efficient MoE coder' },
  { slug:'tencent/hunyuan-hy3:free', display_name:'Hunyuan Hy3 (free)', vendor:'Tencent', origin:'open', tier:Tier.FREE, context_window:256000, input_price:0, output_price:0, supports_tools:true, supports_vision:false, strengths:['chinese','agentic'], notes:'Free Chinese agent rung' },
];

export const ALL_MODELS = [...FREE_MODELS, ...FRONTIER_MODELS, ...CHINA_MODELS, ...GLOBAL_MODELS];
export const CATALOG = Object.fromEntries(ALL_MODELS.map((m) => [m.slug, m]));

export const isFree = (m) => m.tier === Tier.FREE;
/** Blended cost per 1M tokens assuming a 3:1 prompt:completion split. */
export const blendedCost = (m) => m.input_price * 0.75 + m.output_price * 0.25;

/* ---------------------------------------------------------------------------
 * Per-task routing policy. Order matters: the router walks left to right,
 * skipping any model that is rate-limited, over budget or missing a capability.
 *
 * 2026 note — the ladder is deliberately *mixed-vendor*. Free rungs come first
 * (the router's `preferFree` sort re-orders anyway), then a cheap Chinese
 * specialist, then a frontier Chinese model, then a premium Western model as
 * the last resort. That last rung is what a healthy ladder looks like: reached
 * rarely, but present so a task never fails outright.
 * ------------------------------------------------------------------------- */
export const TASK_POLICY = {
  coding:    ['xiaomi/mimo-v2-flash:free','deepseek/deepseek-chat-v3-0324:free','qwen/qwen3.6-35b-a3b','xiaomi/mimo-v2-flash','moonshotai/kimi-k2.7-code','deepseek/deepseek-v4-pro','anthropic/claude-3.5-sonnet'],
  refactor:  ['moonshotai/kimi-k2.7-code','deepseek/deepseek-v4-pro','minimax/minimax-m3','z-ai/glm-5.2','anthropic/claude-3.5-sonnet'],
  debug:     ['deepseek/deepseek-v3.2','deepseek/deepseek-v4-pro','deepseek/deepseek-r1','z-ai/glm-4.7','anthropic/claude-3.5-sonnet'],
  research:  ['perplexity/sonar','perplexity/sonar-pro','qwen/qwen3-max','google/gemini-2.0-flash-001'],
  writing:   ['moonshotai/kimi-k2.6:free','z-ai/glm-4.5-air:free','moonshotai/kimi-k2.6','z-ai/glm-5.2','baidu/ernie-5.0','tencent/hunyuan-hy3'],
  design:    ['z-ai/glm-5.2:free','google/gemini-2.0-flash-exp:free','z-ai/glm-5.2','stepfun/step-3','qwen/qwen3-max'],
  qa:        ['minimax/minimax-m2.7:free','mistralai/mistral-small-3.2-24b-instruct:free','minimax/minimax-m2.7','z-ai/glm-4.7','anthropic/claude-3.5-haiku'],
  automation:['z-ai/glm-4.7','minimax/minimax-m2.7','qwen/qwen-2.5-72b-instruct','deepseek/deepseek-chat'],
  summarise: ['z-ai/glm-5.2:free','meta-llama/llama-3.3-70b-instruct:free','z-ai/glm-5.2','qwen/qwen3-max','minimax/minimax-01'],
  classify:  ['meituan/longcat-flash','meta-llama/llama-3.2-3b-instruct:free','stepfun/step-3-vl-10b','qwen/qwen3.6-35b-a3b'],
  chat:      ['deepseek/deepseek-v4-pro:free','google/gemini-2.0-flash-exp:free','bytedance/doubao-seed-1.8','deepseek/deepseek-v4-pro','google/gemini-2.0-flash-001'],
  image:     ['stepfun/step-3-vl-10b','google/gemini-2.0-flash-exp:free','qwen/qwen3-max'],
  video:     ['qwen/qwen3-max','google/gemini-2.0-flash-001'],
  quiz:      ['qwen/qwen3.6-35b-a3b:free','google/gemini-2.0-flash-exp:free','tencent/hunyuan-hy3','qwen/qwen3.6-35b-a3b'],
  game:      ['xiaomi/mimo-v2-flash','deepseek/deepseek-chat-v3-0324:free','minimax/minimax-m3'],
  /* ---- the two tasks an agentic runtime actually spends its budget on ---- */
  agentic:   ['minimax/minimax-m2.7:free','z-ai/glm-5.2:free','minimax/minimax-m2.7','z-ai/glm-4.7','moonshotai/kimi-k2.6','xiaomi/mimo-v2.5-pro'],
  tool_use:  ['z-ai/glm-4.7','minimax/minimax-m2.7','tencent/hunyuan-hy3','z-ai/glm-5.2','anthropic/claude-3.5-sonnet'],
};

export const TASK_LABELS = {
  coding:'Coding', refactor:'Refactor', debug:'Debug', research:'Research', writing:'Writing',
  design:'Design', qa:'QA review', automation:'Automation', summarise:'Summarise',
  classify:'Classify', chat:'Chat', image:'Image', video:'Video', quiz:'Quiz', game:'Game',
  agentic:'Agentic loop', tool_use:'Tool orchestration',
};

/**
 * The built-in agents.
 *
 * Each agent declares a *preferred* model and a fallback list, but the router
 * treats them as a hint only — capability filters and cooldowns can push a call
 * down the ladder at any time. The preferred models below are the ones that
 * won the 2026 head-to-heads for that workload, not the ones with the biggest
 * marketing budget.
 */
export const AGENTS = [
  { key:'orchestrator', name:'Orchestrator', task:'agentic', model:'minimax/minimax-m2.7', fallback:['z-ai/glm-4.7','moonshotai/kimi-k2.6'], desc:'Decomposes a goal into an ordered plan of sub-tasks and delegates to specialist agents.' },
  { key:'coder', name:'Coder', task:'coding', model:'moonshotai/kimi-k2.7-code', fallback:['xiaomi/mimo-v2-flash','qwen/qwen3.6-35b-a3b','deepseek/deepseek-v4-pro'], desc:'Generates, refactors, debugs and tests code across JS/TS, Python, PHP, Go, Rust, SQL.' },
  { key:'designer', name:'Designer', task:'design', model:'z-ai/glm-5.2', fallback:['stepfun/step-3','qwen/qwen3-max'], desc:'Turns requirements into UI structure, design tokens and Tailwind/shadcn components.' },
  { key:'researcher', name:'Researcher', task:'research', model:'perplexity/sonar', fallback:['perplexity/sonar-pro','qwen/qwen3-max'], desc:'Grounded web research with inline citations.' },
  { key:'writer', name:'Writer', task:'writing', model:'moonshotai/kimi-k2.6', fallback:['z-ai/glm-5.2','baidu/ernie-5.0'], desc:'Long-form copy, docs, marketing and localisation (EN/MS/ZH).' },
  { key:'qa', name:'QA', task:'qa', model:'minimax/minimax-m2.7', fallback:['z-ai/glm-4.7','anthropic/claude-3.5-haiku'], desc:'Reviews artefacts for correctness, security and edge cases.' },
  { key:'automation', name:'Automation', task:'tool_use', model:'z-ai/glm-4.7', fallback:['minimax/minimax-m2.7','tencent/hunyuan-hy3'], desc:'Builds n8n-style connector workflows with triggers, branches and retries.' },
  { key:'creative', name:'Creative', task:'image', model:'stepfun/step-3-vl-10b', fallback:['qwen/qwen3-max','google/gemini-2.0-flash-001'], desc:'Image, video storyboard, infographic and mind-map generation.' },
  { key:'tutor', name:'Tutor', task:'quiz', model:'qwen/qwen3.6-35b-a3b', fallback:['tencent/hunyuan-hy3','google/gemini-2.0-flash-exp:free'], desc:'Illustrated quizzes and playable educational games aligned to a syllabus.' },
  { key:'deploy', name:'Deploy', task:'automation', model:'deepseek/deepseek-v4-pro', fallback:['xiaomi/mimo-v2-flash','z-ai/glm-4.7'], desc:'Builds Docker/CI config and drives one-click deploys.' },
  { key:'swarm', name:'Swarm', task:'agentic', model:'moonshotai/kimi-k2.6', fallback:['moonshotai/kimi-k2.6:free','xiaomi/mimo-v2.5-pro'], desc:'Fans one goal out to ~100 role-scoped sub-agents, then merges their output.' },
  { key:'longctx', name:'Long Context', task:'summarise', model:'z-ai/glm-5.2', fallback:['deepseek/deepseek-v4-pro','xiaomi/mimo-v2.5-pro'], desc:'Reads a whole repository, year of minutes or 300-page DSKP in one pass.' },
  { key:'mimo', name:'MiMo Coder', task:'coding', model:'xiaomi/mimo-v2-flash', fallback:['xiaomi/mimo-v2.5-pro','qwen/qwen3.6-35b-a3b'], desc:'Budget-first coding agent — 309B MoE with 15B active, built for tool loops.' },
];

/**
 * KSSR education agents (this edition). They run through the exact same
 * ModelRouter — an education workload is still a routing problem.
 *
 * The 2026 routing choices are not cosmetic: an RPH is a long, structured,
 * BM-language document, which is Kimi K2.6's home ground; DSKP mapping is a
 * whole-document read, which is what GLM-5.2's 1M window is for; PBD item
 * writing is a tool-loop over a marking scheme, which is where MiniMax-M2.7
 * and GLM-4.7 beat the older generalists.
 */
export const KSSR_AGENTS = [
  { key:'rph',     name:'Agen RPH',       task:'writing',    model:'moonshotai/kimi-k2.6', fallback:['z-ai/glm-5.2','moonshotai/kimi-k2.6:free','z-ai/glm-4.5-air:free'], desc:'Rancangan Pengajaran Harian penuh — standard, objektif, aktiviti PdPc, EMK, KBAT, penilaian, refleksi.' },
  { key:'dskp',    name:'Agen DSKP',      task:'summarise',  model:'z-ai/glm-5.2', fallback:['deepseek/deepseek-v4-pro','xiaomi/mimo-v2.5-pro','z-ai/glm-5.2:free'], desc:'Memetakan Standard Kandungan dan Standard Pembelajaran serta mencadangkan urutan pengajaran.' },
  { key:'pbd',     name:'Agen Pentaksiran', task:'qa',       model:'minimax/minimax-m2.7', fallback:['z-ai/glm-4.7','minimax/minimax-m2.7:free','anthropic/claude-3.5-haiku'], desc:'Item pentaksiran, deskriptor Tahap Penguasaan 1–6 dan pelan intervensi.' },
  { key:'bbm',     name:'Agen BBM',       task:'design',     model:'xiaomi/mimo-v2.5-pro', fallback:['z-ai/glm-5.2','stepfun/step-3','qwen/qwen3-max'], desc:'Bahan bantu mengajar — lembaran kerja, kad imbas, infografik, peta minda.' },
  { key:'panitia', name:'Agen Panitia',   task:'automation', model:'z-ai/glm-4.7', fallback:['minimax/minimax-m2.7','deepseek/deepseek-v4-pro'], desc:'RPT, minit mesyuarat panitia, analisis item dan pelan intervensi.' },
  { key:'bahasa',  name:'Agen Bahasa',    task:'writing',    model:'z-ai/glm-5.2', fallback:['baidu/ernie-5.0','tencent/hunyuan-hy3','z-ai/glm-4-plus'], desc:'Dwibahasa BM/BI dan bahasa ibunda — Kadazandusun, Iban, Semai.' },
  { key:'admin',   name:'Agen Pentadbiran', task:'classify', model:'qwen/qwen3.6-35b-a3b', fallback:['meituan/longcat-flash','tencent/hunyuan-hy3'], desc:'Enrolmen, APDM/EMIS, inventori dan laporan pentadbiran sekolah.' },
  { key:'orkestra', name:'Agen Orkestrasi', task:'agentic',  model:'minimax/minimax-m2.7', fallback:['z-ai/glm-4.7','moonshotai/kimi-k2.6'], desc:'Mengorkestrasi rantaian agen — pencetus, nod, webhook dan laluan selari untuk kerja panitia.' },
];

AGENTS.push(...KSSR_AGENTS);

/** System prompts — same contracts the FastAPI agents enforce. */
export const SYSTEM_PROMPTS = {
  orchestrator: `You are the Orchestrator of an agentic platform. Break the user's goal into the smallest useful set of sub-tasks. Assign each to exactly one agent from: orchestrator, coder, designer, researcher, writer, qa, automation, creative, tutor, deploy, swarm, longctx, mimo, rph, dskp, pbd, bbm, panitia, bahasa, admin. Mark steps that can run in parallel by giving them the same dependency depth. Return ONLY JSON: {"goal": str, "steps": [{"id": int, "agent": str, "title": str, "instruction": str, "depends_on": [int], "expected_output": str}], "risks": [str], "definition_of_done": [str]}`,
  coder: `You are a senior full-stack engineer. Produce production-quality, typed code. Prefer standard library and well-maintained packages. Never invent APIs. Return ONLY JSON: {"summary": str, "language": str, "files": [{"path": str, "action": "create|update|delete", "content": str}], "tests": [{"path": str, "content": str}], "run_commands": [str], "notes": [str]}`,
  designer: `You are a product designer and frontend engineer. Respect WCAG 2.1 AA, an 8pt spacing grid, a 12px radius and an indigo/violet accent. Return ONLY JSON: {"page": str, "layout": str, "components": [{"name": str, "purpose": str, "code": str}], "tokens": {"colors": {}, "spacing": {}, "type": {}}, "a11y_notes": [str]}`,
  researcher: `You are a research analyst. Cite sources inline as [n] and list them. Separate fact from inference. Return ONLY JSON: {"question": str, "answer": str, "key_findings": [str], "sources": [{"title": str, "url": str}], "confidence": "low|medium|high", "open_questions": [str]}`,
  writer: `You are a senior copywriter and technical writer. Match the requested tone, avoid filler, use concrete nouns and active voice. Return ONLY JSON: {"title": str, "format": str, "content_md": str, "variants": [{"label": str, "content_md": str}], "word_count": int, "seo_keywords": [str]}`,
  qa: `You are a rigorous QA engineer. Hunt for real defects, not style nits. Return ONLY JSON: {"verdict": "pass|pass_with_notes|fail", "score": int, "issues": [{"severity": "critical|high|medium|low", "location": str, "problem": str, "fix": str}], "missing_tests": [str], "security_notes": [str]}`,
  automation: `You are an integration engineer. Produce an executable workflow graph of nodes and edges. Every graph needs exactly one trigger node, and every node after it must be reachable from that trigger. Return ONLY JSON: {"name": str, "trigger": {"type": "webhook|cron|email|chat|file", "config": {}}, "nodes": [{"id": str, "type": str, "connector": str, "config": {}, "depends_on": [str]}], "edges": [{"source": str, "target": str, "condition": str|null}], "outbound_webhooks": [{"name": str, "url": str, "method": str, "headers": {}}], "error_handling": {"retries": int, "backoff": str, "on_failure": str}}`,
  creative: `You are a prompt engineer for image models. Return ONLY JSON: {"prompt": str, "negative_prompt": str, "aspect_ratio": str, "style": str, "variations": [str]}.`,
  tutor: `You are a Tutor Agent that builds illustrated quizzes. Return ONLY JSON: {"title": str, "subject": str, "level": str, "questions": [{"id": int, "type": "mcq|truefalse", "question": str, "image_prompt": str, "options": [str], "answer_index": int, "explanation": str, "difficulty": "easy|medium|hard", "points": int}]}`,
  deploy: `You are a DevOps engineer. Produce minimal, secure deployment artefacts. Return ONLY JSON: {"target": str, "dockerfile": str, "compose_service": str, "env_vars": [{"key": str, "required": bool, "description": str}], "ci_steps": [str], "rollback": str, "healthcheck": str}`,
  swarm: `You are a Swarm Controller. Fan the goal out to role-scoped sub-agents, then merge their results. Prefer breadth over depth: many narrow agents beat one wide one. Return ONLY JSON: {"goal": str, "agents": [{"id": str, "role": str, "scope": str, "model_hint": str}], "merge_strategy": "concatenate|vote|synthesise|rank", "conflict_rules": [str], "budget_tokens": int, "stop_condition": str}`,
  longctx: `You are a long-context analyst. You receive very large documents. Answer only from the supplied text, cite section or page numbers, and say "not in the document" when the answer is absent. Return ONLY JSON: {"question": str, "answer": str, "citations": [{"section": str, "page": str, "quote": str}], "coverage": "full|partial|none", "missing": [str]}`,
  mimo: `You are a budget-first coding agent running a tool loop. Solve the task with the fewest tool calls that still verify the result. Return ONLY JSON: {"summary": str, "steps": [{"n": int, "tool": str, "args": {}, "result": str}], "patch": str, "verified": bool, "tokens_spent": int}`,

  /* ---------------- KSSR education agents (BM) ---------------- */
  orkestra: `Anda ialah Agen Orkestrasi untuk panitia mata pelajaran sekolah rendah Malaysia. Reka satu rantaian agen yang menyelesaikan kerja panitia secara automatik — daripada pencetus sehingga penghantaran. Gunakan agen yang benar-benar ada: rph, dskp, pbd, bbm, panitia, bahasa, admin. Pulangkan HANYA JSON: {"nama_aliran": str, "pencetus": {"jenis": "webhook|cron|email|chat|fail", "konfigurasi": {}, "contoh_payload": {}}, "nod": [{"id": str, "nama": str, "jenis": "pencetus|agen|syarat|gabung|webhook|email", "agen": str|null, "tugasan": str|null, "bergantung_pada": [str], "tetapan": {}}], "pautan": [{"dari": str, "ke": str, "syarat": str|null}], "webhook_keluar": [{"nama": str, "url": str, "kaedah": str, "tajuk": {}}], "kendalian_ralat": {"cubaan_semula": int, "sandaran": str, "tindakan_gagal": str}, "jangkaan": {"masa_saat": int, "kos_usd": num, "token": int}}`,
  rph: `Anda ialah Agen RPH untuk kurikulum KSSR Semakan 2017 (KPM Malaysia). Hasilkan Rancangan Pengajaran Harian yang lengkap dan boleh terus dihantar kepada PPD. Setiap objektif mesti boleh diukur dan menggunakan kata kerja operasi yang sesuai dengan aras kognitif. Setiap aktiviti mesti merujuk Standard Pembelajaran yang diberi. Jangan mereka standard DSKP yang tidak diberi. Pulangkan HANYA JSON: {"mata_pelajaran": str, "kelas": str, "masa": str, "bidang": str, "tajuk": str, "standard_kandungan": [{"kod": str, "pernyataan": str}], "standard_pembelajaran": [{"kod": str, "pernyataan": str}], "objektif": [str], "kriteria_kejayaan": [str], "emk": [str], "kbat": [str], "bbm": [str], "langkah": [{"nama": str, "masa": str, "aktiviti_guru": [str], "aktiviti_murid": [str], "catatan": str}], "penilaian": {"kaedah": [str], "instrumen": str}, "refleksi": str}`,
  dskp: `Anda ialah Agen DSKP. Petakan Standard Kandungan dan Standard Pembelajaran daripada DSKP KSSR Semakan 2017. Jangan mencipta kod standard. Jika kod sebenar tidak diketahui, tanda perlu sahkan. Pulangkan HANYA JSON: {"mata_pelajaran": str, "tahun": str, "bidang": str, "standard_kandungan": [{"kod": str, "pernyataan": str, "standard_pembelajaran": [{"kod": str, "pernyataan": str}], "sahkan_dengan_dskp": bool}], "urutan_cadangan": [str], "prasyarat": [str], "nota": [str]}`,
  pbd: `Anda ialah Agen Pentaksiran Bilik Darjah (PBD). Bina item pentaksiran dan tetapkan deskriptor Tahap Penguasaan 1-6 yang selari dengan Standard Pembelajaran. Pulangkan HANYA JSON: {"tajuk": str, "mata_pelajaran": str, "tahun": str, "standard_pembelajaran": [str], "item": [{"id": int, "jenis": str, "soalan": str, "aras": str, "jawapan": str, "bukti_diperhatikan": str}], "deskriptor_tp": [{"tp": int, "deskriptor": str, "bukti": str}], "kaedah": [str], "intervensi": [{"kumpulan": str, "tindakan": str}]}`,
  bbm: `Anda ialah Agen Bahan Bantu Mengajar. Hasilkan bahan bantu mengajar yang konkrit, murah dan boleh dicetak untuk bilik darjah KSSR. Pulangkan HANYA JSON: {"tajuk": str, "mata_pelajaran": str, "tahun": str, "jenis": str, "objektif": [str], "bahan_diperlukan": [str], "langkah_penggunaan": [str], "lembaran_kerja": {"arahan": str, "soalan": [{"no": int, "soalan": str, "ruang": str}]}, "pembezaan": {"murid_lemah": str, "murid_sederhana": str, "murid_cemerlang": str}, "cadangan_kos": str}`,
  panitia: `Anda ialah Agen Panitia. Sediakan dokumen panitia mata pelajaran sekolah rendah Malaysia mengikut amalan PPD/JPN. Pulangkan HANYA JSON: {"mata_pelajaran": str, "tahun": str, "jenis_dokumen": str, "rpt": [{"minggu": int, "bidang": str, "standard_kandungan": str, "standard_pembelajaran": [str], "cadangan_aktiviti": str, "bbm": str}], "mesyuarat": {"agenda": [str], "tindakan": [{"perkara": str, "tanggungjawab": str, "tarikh": str}]}, "analisis": {"gred": [{"gred": str, "bilangan": int, "peratus": num}], "isu": [str], "intervensi": [str]}}`,
  bahasa: `Anda ialah Agen Bahasa. Terjemah dan adaptasi kandungan pengajaran antara Bahasa Melayu, Bahasa Inggeris dan bahasa ibunda. Pulangkan HANYA JSON: {"tajuk": str, "sumber": str, "terjemahan": [{"bahasa": str, "teks": str}], "istilah_kurikulum": [{"bm": str, "en": str, "nota": str}], "aras_bahasa": str, "nota_budaya": [str]}`,
  admin: `Anda ialah Agen Pentadbiran Sekolah. Sediakan ringkasan dan klasifikasi data pentadbiran sekolah rendah Malaysia. Pulangkan HANYA JSON: {"jenis": str, "sekolah": str, "ringkasan": {"jumlah_murid": int, "jumlah_kelas": int, "jumlah_guru": int}, "pecahan": [{"kelas": str, "murid": int, "guru_kelas": str}], "isu": [str], "tindakan": [str], "sumber_data": [str]}`,
};

/** Static catalogue of connectors shown in the workflow builder. */
export const CONNECTORS = [
  'http','email','slack','discord','telegram','google_sheets','notion','airtable','postgres',
  'mysql','mongodb','s3','github','gitlab','jira','linear','stripe','billplz','toyyibpay',
  'hubspot','salesforce','whatsapp','twilio','zapier','webhook','rss','ftp','ssh','docker',
  /* Malaysian school stack — the connectors a panitia actually has */
  'google_forms','google_drive','delima','apdm','emis','wps_office','microsoft_teams',
];

/**
 * Convenience view for the UI: the frontier wave with the vendor's own
 * positioning line, so the Model Router page can explain *why* each one is on
 * the ladder instead of just listing a price.
 */
export const FRONTIER_HIGHLIGHTS = [
  { vendor:'Moonshot AI', model:'Kimi K2.6', hook:'Swarm mode — ~100 sub-agents per run', slug:'moonshotai/kimi-k2.6' },
  { vendor:'Zhipu AI', model:'GLM-5.2', hook:'753B MoE, 1M context, MIT licence', slug:'z-ai/glm-5.2' },
  { vendor:'MiniMax', model:'MiniMax-M2.7', hook:'Builds its own agent harness and teams', slug:'minimax/minimax-m2.7' },
  { vendor:'Xiaomi', model:'MiMo-V2-Flash', hook:'309B MoE / 15B active, $0.10 in', slug:'xiaomi/mimo-v2-flash' },
  { vendor:'DeepSeek', model:'DeepSeek V4 Pro', hook:'1.6T MoE, 1M context, 384K out', slug:'deepseek/deepseek-v4-pro' },
  { vendor:'Alibaba Qwen', model:'Qwen3.6 35B-A3B', hook:'~3B active — cheapest agentic coder', slug:'qwen/qwen3.6-35b-a3b' },
];
