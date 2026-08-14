"use client";

import { useMemo, useRef, useState } from "react";

type PeriodKey = "7" | "30" | "90";
type TrendMode = "flow" | "rate";

const periodData = {
  "7": {
    label: "近 7 天", plays: 284, input: 16480, reward: 14998, rate: 91.01, net: -1482,
    days: ["08/08", "08/09", "08/10", "08/11", "08/12", "08/13", "今天"],
    inputSeries: [1780, 2260, 1940, 2880, 2410, 2660, 2550],
    rewardSeries: [1510, 2080, 1750, 2460, 2340, 2530, 2328],
    rateSeries: [84.8, 92.0, 90.2, 85.4, 97.1, 95.1, 91.3],
  },
  "30": {
    label: "近 30 天", plays: 1284, input: 72860, reward: 68420, rate: 93.91, net: -4440,
    days: ["第1周", "第2周", "第3周", "第4周", "本周"],
    inputSeries: [12820, 14460, 15840, 16920, 12820],
    rewardSeries: [11680, 13220, 15110, 16480, 11930],
    rateSeries: [91.1, 91.4, 95.4, 97.4, 93.1],
  },
  "90": {
    label: "近 90 天", plays: 3682, input: 213420, reward: 202180, rate: 94.73, net: -11240,
    days: ["6月", "7月", "8月"],
    inputSeries: [68400, 72860, 72160], rewardSeries: [63760, 68420, 70000], rateSeries: [93.2, 93.9, 97.0],
  },
} satisfies Record<PeriodKey, {
  label: string; plays: number; input: number; reward: number; rate: number; net: number;
  days: string[]; inputSeries: number[]; rewardSeries: number[]; rateSeries: number[];
}>;

const gameOptions = [
  { id: "all", name: "全部游戏", ratio: 1, accent: "#5b7cfa", mark: "全", adjust: 0 },
  { id: "wheel", name: "Lucky Wheel", ratio: 0.36, accent: "#7c5cff", mark: "LW", adjust: 1.4 },
  { id: "crash", name: "Crash", ratio: 0.27, accent: "#3498f5", mark: "CR", adjust: -0.8 },
  { id: "slot", name: "Slot King", ratio: 0.22, accent: "#f59e0b", mark: "SK", adjust: 0.6 },
  { id: "dice", name: "Dice", ratio: 0.15, accent: "#15b77e", mark: "DI", adjust: -1.2 },
];

const gameRanking = [
  { id: "wheel", name: "Lucky Wheel", rounds: 426, share: 36, reward: 2480, accent: "#7c5cff", mark: "LW", streak: "连续活跃 8 天" },
  { id: "crash", name: "Crash", rounds: 318, share: 27, reward: -680, accent: "#3498f5", mark: "CR", streak: "本周玩过 24 局" },
  { id: "slot", name: "Slot King", rounds: 264, share: 22, reward: 1260, accent: "#f59e0b", mark: "SK", streak: "最佳单局 +420 C" },
  { id: "dice", name: "Dice", rounds: 176, share: 15, reward: 520, accent: "#15b77e", mark: "DI", streak: "最高连胜 5 局" },
];

const compactNumber = new Intl.NumberFormat("zh-CN");

function MetricCard({ mark, title, value, note, color }: {
  mark: string; title: string; value: string; note: string; color: "blue" | "violet" | "amber" | "green";
}) {
  return (
    <article className={`metric-card metric-${color}`}>
      <span className="metric-mark" aria-hidden="true">{mark}</span>
      <p>{title}</p><strong>{value}</strong><small>{note}</small>
    </article>
  );
}

export default function Home() {
  const [period, setPeriod] = useState<PeriodKey>("30");
  const [game, setGame] = useState("all");
  const [draftPeriod, setDraftPeriod] = useState<PeriodKey>("30");
  const [draftGame, setDraftGame] = useState("all");
  const [trendMode, setTrendMode] = useState<TrendMode>("flow");
  const [activePoint, setActivePoint] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailGameId, setDetailGameId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("data");
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedGame = gameOptions.find((item) => item.id === game) ?? gameOptions[0];
  const baseData = periodData[period];
  const detailGame = gameRanking.find((item) => item.id === detailGameId);
  const data = useMemo(() => {
    const ratio = selectedGame.ratio;
    return {
      plays: Math.round(baseData.plays * ratio), input: Math.round(baseData.input * ratio),
      reward: Math.round(baseData.reward * ratio), net: Math.round(baseData.net * ratio),
      rate: Math.max(0, baseData.rate + selectedGame.adjust),
      inputSeries: baseData.inputSeries.map((item) => Math.round(item * ratio)),
      rewardSeries: baseData.rewardSeries.map((item) => Math.round(item * ratio)),
      rateSeries: baseData.rateSeries.map((item) => Math.max(0, item + selectedGame.adjust)),
    };
  }, [baseData, selectedGame]);
  const maxFlow = Math.max(...data.inputSeries, ...data.rewardSeries);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }
  function choosePeriod(next: PeriodKey) {
    setPeriod(next); setDraftPeriod(next); setActivePoint(0); showToast(`已切换至${periodData[next].label}`);
  }
  function openFilter() {
    setDraftPeriod(period); setDraftGame(game); setFilterOpen(true);
  }
  function applyFilter() {
    setPeriod(draftPeriod); setGame(draftGame); setActivePoint(0); setFilterOpen(false);
    showToast(`已查看 ${gameOptions.find((item) => item.id === draftGame)?.name ?? "全部游戏"} · ${periodData[draftPeriod].label}`);
  }
  function refreshData() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); showToast("数据已更新至刚刚"); }, 700);
  }
  function selectNav(id: string, label: string) {
    setActiveNav(id); if (id !== "data") showToast(`${label}为交互演示入口`);
  }

  return (
    <main className="site-shell">
      <div className="phone-page">
        <header className="hero">
          <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
          <div className="topbar">
            <div className="brand"><span>H</span> HAWK PLAY</div>
            <button className="round-button" type="button" aria-label="查看消息" onClick={() => showToast("暂时没有新消息")}><span aria-hidden="true">●</span></button>
          </div>
          <div className="welcome-row">
            <div><p className="eyebrow">PLAYER CENTER</p><h1>我的游戏战绩</h1><p className="hero-copy">每一局都有回响，看看这段时间的表现。</p></div>
            <div className="avatar" aria-label="用户头像">LU</div>
          </div>
          <section className="balance-card" aria-label="本期游戏数据摘要">
            <div>
              <p>{baseData.label}游戏币结余</p>
              <strong className={data.net >= 0 ? "positive" : "negative"}>{data.net >= 0 ? "+" : "−"}{compactNumber.format(Math.abs(data.net))} <small>C</small></strong>
              <span>投入与奖励的差额</span>
            </div>
            <button type="button" className={`refresh-button ${refreshing ? "is-refreshing" : ""}`} onClick={refreshData}><span aria-hidden="true">↻</span> {refreshing ? "更新中" : "刷新"}</button>
          </section>
        </header>

        <section className="content">
          <div className="period-toolbar" aria-label="时间范围">
            <div className="period-tabs">
              {(["7", "30", "90"] as PeriodKey[]).map((item) => (
                <button key={item} type="button" className={period === item ? "active" : ""} aria-pressed={period === item} onClick={() => choosePeriod(item)}>{item}天</button>
              ))}
            </div>
            <button type="button" className="filter-button" onClick={openFilter}><span aria-hidden="true">≡</span> 筛选</button>
          </div>
          {game !== "all" && (
            <button className="selected-filter" type="button" onClick={openFilter}>
              <span style={{ background: selectedGame.accent }}>{selectedGame.mark}</span>{selectedGame.name}<b aria-hidden="true">×</b>
            </button>
          )}
          <section className="metrics-grid" aria-label="核心指标">
            <MetricCard mark="局" title="游戏局数" value={compactNumber.format(data.plays)} note="完成的游戏局数" color="blue" />
            <MetricCard mark="投" title="游戏投入" value={`${compactNumber.format(data.input)} C`} note="本期累计投入" color="violet" />
            <MetricCard mark="奖" title="获得奖励" value={`${compactNumber.format(data.reward)} C`} note="已计入账户" color="amber" />
            <MetricCard mark="率" title="返还率" value={`${data.rate.toFixed(2)}%`} note={`${data.rate >= 94 ? "高于" : "接近"}近30天平均`} color="green" />
          </section>

          <section className="card trend-card">
            <div className="card-heading">
              <div><p className="section-kicker">PERFORMANCE</p><h2>数据趋势</h2></div><span className="updated-time">更新于刚刚</span>
            </div>
            <div className="trend-tabs" role="tablist" aria-label="趋势类型">
              <button type="button" role="tab" aria-selected={trendMode === "flow"} className={trendMode === "flow" ? "active" : ""} onClick={() => setTrendMode("flow")}>投入 / 奖励</button>
              <button type="button" role="tab" aria-selected={trendMode === "rate"} className={trendMode === "rate" ? "active" : ""} onClick={() => setTrendMode("rate")}>返还率</button>
            </div>
            <div className="chart-summary">
              <div><span>{trendMode === "flow" ? "当前选中" : "选中周期返还率"}</span><strong>{trendMode === "flow" ? `${compactNumber.format(data.rewardSeries[activePoint] ?? data.rewardSeries[0])} C` : `${(data.rateSeries[activePoint] ?? data.rateSeries[0]).toFixed(1)}%`}</strong></div>
              <div className="legend" aria-label="图例">{trendMode === "flow" ? <><span><i className="legend-input" />投入</span><span><i className="legend-reward" />奖励</span></> : <span><i className="legend-rate" />返还率</span>}</div>
            </div>
            <div className={`chart ${trendMode === "rate" ? "rate-chart" : ""}`}>
              <div className="grid-line grid-line-one" /><div className="grid-line grid-line-two" /><div className="grid-line grid-line-three" />
              {baseData.days.map((day, index) => (
                <button type="button" key={day} className={`chart-column ${activePoint === index ? "active" : ""}`} onClick={() => setActivePoint(index)} aria-label={`${day}，点击查看数据`}>
                  <span className="bar-area">
                    {trendMode === "flow" ? <><i className="flow-bar input-bar" style={{ height: `${Math.max(8, (data.inputSeries[index] / maxFlow) * 100)}%` }} /><i className="flow-bar reward-bar" style={{ height: `${Math.max(8, (data.rewardSeries[index] / maxFlow) * 100)}%` }} /></> : <i className="rate-bar" style={{ height: `${Math.max(18, (data.rateSeries[index] - 78) * 4.6)}%` }}><span>{data.rateSeries[index].toFixed(0)}</span></i>}
                  </span><small>{day}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="insight-card">
            <div className="insight-icon" aria-hidden="true">✦</div>
            <div><p>本期小结</p><strong>{data.rate >= 94 ? "状态不错，返还表现高于近期平均" : "节奏平稳，试试你更擅长的游戏"}</strong></div>
            <button type="button" aria-label="查看小结说明" onClick={() => showToast("小结根据游戏次数与返还率自动生成")}>›</button>
          </section>

          <section className="card ranking-card">
            <div className="card-heading ranking-heading">
              <div><p className="section-kicker">FAVORITES</p><h2>常玩游戏</h2></div>
              <button type="button" onClick={openFilter}>全部游戏 <span aria-hidden="true">›</span></button>
            </div>
            <div className="game-list">
              {gameRanking.map((item, index) => (
                <button className="game-row" type="button" key={item.id} onClick={() => setDetailGameId(item.id)}>
                  <span className={`rank-number rank-${index + 1}`}>{index + 1}</span>
                  <span className="game-logo" style={{ background: `${item.accent}18`, color: item.accent }}>{item.mark}</span>
                  <span className="game-main"><strong>{item.name}</strong><small>{Math.round(item.rounds * periodData[period].plays / 1284)} 局 · 占比 {item.share}%</small></span>
                  <span className={item.reward >= 0 ? "game-result positive" : "game-result negative"}>{item.reward >= 0 ? "+" : "−"}{compactNumber.format(Math.abs(Math.round(item.reward * selectedGame.ratio)))} C<small>{item.streak}</small></span>
                  <span className="row-arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </section>
        </section>

        <nav className="bottom-nav" aria-label="主导航">
          {[["home", "⌂", "首页"], ["games", "◇", "游戏"], ["data", "▥", "数据"], ["profile", "○", "我的"]].map(([id, icon, label]) => (
            <button type="button" key={id} className={activeNav === id ? "active" : ""} aria-current={activeNav === id ? "page" : undefined} onClick={() => selectNav(id, label)}><span aria-hidden="true">{icon}</span>{label}</button>
          ))}
        </nav>

        {filterOpen && (
          <div className="sheet-layer">
            <button className="sheet-backdrop" type="button" aria-label="关闭筛选" onClick={() => setFilterOpen(false)} />
            <section className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-title">
              <div className="sheet-handle" />
              <div className="sheet-heading"><div><p>FILTER</p><h2 id="filter-title">筛选数据</h2></div><button type="button" aria-label="关闭" onClick={() => setFilterOpen(false)}>×</button></div>
              <fieldset><legend>统计周期</legend><div className="sheet-periods">{(["7", "30", "90"] as PeriodKey[]).map((item) => <button key={item} type="button" className={draftPeriod === item ? "active" : ""} onClick={() => setDraftPeriod(item)}>近 {item} 天</button>)}</div></fieldset>
              <fieldset><legend>选择游戏</legend><div className="sheet-games">{gameOptions.map((item) => (
                <button key={item.id} type="button" className={draftGame === item.id ? "active" : ""} onClick={() => setDraftGame(item.id)}><span style={{ background: `${item.accent}18`, color: item.accent }}>{item.mark}</span>{item.name}<i aria-hidden="true">{draftGame === item.id ? "✓" : ""}</i></button>
              ))}</div></fieldset>
              <button className="primary-action" type="button" onClick={applyFilter}>查看数据</button>
            </section>
          </div>
        )}

        {detailGame && (
          <div className="sheet-layer">
            <button className="sheet-backdrop" type="button" aria-label="关闭游戏详情" onClick={() => setDetailGameId(null)} />
            <section className="bottom-sheet game-sheet" role="dialog" aria-modal="true" aria-labelledby="game-title">
              <div className="sheet-handle" />
              <div className="game-detail-head"><span className="game-detail-logo" style={{ background: `${detailGame.accent}18`, color: detailGame.accent }}>{detailGame.mark}</span><div><p>我的常玩游戏</p><h2 id="game-title">{detailGame.name}</h2></div><button type="button" aria-label="关闭" onClick={() => setDetailGameId(null)}>×</button></div>
              <div className="detail-stats"><div><span>{baseData.label}局数</span><strong>{Math.round(detailGame.rounds * baseData.plays / 1284)}</strong></div><div><span>游戏占比</span><strong>{detailGame.share}%</strong></div><div><span>本期结余</span><strong className={detailGame.reward >= 0 ? "positive" : "negative"}>{detailGame.reward >= 0 ? "+" : "−"}{compactNumber.format(Math.abs(detailGame.reward))} C</strong></div></div>
              <div className="detail-note"><span aria-hidden="true">✦</span><div><p>你的亮点</p><strong>{detailGame.streak}</strong></div></div>
              <button className="primary-action" type="button" onClick={() => { setDetailGameId(null); showToast(`已打开 ${detailGame.name}（交互演示）`); }}>去玩一局</button>
            </section>
          </div>
        )}
        <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
      </div>
    </main>
  );
}
