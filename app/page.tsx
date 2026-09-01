'use client';

import { useRef, useState } from 'react';
import {
  Braces,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCode2,
  FileText,
  FolderOpen,
  Lightbulb,
  LoaderCircle,
  Palette,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type DimensionKey = 'logic' | 'code' | 'design';

type Dimension = {
  key: DimensionKey;
  name: string;
  score: number;
  icon: typeof BrainCircuit;
  tone: string;
  textTone: string;
  detail: string;
  evidence: string[];
  suggestion: string;
};

type Report = {
  title: string;
  fileCount: number;
  lines: number;
  total: number;
  grade: string;
  gradeText: string;
  dimensions: Dimension[];
  generatedAt: string;
};

const sampleReport: Report = {
  title: '智能日程管理器',
  fileCount: 28,
  lines: 6842,
  total: 264,
  grade: 'A',
  gradeText: '表现优秀',
  generatedAt: '示例报告',
  dimensions: [
    { key: 'logic', name: '逻辑推演', score: 88, icon: BrainCircuit, tone: 'bg-[#e8ff92]', textTone: 'text-[#a8c633]', detail: '结构完整 · 推理链清晰', evidence: ['功能边界划分明确', '包含空状态与异常分支', '数据流向容易追踪'], suggestion: '为关键业务规则增加决策表或状态图，可进一步降低复杂场景的理解成本。' },
    { key: 'code', name: '编程能力', score: 94, icon: Braces, tone: 'bg-[#dbe7ff]', textTone: 'text-[#7f9eff]', detail: '工程规范 · 异常处理充分', evidence: ['TypeScript 类型覆盖完整', '组件职责单一', '具备测试与格式化配置'], suggestion: '可补充端到端测试，覆盖跨页面的主要用户任务。' },
    { key: 'design', name: '前端审美', score: 82, icon: Palette, tone: 'bg-[#ffe0d4]', textTone: 'text-[#ff9c78]', detail: '视觉统一 · 响应式良好', evidence: ['色彩与间距体系一致', '移动端布局已适配', '交互状态较完整'], suggestion: '建议统一次要文字对比度，并强化主操作与次操作的视觉层级。' },
  ],
};

const textExtensions = new Set(['ts', 'tsx', 'js', 'jsx', 'css', 'scss', 'less', 'html', 'vue', 'svelte', 'json', 'md', 'mdx', 'py', 'go', 'rs', 'java', 'kt', 'swift', 'c', 'cpp', 'h', 'yml', 'yaml', 'toml', 'sql', 'txt']);

const clamp = (value: number) => Math.max(35, Math.min(100, Math.round(value)));
const count = (source: string, pattern: RegExp) => (source.match(pattern) || []).length;

function gradeFor(total: number) {
  if (total >= 270) return ['S', '卓越作品'];
  if (total >= 240) return ['A', '表现优秀'];
  if (total >= 210) return ['B', '具备实力'];
  if (total >= 180) return ['C', '基础扎实'];
  return ['D', '仍可提升'];
}

async function buildReport(files: File[]): Promise<Report> {
  const readable = files.filter((file) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    return textExtensions.has(ext) && file.size < 1_500_000;
  }).slice(0, 100);
  const contents = await Promise.all(readable.map((file) => file.text().catch(() => '')));
  const source = contents.join('\n').slice(0, 4_000_000);
  const lower = source.toLowerCase();
  const names = files.map((file) => file.name.toLowerCase()).join(' ');
  const paths = files.map((file) => (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name);
  const lineCount = contents.reduce((sum, content) => sum + content.split('\n').length, 0);
  const dirCount = new Set(paths.map((path) => path.split('/').slice(0, -1).join('/')).filter(Boolean)).size;

  const hasReadme = /readme|说明|doc/.test(names);
  const hasTests = /test|spec|e2e|playwright|vitest|jest/.test(names + lower.slice(0, 200000));
  const hasTypes = /tsconfig|interface\s+\w+|type\s+\w+\s*=/.test(names + source);
  const hasConfig = /package\.json|vite\.config|next\.config|eslint|oxlint|prettier/.test(names);
  const hasStyles = /\.css|\.scss|tailwind|styled/.test(names + lower);
  const hasFrontend = /\.tsx|\.jsx|\.vue|\.svelte|\.html/.test(names);

  const architecture = Math.min(18, files.length * 0.7 + dirCount * 1.8);
  const documentation = (hasReadme ? 9 : 2) + Math.min(8, count(lower, /\/\/|\/\*|#\s|todo|note/g) * 0.18);
  const stateFlow = Math.min(20, 5 + count(lower, /usestate|usereducer|context|store|schema|interface|async\s|await\s|fetch\(/g) * 0.7);
  const edgeCases = Math.min(21, 4 + count(lower, /try\s*\{|catch\s*\(|throw\s|error|empty|fallback|loading|null|undefined/g) * 0.32);
  const validation = Math.min(19, (hasTests ? 10 : 2) + count(lower, /validate|schema|assert|expect\(|if\s*\(|switch\s*\(/g) * 0.18);
  const logic = clamp(26 + architecture + documentation + stateFlow + edgeCases + validation - 12);

  const integrity = (hasConfig ? 12 : 4) + Math.min(9, files.length * 0.35);
  const quality = Math.min(25, 5 + count(source, /function\s+\w+|const\s+\w+\s*=\s*\(|class\s+\w+|export\s+(default\s+)?/g) * 0.22 + (hasTypes ? 7 : 1));
  const robustness = Math.min(20, 4 + count(lower, /try\s*\{|catch\s*\(|error|finally|optional|fallback|status/g) * 0.35);
  const testing = hasTests ? 18 : Math.min(8, count(lower, /test|expect|assert/g) * 0.7);
  const maintainability = Math.min(15, 4 + dirCount * 0.8 + (hasReadme ? 3 : 0) + count(lower, /component|module|service|hook|utils?/g) * 0.12);
  const code = clamp(22 + integrity + quality + robustness + testing + maintainability - 10);

  const tokens = count(lower, /--[\w-]+\s*:|theme|token|var\(--/g);
  const responsive = count(lower, /@media|sm:|md:|lg:|xl:|clamp\(|minmax\(/g);
  const layout = count(lower, /display:\s*(grid|flex)|grid-cols|flex-|gap-|space-[xy]-|padding|margin/g);
  const polish = count(lower, /hover:|focus:|active:|transition|animation|@keyframes|loading|skeleton/g);
  const a11y = count(lower, /aria-|alt=|label|role=|<main|<nav|<header|<section|<button/g);
  const designBase = hasFrontend ? 24 : 7;
  const designSystem = Math.min(22, (hasStyles ? 6 : 0) + tokens * 0.7);
  const hierarchy = Math.min(21, layout * 0.12 + responsive * 0.9);
  const interaction = Math.min(17, polish * 0.55);
  const accessibility = Math.min(16, a11y * 0.45);
  const design = clamp(designBase + designSystem + hierarchy + interaction + accessibility);

  const dimensions: Dimension[] = [
    {
      key: 'logic', name: '逻辑推演', score: logic, icon: BrainCircuit, tone: 'bg-[#e8ff92]', textTone: 'text-[#a8c633]',
      detail: logic >= 80 ? '结构清晰 · 逻辑闭环' : logic >= 65 ? '思路完整 · 边界待加强' : '基础可用 · 推演不足',
      evidence: [
        `${dirCount || 1} 个目录层级，项目结构${dirCount >= 3 ? '较清晰' : '相对扁平'}`,
        hasReadme ? '检测到项目说明与上下文文档' : '未发现完整的项目说明文档',
        edgeCases >= 12 ? '包含异常、空值或加载分支' : '异常与边界场景覆盖有限',
      ],
      suggestion: hasTests ? '用状态图补充关键业务分支，让复杂逻辑更易验证。' : '优先增加边界用例与决策分支测试，证明关键推演可复现。',
    },
    {
      key: 'code', name: '编程能力', score: code, icon: Braces, tone: 'bg-[#dbe7ff]', textTone: 'text-[#7f9eff]',
      detail: code >= 80 ? '工程完整 · 代码可靠' : code >= 65 ? '实现扎实 · 规范待补' : '功能初成 · 工程性偏弱',
      evidence: [
        hasTypes ? '检测到类型系统或结构化数据定义' : '类型约束与数据契约较少',
        hasConfig ? '包含构建、依赖或代码质量配置' : '缺少明确的工程配置文件',
        hasTests ? '检测到测试相关文件或断言' : '暂未检测到自动化测试',
      ],
      suggestion: hasTests ? '继续提高关键路径与失败路径的测试覆盖率。' : '添加最小测试集，并统一格式化、检查和构建命令。',
    },
    {
      key: 'design', name: '前端审美', score: design, icon: Palette, tone: 'bg-[#ffe0d4]', textTone: 'text-[#ff9c78]',
      detail: design >= 80 ? '体系统一 · 细节成熟' : design >= 65 ? '层级清楚 · 细节待磨' : hasFrontend ? '界面可用 · 设计系统不足' : '非前端项目 · 依据有限',
      evidence: hasFrontend ? [
        tokens >= 4 ? '检测到主题变量或设计令牌' : '设计令牌与主题变量较少',
        responsive >= 3 ? '包含多处响应式布局策略' : '响应式适配信号有限',
        a11y >= 4 ? '具备语义化或无障碍标注' : '无障碍与语义化细节不足',
      ] : ['未检测到主要前端页面文件', '按现有样式与输出文件进行有限评估', '建议加入可视化页面后再次测评'],
      suggestion: hasFrontend ? '统一色彩、间距和字体令牌，并补齐 hover、focus、loading 状态。' : '补充可运行的页面与样式文件，才能获得更准确的审美评分。',
    },
  ];
  const total = dimensions.reduce((sum, item) => sum + item.score, 0);
  const [grade, gradeText] = gradeFor(total);
  const rootName = paths.find((path) => path.includes('/'))?.split('/')[0];
  const fallbackName = files[0]?.name.replace(/\.[^.]+$/, '') || '未命名项目';

  return {
    title: rootName || fallbackName,
    fileCount: files.length,
    lines: lineCount,
    total,
    grade,
    gradeText,
    dimensions,
    generatedAt: '刚刚生成',
  };
}

function ScorePanel({ report, isSample }: { report: Report; isSample: boolean }) {
  return (
    <aside id="report" className="relative overflow-hidden rounded-[30px] bg-[#101726] p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:p-7">
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#2749c9]/35 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{isSample ? '示例分析报告' : '项目分析报告'}</p>
          <h2 className="mt-2 truncate text-xl font-semibold">{report.title}</h2>
          <p className="mt-1 text-xs text-white/45">{report.fileCount} 个文件 · {report.lines.toLocaleString()} 行文本</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white/60">{isSample ? '示例数据' : '分析完成'}</span>
      </div>
      <div className="relative my-8 flex items-end justify-between border-b border-white/10 pb-7">
        <div><p className="text-xs text-white/45">综合评分</p><p className="mt-1 text-[4.6rem] font-semibold leading-none tracking-[-0.07em]">{report.total}</p><p className="mt-2 text-[11px] text-white/35">满分 300</p></div>
        <div className="mb-1 text-right"><p className="text-2xl font-medium text-[#e8ff92]">{report.grade}</p><p className="text-[11px] text-white/45">{report.gradeText}</p></div>
      </div>
      <div className="relative space-y-3">
        {report.dimensions.map(({ name, score, icon: Icon, tone, detail }) => (
          <div key={name} className="rounded-2xl bg-white/[0.055] p-4 ring-1 ring-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className={`grid size-9 place-items-center rounded-xl text-[#101726] ${tone}`}><Icon className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{name}</p><p className="font-mono text-sm font-semibold">{score}<span className="text-[10px] font-normal text-white/35"> / 100</span></p></div>
                <p className="mt-1 text-[11px] text-white/40">{detail}</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`${tone} transition-[width] duration-700`} style={{ width: `${score}%`, height: '100%' }} /></div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [report, setReport] = useState<Report>(sampleReport);
  const [status, setStatus] = useState<'idle' | 'reading' | 'scoring' | 'done'>('idle');
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const setSelected = (selected: File[]) => {
    const unique = Array.from(new Map(selected.map((file) => [`${file.name}-${file.size}-${file.lastModified}`, file])).values()).slice(0, 150);
    setFiles(unique);
    setStatus('idle');
  };

  const analyze = async () => {
    if (!files.length) return;
    setStatus('reading');
    await new Promise((resolve) => setTimeout(resolve, 650));
    setStatus('scoring');
    const next = await buildReport(files);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setReport(next);
    setStatus('done');
    setTimeout(() => document.querySelector('#report')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  };

  const reset = () => {
    setFiles([]);
    setReport(sampleReport);
    setStatus('idle');
    if (fileInput.current) fileInput.current.value = '';
    if (folderInput.current) folderInput.current.value = '';
  };

  const busy = status === 'reading' || status === 'scoring';
  const isSample = status !== 'done';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/80 bg-background/90">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>
            <div><p className="text-sm font-semibold tracking-tight">ModelBench</p><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">AI Project Evaluator</p></div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><ShieldCheck className="size-4 text-emerald-600" />文件仅在本地浏览器中分析</div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)] lg:py-14">
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2749c9]"><span className="h-px w-7 bg-[#2749c9]" />项目能力测评台</div>
          <h1 className="max-w-3xl text-[clamp(2.5rem,6vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.055em]">看见每一个<br /><span className="text-[#2749c9]">AI 项目的实力</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">上传大模型生成的项目文件，从逻辑推演、编程能力与前端审美三个维度展开结构化分析，获得最高 300 分的清晰结论。</p>

          <div className="mt-9 rounded-[26px] border border-border bg-card p-2 shadow-[0_18px_60px_rgba(28,40,75,0.08)]">
            <div
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => { event.preventDefault(); setDragging(false); setSelected(Array.from(event.dataTransfer.files)); }}
              className={`flex min-h-52 flex-col items-center justify-center rounded-[20px] border border-dashed px-6 text-center transition-all ${dragging ? 'scale-[0.995] border-[#2749c9] bg-[#edf2ff]' : 'border-[#aab9e8] bg-[#f7f9ff]'}`}
            >
              {files.length === 0 ? (
                <>
                  <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-[#2749c9] text-white shadow-[0_8px_24px_rgba(39,73,201,0.28)]"><UploadCloud className="size-5" /></span>
                  <p className="text-base font-semibold">拖放项目文件或文件夹到这里</p>
                  <p className="mt-2 text-sm text-muted-foreground">支持 HTML、CSS、JS、TS、JSON、Markdown 等常见项目文件</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Button size="lg" onClick={() => fileInput.current?.click()}><FileText data-icon="inline-start" />选择文件</Button>
                    <Button size="lg" variant="outline" onClick={() => folderInput.current?.click()}><FolderOpen data-icon="inline-start" />选择文件夹</Button>
                  </div>
                </>
              ) : (
                <div className="w-full max-w-lg py-3">
                  <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[#e8ff92] text-[#17213a]"><FolderOpen className="size-5" /></div>
                  <p className="font-semibold">已读取 {files.length} 个文件</p>
                  <p className="mt-1 text-xs text-muted-foreground">{(files.reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(1)} KB · 准备开始分析</p>
                  <div className="mt-4 flex max-h-[68px] flex-wrap justify-center gap-1.5 overflow-hidden">
                    {files.slice(0, 8).map((file) => <Badge key={`${file.name}-${file.size}`} variant="outline" className="max-w-36 bg-white/70"><FileCode2 /> <span className="truncate">{file.name}</span></Badge>)}
                    {files.length > 8 && <Badge variant="secondary">+{files.length - 8}</Badge>}
                  </div>
                  <div className="mt-5 flex justify-center gap-2">
                    <Button size="lg" onClick={analyze} disabled={busy}>{busy ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}{status === 'reading' ? '读取项目…' : status === 'scoring' ? '计算评分…' : '开始智能分析'}</Button>
                    <Button size="lg" variant="ghost" onClick={reset} disabled={busy}><X /> 清空</Button>
                  </div>
                </div>
              )}
              <input ref={fileInput} className="hidden" type="file" multiple accept=".ts,.tsx,.js,.jsx,.css,.scss,.html,.vue,.svelte,.json,.md,.mdx,.py,.go,.rs,.java,.yml,.yaml,.toml,.sql,.txt" onChange={(event) => setSelected(Array.from(event.target.files || []))} />
              <input ref={(node) => { folderInput.current = node; node?.setAttribute('webkitdirectory', ''); }} className="hidden" type="file" multiple onChange={(event) => setSelected(Array.from(event.target.files || []))} />
            </div>
          </div>

          {status === 'done' ? (
            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span className="flex items-center gap-2 font-medium"><CheckCircle2 className="size-4" />报告生成完成</span><button onClick={analyze} className="flex items-center gap-1 text-xs hover:underline"><RefreshCw className="size-3" />重新分析</button></div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-600" /> 多文件批量读取</span><span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-600" /> 数秒生成报告</span><span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-600" /> 无需注册</span></div>
          )}
        </div>

        <ScorePanel report={report} isSample={isSample} />
      </section>

      <section className="border-t border-border bg-white/60">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2749c9]">评分拆解</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">不只给分，<br />更给出改进方向。</h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">每个维度都基于项目结构、代码信号与界面实现进行独立判断。上传你的项目后，这里会替换为真实分析结果。</p>
              <div className="mt-8 rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#e8ff92]"><Lightbulb className="size-4" /></span><div><p className="text-sm font-semibold">透明评分规则</p><p className="text-xs text-muted-foreground">每项 100 分，合计 300 分</p></div></div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {report.dimensions.map(({ key, name, score, icon: Icon, tone, textTone, evidence, suggestion }) => (
                <article key={key} className="flex flex-col rounded-[24px] border border-border bg-card p-5 shadow-[0_10px_30px_rgba(28,40,75,0.04)]">
                  <div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></span><span className={`font-mono text-xl font-semibold ${textTone}`}>{score}</span></div>
                  <h3 className="mt-5 font-semibold">{name}</h3>
                  <ul className="mt-4 space-y-3">
                    {evidence.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground"><Check className="mt-1 size-3 shrink-0 text-emerald-600" />{item}</li>)}
                  </ul>
                  <div className="mt-5 border-t border-border pt-4"><p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">改进建议</p><p className="text-xs leading-5 text-foreground/70">{suggestion}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[['01', '逻辑推演', '检查需求闭环、信息结构、状态分支、异常处理与测试思路。'], ['02', '编程能力', '检查工程完整度、类型安全、复用性、健壮性、测试与可维护性。'], ['03', '前端审美', '检查设计系统、视觉层级、响应式、交互细节与无障碍实现。']].map(([index, title, text]) => (
            <div key={index} className="group rounded-2xl border border-border p-5 transition-colors hover:bg-white"><div className="flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">{index}</span><ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><h3 className="mt-8 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>
          ))}
        </div>
        <footer className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>ModelBench · AI 项目能力评测</p><p>评分为静态工程信号分析结果，适合辅助评审与迭代。</p></footer>
      </section>
    </main>
  );
}
