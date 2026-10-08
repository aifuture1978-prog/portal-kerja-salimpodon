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
];

export const ALL_MODELS = [...CHINA_MODELS, ...GLOBAL_MODELS, ...FREE_MODELS];
export const CATALOG = Object.fromEntries(ALL_MODELS.map((m) => [m.slug, m]));

export const isFree = (m) => m.tier === Tier.FREE;
/** Blended cost per 1M tokens assuming a 3:1 prompt:completion split. */
export const blendedCost = (m) => m.input_price * 0.75 + m.output_price * 0.25;

/* ---------------------------------------------------------------------------
 * Per-task routing policy. Order matters: the router walks left to right,
 * skipping any model that is rate-limited, over budget or missing a capability.
 * ------------------------------------------------------------------------- */
export const TASK_POLICY = {
  coding:    ['deepseek/deepseek-chat-v3-0324:free','qwen/qwen-2.5-72b-instruct:free','deepseek/deepseek-chat','qwen/qwen3-235b-a22b','anthropic/claude-3.5-sonnet'],
  refactor:  ['deepseek/deepseek-chat-v3-0324:free','deepseek/deepseek-chat','qwen/qwen3-235b-a22b','anthropic/claude-3.5-sonnet'],
  debug:     ['deepseek/deepseek-r1:free','deepseek/deepseek-r1','qwen/qwen3-235b-a22b','anthropic/claude-3.5-sonnet'],
  research:  ['perplexity/sonar','perplexity/sonar-pro','google/gemini-2.0-flash-001'],
  writing:   ['moonshotai/kimi-k2:free','z-ai/glm-4.5-air:free','moonshotai/kimi-k2','z-ai/glm-4-plus','baichuan/baichuan4','tencent/hunyuan-large'],
  design:    ['google/gemini-2.0-flash-exp:free','google/gemini-2.0-flash-001','z-ai/glm-4-plus','anthropic/claude-3.5-sonnet'],
  qa:        ['mistralai/mistral-small-3.2-24b-instruct:free','anthropic/claude-3.5-haiku','anthropic/claude-3.5-sonnet'],
  automation:['qwen/qwen-2.5-72b-instruct:free','qwen/qwen-2.5-72b-instruct','deepseek/deepseek-chat','google/gemini-2.0-flash-001'],
  summarise: ['meta-llama/llama-3.3-70b-instruct:free','minimax/minimax-01','google/gemini-2.0-flash-001'],
  classify:  ['meta-llama/llama-3.2-3b-instruct:free','mistralai/mistral-small-3.2-24b-instruct:free','anthropic/claude-3.5-haiku'],
  chat:      ['google/gemini-2.0-flash-exp:free','deepseek/deepseek-chat-v3-0324:free','deepseek/deepseek-chat','google/gemini-2.0-flash-001'],
  image:     ['google/gemini-2.0-flash-exp:free','google/gemini-2.0-flash-001'],
  video:     ['google/gemini-2.0-flash-001'],
  quiz:      ['google/gemini-2.0-flash-exp:free','qwen/qwen-2.5-72b-instruct:free','google/gemini-2.0-flash-001'],
  game:      ['deepseek/deepseek-chat-v3-0324:free','qwen/qwen3-235b-a22b:free','anthropic/claude-3.5-sonnet'],
};

export const TASK_LABELS = {
  coding:'Coding', refactor:'Refactor', debug:'Debug', research:'Research', writing:'Writing',
  design:'Design', qa:'QA review', automation:'Automation', summarise:'Summarise',
  classify:'Classify', chat:'Chat', image:'Image', video:'Video', quiz:'Quiz', game:'Game',
};

/** The ten built-in agents. */
export const AGENTS = [
  { key:'orchestrator', name:'Orchestrator', task:'automation', model:'qwen/qwen-2.5-72b-instruct:free', fallback:['deepseek/deepseek-chat'], desc:'Decomposes a goal into an ordered plan of sub-tasks and delegates to specialist agents.' },
  { key:'coder', name:'Coder', task:'coding', model:'deepseek/deepseek-chat-v3-0324:free', fallback:['qwen/qwen3-235b-a22b','deepseek/deepseek-r1'], desc:'Generates, refactors, debugs and tests code across JS/TS, Python, PHP, Go, Rust, SQL.' },
  { key:'designer', name:'Designer', task:'design', model:'google/gemini-2.0-flash-exp:free', fallback:['google/gemini-2.0-flash-001'], desc:'Turns requirements into UI structure, design tokens and Tailwind/shadcn components.' },
  { key:'researcher', name:'Researcher', task:'research', model:'perplexity/sonar', fallback:['perplexity/sonar-pro'], desc:'Grounded web research with inline citations.' },
  { key:'writer', name:'Writer', task:'writing', model:'moonshotai/kimi-k2:free', fallback:['z-ai/glm-4-plus','baichuan/baichuan4'], desc:'Long-form copy, docs, marketing and localisation (EN/MS/ZH).' },
  { key:'qa', name:'QA', task:'qa', model:'anthropic/claude-3.5-haiku', fallback:['mistralai/mistral-small-3.2-24b-instruct:free'], desc:'Reviews artefacts for correctness, security and edge cases.' },
  { key:'automation', name:'Automation', task:'automation', model:'qwen/qwen-2.5-72b-instruct', fallback:['google/gemini-2.0-flash-001'], desc:'Builds n8n-style connector workflows with triggers, branches and retries.' },
  { key:'creative', name:'Creative', task:'image', model:'google/gemini-2.0-flash-001', fallback:['google/gemini-2.0-flash-exp:free'], desc:'Image, video storyboard, infographic and mind-map generation.' },
  { key:'tutor', name:'Tutor', task:'quiz', model:'google/gemini-2.0-flash-exp:free', fallback:['qwen/qwen-2.5-72b-instruct:free'], desc:'Illustrated quizzes and playable educational games aligned to a syllabus.' },
  { key:'deploy', name:'Deploy', task:'automation', model:'deepseek/deepseek-chat', fallback:['qwen/qwen-2.5-72b-instruct'], desc:'Builds Docker/CI config and drives one-click deploys.' },
];

/** System prompts — same contracts the FastAPI agents enforce. */
export const SYSTEM_PROMPTS = {
  orchestrator: `You are the Orchestrator of an agentic platform. Break the user's goal into the smallest useful set of sub-tasks. Assign each to exactly one agent from: coder, designer, researcher, writer, qa, automation, creative, tutor, deploy. Return ONLY JSON: {"goal": str, "steps": [{"id": int, "agent": str, "title": str, "instruction": str, "depends_on": [int], "expected_output": str}], "risks": [str], "definition_of_done": [str]}`,
  coder: `You are a senior full-stack engineer. Produce production-quality, typed code. Prefer standard library and well-maintained packages. Never invent APIs. Return ONLY JSON: {"summary": str, "language": str, "files": [{"path": str, "action": "create|update|delete", "content": str}], "tests": [{"path": str, "content": str}], "run_commands": [str], "notes": [str]}`,
  designer: `You are a product designer and frontend engineer. Respect WCAG 2.1 AA, an 8pt spacing grid, a 12px radius and an indigo/violet accent. Return ONLY JSON: {"page": str, "layout": str, "components": [{"name": str, "purpose": str, "code": str}], "tokens": {"colors": {}, "spacing": {}, "type": {}}, "a11y_notes": [str]}`,
  researcher: `You are a research analyst. Cite sources inline as [n] and list them. Separate fact from inference. Return ONLY JSON: {"question": str, "answer": str, "key_findings": [str], "sources": [{"title": str, "url": str}], "confidence": "low|medium|high", "open_questions": [str]}`,
  writer: `You are a senior copywriter and technical writer. Match the requested tone, avoid filler, use concrete nouns and active voice. Return ONLY JSON: {"title": str, "format": str, "content_md": str, "variants": [{"label": str, "content_md": str}], "word_count": int, "seo_keywords": [str]}`,
  qa: `You are a rigorous QA engineer. Hunt for real defects, not style nits. Return ONLY JSON: {"verdict": "pass|pass_with_notes|fail", "score": int, "issues": [{"severity": "critical|high|medium|low", "location": str, "problem": str, "fix": str}], "missing_tests": [str], "security_notes": [str]}`,
  automation: `You are an integration engineer. Produce an executable workflow graph of nodes and edges. Return ONLY JSON: {"name": str, "trigger": {"type": "webhook|cron|email|chat|file", "config": {}}, "nodes": [{"id": str, "type": str, "connector": str, "config": {}}], "edges": [{"source": str, "target": str, "condition": str|null}], "error_handling": {"retries": int, "backoff": str, "on_failure": str}}`,
  creative: `You are a prompt engineer for image models. Return ONLY JSON: {"prompt": str, "negative_prompt": str, "aspect_ratio": str, "style": str, "variations": [str]}.`,
  tutor: `You are a Tutor Agent that builds illustrated quizzes. Return ONLY JSON: {"title": str, "subject": str, "level": str, "questions": [{"id": int, "type": "mcq|truefalse", "question": str, "image_prompt": str, "options": [str], "answer_index": int, "explanation": str, "difficulty": "easy|medium|hard", "points": int}]}`,
  deploy: `You are a DevOps engineer. Produce minimal, secure deployment artefacts. Return ONLY JSON: {"target": str, "dockerfile": str, "compose_service": str, "env_vars": [{"key": str, "required": bool, "description": str}], "ci_steps": [str], "rollback": str, "healthcheck": str}`,
};

/** Static catalogue of connectors shown in the workflow builder. */
export const CONNECTORS = [
  'http','email','slack','discord','telegram','google_sheets','notion','airtable','postgres',
  'mysql','mongodb','s3','github','gitlab','jira','linear','stripe','billplz','toyyibpay',
  'hubspot','salesforce','whatsapp','twilio','zapier','webhook','rss','ftp','ssh','docker',
];
