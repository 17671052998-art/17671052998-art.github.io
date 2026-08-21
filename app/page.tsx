"use client";

import { CaretDownIcon, CheckIcon, CrownIcon, DiceFiveIcon, GameControllerIcon, RocketLaunchIcon, SpinnerBallIcon, XIcon, type Icon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

type View = "overview" | "users";
type Vendor = "热游" | "灵仙";
type DetailPeriod = "day" | "week" | "month";

type GameRow = {
  game: string; region: string; active: number; plays: number;
  input: number; output: number; net: number; rate: number; rank: string;
};

type UserRow = {
  id: string; nickname: string; region: string; game: string; days: number; plays: number;
  input: number; output: number; net: number; rate: number; latest: string; rank: string;
};

type GameUserRanking = {
  id: string; nickname: string; region: string; plays: number;
  input: number; output: number; net: number; rate: number;
};

const regions = ["阿拉伯", "土耳其", "印度", "印尼", "巴基斯坦", "孟加拉", "菲律宾", "巴西", "其他"];

const games: GameRow[] = [
  { game: "Lucky Wheel", region: "印尼", active: 28420, plays: 186230, input: 5610200, output: 5091880, net: 518320, rate: 90.76, rank: "Top 1" },
  { game: "Crash", region: "菲律宾", active: 19860, plays: 142680, input: 4382400, output: 4078920, net: 303480, rate: 93.08, rank: "Top 2" },
  { game: "Slot King", region: "阿拉伯", active: 15320, plays: 98410, input: 3316200, output: 2968360, net: 347840, rate: 89.51, rank: "Top 3" },
  { game: "Dice", region: "土耳其", active: 11940, plays: 74260, input: 2008800, output: 1859200, net: 149600, rate: 92.55, rank: "Top 4" },
  { game: "Lucky Wheel", region: "印度", active: 6380, plays: 41260, input: 1084200, output: 1014240, net: 69960, rate: 93.55, rank: "Top 5" },
  { game: "Crash", region: "巴基斯坦", active: 4500, plays: 28640, input: 782400, output: 741120, net: 41280, rate: 94.72, rank: "Top 6" },
];

const gameCatalog: Record<string, { icon: Icon; color: string; id: string; vendor: Vendor }> = {
  "Lucky Wheel": { icon: SpinnerBallIcon, color: "#409eff", id: "GAME-10001", vendor: "热游" },
  Crash: { icon: RocketLaunchIcon, color: "#7c3aed", id: "GAME-10002", vendor: "热游" },
  "Slot King": { icon: CrownIcon, color: "#f59e0b", id: "GAME-10003", vendor: "灵仙" },
  Dice: { icon: DiceFiveIcon, color: "#16a34a", id: "GAME-10004", vendor: "灵仙" },
};

const vendorGames: Record<Vendor, string[]> = {
  热游: ["Lucky Wheel", "Crash"],
  灵仙: ["Slot King", "Dice"],
};

const vendorAllValue = (vendor: Vendor) => `${vendor}全部游戏`;
const gameFilterVendor = (value: string) => (Object.keys(vendorGames) as Vendor[]).find((vendor) => value === vendorAllValue(vendor));
const gameFilterMatches = (gameName: string, filterValue: string) => {
  const vendor = gameFilterVendor(filterValue);
  return filterValue === "全部游戏" || (vendor ? vendorGames[vendor].includes(gameName) : gameName === filterValue);
};
const gameFilterLabel = (value: string) => {
  const vendor = gameFilterVendor(value);
  return vendor ? `${vendor} · 全部游戏` : value;
};

const users: UserRow[] = [
  { id: "9382711", nickname: "Mia", region: "印尼", game: "Lucky Wheel", days: 14, plays: 386, input: 18620, output: 16880, net: 1740, rate: 90.66, latest: "2026-07-17 10:22", rank: "Top 1" },
  { id: "827160", nickname: "Leo", region: "菲律宾", game: "Crash", days: 12, plays: 322, input: 15480, output: 14930, net: 550, rate: 96.45, latest: "2026-07-17 10:18", rank: "Top 1" },
  { id: "716049", nickname: "Sana", region: "阿拉伯", game: "Slot King", days: 10, plays: 268, input: 12260, output: 10940, net: 1320, rate: 89.23, latest: "2026-07-17 09:58", rank: "Top 1" },
  { id: "605938", nickname: "Nora", region: "土耳其", game: "Dice", days: 9, plays: 224, input: 9860, output: 8760, net: 1100, rate: 88.84, latest: "2026-07-17 09:42", rank: "Top 1" },
  { id: "594827", nickname: "Ava", region: "印度", game: "Crash", days: 8, plays: 198, input: 8420, output: 8180, net: 240, rate: 97.15, latest: "2026-07-17 09:16", rank: "Top 2" },
  { id: "483716", nickname: "Omar", region: "巴基斯坦", game: "Lucky Wheel", days: 7, plays: 176, input: 7880, output: 6920, net: 960, rate: 87.82, latest: "2026-07-17 08:55", rank: "Top 3" },
  { id: "372605", nickname: "Lina", region: "孟加拉", game: "Slot King", days: 6, plays: 152, input: 6740, output: 5980, net: 760, rate: 88.72, latest: "2026-07-17 08:30", rank: "Top 3" },
  { id: "261594", nickname: "Noah", region: "巴西", game: "Dice", days: 5, plays: 128, input: 5260, output: 4920, net: 340, rate: 93.54, latest: "2026-07-17 08:04", rank: "Top 3" },
  { id: "150483", nickname: "Rani", region: "其他", game: "Lucky Wheel", days: 5, plays: 118, input: 4920, output: 4610, net: 310, rate: 93.70, latest: "2026-07-16 23:41", rank: "Top 4" },
  { id: "049372", nickname: "Tara", region: "印尼", game: "Crash", days: 4, plays: 96, input: 4380, output: 4060, net: 320, rate: 92.69, latest: "2026-07-16 22:26", rank: "Top 4" },
  { id: "938150", nickname: "Fahd", region: "阿拉伯", game: "Dice", days: 4, plays: 88, input: 3940, output: 3610, net: 330, rate: 91.62, latest: "2026-07-16 21:18", rank: "Top 5" },
  { id: "827049", nickname: "Jose", region: "菲律宾", game: "Lucky Wheel", days: 3, plays: 72, input: 3210, output: 3050, net: 160, rate: 95.02, latest: "2026-07-16 20:05", rank: "Top 5" },
];

const detailPeriodConfig: Record<DetailPeriod, { label: string; scope: string; scale: number }> = {
  day: { label: "按日", scope: "2026-07-17", scale: 0.12 },
  week: { label: "按周", scope: "2026-07-13 至 2026-07-19", scale: 0.56 },
  month: { label: "按月", scope: "2026-07-01 至 2026-07-31", scale: 1.75 },
};

function buildGameUserRankings(gameName: string, period: DetailPeriod): GameUserRanking[] {
  const config = detailPeriodConfig[period];
  return users.filter((user) => user.game === gameName).map((user) => {
    const input = Math.max(1, Math.round(user.input * config.scale));
    const rate = user.rate;
    const output = Math.round(input * rate / 100);
    return {
      id: user.id,
      nickname: user.nickname,
      region: user.region,
      plays: Math.max(1, Math.round(user.plays * config.scale)),
      input,
      output,
      net: input - output,
      rate,
    };
  }).sort((a, b) => b.input - a.input);
}

const navItems = [
  ["⌂", "首页"], ["⚙", "系统管理"], ["◉", "用户管理"], ["◆", "充值管理"],
  ["●", "运营管理"], ["▣", "房间管理"], ["◈", "游戏管理"], ["▤", "报表中心"],
];

const format = new Intl.NumberFormat("zh-CN");
const moneyText = (value: number) => format.format(value);
const amountUnitFormat = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });
const amountUnitText = (value: number) => {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absoluteValue >= 100_000_000) return `${sign}${amountUnitFormat.format(absoluteValue / 100_000_000)} 亿`;
  if (absoluteValue >= 10_000) return `${sign}${amountUnitFormat.format(absoluteValue / 10_000)} 万`;
  return `${moneyText(value)} 金币`;
};

function Money({ value }: { value: number }) {
  const amount = moneyText(value);
  return <span className="money-value" aria-label={`${amount} 金币`}><img src="/coin.png" alt="" aria-hidden="true" /><span>{amount}</span></span>;
}

const money = (value: number) => <Money value={value} />;

function MetricCard({ mark, title, value, note, tone, valueTitle, valueHint }: { mark: string; title: string; value: React.ReactNode; note: string; tone: string; valueTitle?: string; valueHint?: string }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}>{mark}</span><div className="metric-copy"><p>{title}</p><small>{note}</small></div><div className="metric-value-block"><strong title={valueTitle}>{value}</strong>{valueHint && <small className="metric-value-hint">{valueHint}</small>}</div></article>;
}

function FilterField({ label, children, wide = false, error }: { label: string; children: React.ReactNode; wide?: boolean; error?: string }) {
  return <label className={`filter-field ${wide ? "wide" : ""} ${error ? "has-error" : ""}`}><span>{label}</span>{children}{error && <em>{error}</em>}</label>;
}

function GameSelector({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState<Vendor>(() => gameFilterVendor(value) ?? gameCatalog[value]?.vendor ?? "热游");
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedMeta = gameCatalog[value];

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function selectGame(next: string) {
    onChange(next);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  const SelectedIcon = selectedMeta?.icon ?? GameControllerIcon;

  return (
    <div className="game-selector" ref={selectorRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`game-selector-trigger ${open ? "open" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) setVendor(gameFilterVendor(value) ?? selectedMeta?.vendor ?? "热游");
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="game-selector-value">
          <span className="game-selector-value-icon" style={selectedMeta ? { color: selectedMeta.color, background: `${selectedMeta.color}18` } : undefined}>
            <SelectedIcon size={17} weight="duotone" aria-hidden="true" />
          </span>
          <span>{gameFilterLabel(value)}</span>
        </span>
        <CaretDownIcon size={15} weight="bold" className="game-selector-caret" aria-hidden="true" />
      </button>

      {open && (
        <section className="game-selector-panel" role="dialog" aria-label="选择游戏">
          <div className="game-selector-panel-head">
            <div><strong>选择游戏</strong><span>选择厂商后可选全部游戏或单选游戏</span></div>
          </div>

          <div className="vendor-switch" role="group" aria-label="游戏厂商">
            {(Object.keys(vendorGames) as Vendor[]).map((item) => (
              <button key={item} type="button" className={vendor === item ? "active" : ""} aria-pressed={vendor === item} onClick={() => setVendor(item)}>{item}</button>
            ))}
          </div>

          <div className="vendor-game-list" role="radiogroup" aria-label={`${vendor}游戏列表`}>
            {(() => {
              const selected = value === vendorAllValue(vendor);
              return (
                <button type="button" role="radio" aria-checked={selected} className={`vendor-all-option ${selected ? "selected" : ""}`} onClick={() => selectGame(vendorAllValue(vendor))}>
                  <span className="vendor-game-icon"><GameControllerIcon size={20} weight="duotone" aria-hidden="true" /></span>
                  <span><strong>{vendor} · 全部游戏</strong><small>汇总该厂商旗下全部游戏</small></span>
                  <span className="game-radio" aria-hidden="true">{selected && <CheckIcon size={12} weight="bold" />}</span>
                </button>
              );
            })()}
            {vendorGames[vendor].map((gameName) => {
              const meta = gameCatalog[gameName];
              const GameIcon = meta.icon;
              const selected = value === gameName;
              return (
                <button key={gameName} type="button" role="radio" aria-checked={selected} className={selected ? "selected" : ""} onClick={() => selectGame(gameName)}>
                  <span className="vendor-game-icon" style={{ color: meta.color, background: `${meta.color}18` }}><GameIcon size={20} weight="duotone" aria-hidden="true" /></span>
                  <span><strong>{gameName}</strong><small>{meta.id}</small></span>
                  <span className="game-radio" aria-hidden="true">{selected && <CheckIcon size={12} weight="bold" />}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function GameCell({ name }: { name: string }) {
  const meta = gameCatalog[name] ?? { icon: GameControllerIcon, color: "#667085", id: "待确认", vendor: "热游" as Vendor };
  const GameIcon = meta.icon;

  return (
    <div className="game-cell">
      <span className="game-icon" style={{ color: meta.color, background: `${meta.color}18` }} aria-hidden="true"><GameIcon size={16} weight="duotone" /></span>
      <b>{name}</b>
      <span className="game-info-wrap">
        <button type="button" className="game-info-button" aria-label={`查看 ${name} 游戏信息`}>?</button>
        <span className="game-popover" role="tooltip">
          <span className="game-popover-head">
            <span className="game-popover-icon" style={{ color: meta.color, background: `${meta.color}18` }} aria-hidden="true"><GameIcon size={22} weight="duotone" /></span>
            <span><small>游戏资料</small><strong>{name}</strong></span>
          </span>
          <span className="game-meta-row"><em>游戏 ID</em><b>{meta.id}</b></span>
          <span className="game-meta-row"><em>游戏厂商</em><b>{meta.vendor}</b></span>
        </span>
      </span>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [region, setRegion] = useState("全部区域");
  const [game, setGame] = useState(vendorAllValue("热游"));
  const [userId, setUserId] = useState("");
  const [userRegion, setUserRegion] = useState("全部区域");
  const [userGame, setUserGame] = useState(vendorAllValue("热游"));
  const [userKeyword, setUserKeyword] = useState("");
  const [sort, setSort] = useState("净值降序");
  const [appliedUser, setAppliedUser] = useState({ keyword: "", region: "全部区域", game: vendorAllValue("热游"), sort: "净值降序" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminMenu, setAdminMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [exportConfirm, setExportConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [detailGame, setDetailGame] = useState<GameRow | null>(null);
  const [detailPeriod, setDetailPeriod] = useState<DetailPeriod>("day");
  const [detailRegion, setDetailRegion] = useState("全部区域");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!detailGame) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => detailCloseRef.current?.focus());
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDetailGame(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [detailGame]);

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }

  function simulateQuery(message = "查询完成，数据已更新") {
    setLoading(true);
    setTimeout(() => { setLoading(false); notify(message); }, 520);
  }

  const filteredGames = useMemo(() => {
    const selectedUser = userId ? users.find((row) => row.id === userId) : undefined;
    return games.filter((row) =>
      (region === "全部区域" || row.region === region) &&
      gameFilterMatches(row.game, game) &&
      (!userId || (!!selectedUser && row.region === selectedUser.region && row.game === selectedUser.game))
    );
  }, [region, game, userId]);

  const regionInvestmentStats = useMemo(() => {
    const byRegion = new Map<string, { input: number; output: number }>();
    filteredGames.forEach((row) => {
      const current = byRegion.get(row.region) ?? { input: 0, output: 0 };
      byRegion.set(row.region, { input: current.input + row.input, output: current.output + row.output });
    });
    return [...byRegion.entries()].map(([regionName, values]) => ({ region: regionName, ...values })).sort((a, b) => b.input - a.input);
  }, [filteredGames]);

  const filteredUsers = useMemo(() => {
    const keyword = appliedUser.keyword.trim().toLowerCase();
    const rows = users.filter((row) =>
      (!keyword || row.id.includes(keyword) || row.nickname.toLowerCase().includes(keyword)) &&
      (appliedUser.region === "全部区域" || row.region === appliedUser.region) &&
      gameFilterMatches(row.game, appliedUser.game)
    );
    return [...rows].sort((a, b) => appliedUser.sort === "游戏次数降序" ? b.plays - a.plays : appliedUser.sort === "最近游戏时间" ? b.latest.localeCompare(a.latest) : b.net - a.net);
  }, [appliedUser]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const detailRankings = useMemo(() => detailGame ? buildGameUserRankings(detailGame.game, detailPeriod).filter((row) => detailRegion === "全部区域" || row.region === detailRegion) : [], [detailGame, detailPeriod, detailRegion]);
  const detailTotals = useMemo(() => {
    const totals = detailRankings.reduce((sum, row) => ({
      plays: sum.plays + row.plays,
      input: sum.input + row.input,
      output: sum.output + row.output,
      net: sum.net + row.net,
    }), { plays: 0, input: 0, output: 0, net: 0 });
    return { ...totals, rate: totals.input ? totals.output / totals.input * 100 : 0 };
  }, [detailRankings]);
  const detailGameMeta = detailGame ? gameCatalog[detailGame.game] : undefined;
  const DetailGameIcon = detailGameMeta?.icon ?? GameControllerIcon;
  const activeDetailConfig = detailPeriodConfig[detailPeriod];

  function switchView(next: View) {
    setView(next); setPage(1);
  }

  function queryUsers() {
    setAppliedUser({ keyword: userKeyword, region: userRegion, game: userGame, sort });
    setPage(1); setLoading(true);
    setTimeout(() => { setLoading(false); notify("查询完成，已更新用户列表"); }, 520);
  }

  function resetOverview() {
    setRegion("全部区域"); setGame(vendorAllValue("热游")); setUserId(""); notify("筛选条件已重置");
  }

  function resetUsers() {
    setUserKeyword(""); setUserRegion("全部区域"); setUserGame(vendorAllValue("热游")); setSort("净值降序");
    setAppliedUser({ keyword: "", region: "全部区域", game: vendorAllValue("热游"), sort: "净值降序" }); setPage(1); notify("筛选条件已重置");
  }

  function openGameDetails(gameRow: GameRow) {
    setDetailPeriod("day");
    setDetailRegion("全部区域");
    setDetailGame(gameRow);
  }

  function performExport() {
    setExporting(true);
    setTimeout(() => {
      const rows = view === "overview" ? filteredGames : filteredUsers;
      const header = view === "overview" ? ["游戏", "区域", "活跃用户", "游戏次数", "用户投入", "用户出奖", "净值", "返奖率", "热度"] : ["用户ID", "昵称", "区域", "偏好游戏", "活跃天数", "游戏次数", "用户投入", "用户出奖", "净值", "返奖率", "最近游戏时间", "偏好排名"];
      const exportRows = view === "overview"
        ? (rows as GameRow[]).map((row) => [row.game, row.region, row.active, row.plays, row.input, row.output, row.net, row.rate, row.rank])
        : (rows as UserRow[]).map((row) => [row.id, row.nickname, row.region, row.game, row.days, row.plays, row.input, row.output, row.net, row.rate, row.latest, row.rank]);
      const body = exportRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","));
      const blob = new Blob(["\ufeff" + [header.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = view === "overview" ? "游戏数据报表.csv" : "游戏用户列表.csv"; anchor.click(); URL.revokeObjectURL(url);
      setExporting(false); setExportConfirm(false); notify(`已导出 ${rows.length} 条数据`);
    }, 620);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.(); else await document.exitFullscreen?.();
  }

  return (
    <main className={`admin-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand-block"><strong>Hawk Admin</strong><span>管理后台</span></div>
        <nav aria-label="后台主导航">
          {navItems.map(([icon, label]) => (
            <button key={label} type="button" className={label === "游戏管理" ? "active" : ""} onClick={() => label === "游戏管理" ? notify("当前位于游戏管理模块") : notify(`${label}为演示导航入口`)}><i>{icon}</i><span>{label}</span></button>
          ))}
          <div className="submenu"><span>游戏数据报表</span></div>
        </nav>
        <div className="sidebar-footer"><span className="status-dot" /> 系统运行正常</div>
      </aside>

      <div className="workspace">
        <header className="top-header">
          <div className="header-left"><button type="button" className="icon-button collapse-button" aria-label="折叠侧栏" onClick={() => setSidebarCollapsed((value) => !value)}>☰</button><span className="breadcrumb">首页 / 游戏管理 / <b>游戏数据报表</b></span></div>
          <div className="header-actions">
            <button type="button" className="icon-button" aria-label="全局搜索" onClick={() => setSearchOpen((value) => !value)}>⌕</button>
            <button type="button" className="icon-button" aria-label="全屏" onClick={toggleFullscreen}>⛶</button>
            <div className="admin-account"><button type="button" onClick={() => setAdminMenu((value) => !value)}><span className="admin-avatar">管</span>管理员 <i>⌄</i></button>{adminMenu && <div className="admin-menu"><button type="button" onClick={() => notify("个人资料为演示入口")}>个人资料</button><button type="button" onClick={() => notify("当前演示环境不支持退出")}>退出登录</button></div>}</div>
          </div>
          {searchOpen && <div className="global-search"><span>⌕</span><input autoFocus placeholder="搜索菜单或功能" onKeyDown={(event) => { if (event.key === "Enter") notify(`未找到“${event.currentTarget.value}”相关功能`); }} /><button type="button" onClick={() => setSearchOpen(false)}>×</button></div>}
        </header>

        <div className="page-tabs"><button type="button">home</button><button type="button" className="active"><span>●</span> 游戏数据报表 <i>×</i></button></div>

        <section className="page-content">
          <div className="page-title"><div><h1>游戏数据报表</h1><p>按区域、游戏或用户维度查询用户投入、用户出奖、返奖率与净值。</p></div><button type="button" className="refresh-link" onClick={() => simulateQuery("数据刷新完成")}>↻ 刷新数据</button></div>
          <div className="business-tabs" role="tablist"><button role="tab" aria-selected={view === "overview"} className={view === "overview" ? "active" : ""} onClick={() => switchView("overview")}>总览报表</button><button role="tab" aria-selected={view === "users"} className={view === "users" ? "active" : ""} onClick={() => switchView("users")}>游戏用户列表</button></div>

          {view === "overview" ? (
            <>
              <section className="panel filter-panel overview-filters">
                <FilterField label="区域"><select value={region} onChange={(event) => setRegion(event.target.value)}><option>全部区域</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></FilterField>
                <div className="filter-field game-filter-field"><span>游戏</span><GameSelector value={game} onChange={setGame} /></div>
                <FilterField label="用户ID"><input inputMode="numeric" placeholder="请输入完整用户ID" value={userId} onChange={(event) => setUserId(event.target.value.replace(/\D/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") simulateQuery(); }} /></FilterField>
                <FilterField label="统计日期" wide><input value="2026-07-01  -  2026-07-17" readOnly /></FilterField>
                <div className="filter-actions"><button type="button" className="primary" onClick={() => simulateQuery()}>查询</button><button type="button" onClick={resetOverview}>重置</button><button type="button" className="success" onClick={() => setExportConfirm(true)}>导出报表</button></div>
                <span className="update-time">数据更新时间：10:30</span>
              </section>

              <section className="overview-metrics">
                <MetricCard mark="活" title="活跃游戏用户" value="86,420" note="较上周期 +12.6%" tone="blue" />
                <MetricCard mark="投" title="用户投入" value={<Money value={16_480_200} />} valueTitle={`完整金额：${moneyText(16_480_200)} 金币`} valueHint={amountUnitText(16_480_200)} note="用户实际投入金额" tone="amber" />
                <MetricCard mark="奖" title="用户出奖" value={<Money value={14_998_360} />} valueTitle={`完整金额：${moneyText(14_998_360)} 金币`} valueHint={amountUnitText(14_998_360)} note="游戏返奖/派奖金额" tone="red" />
                <MetricCard mark="净" title="净值" value={<Money value={1_481_840} />} valueTitle={`完整金额：${moneyText(1_481_840)} 金币`} valueHint={amountUnitText(1_481_840)} note="用户投入 - 用户出奖" tone="cyan" />
                <MetricCard mark="返" title="返奖率" value="91.01%" note="用户出奖 ÷ 用户投入 × 100%" tone="green" />
              </section>

              <section className="analytics-row">
                <article className="panel regional-statistics-panel"><div className="panel-title"><h2>游戏区域资金统计</h2><span>{gameFilterVendor(game) ? `按区域汇总${gameFilterLabel(game)}的用户投入与用户出奖` : `${game} 各区域用户投入与用户出奖`}</span></div><div className="region-stat-head" aria-hidden="true"><span>排名</span><span>区域</span><span>游戏</span><span>用户投入</span><span>用户出奖</span></div><div className="region-stat-list">{regionInvestmentStats.length ? regionInvestmentStats.map((item, index) => <div className="region-stat-row" key={item.region}><b className={index === 0 ? "first" : ""}>{index + 1}</b><strong>{item.region}</strong><span>{gameFilterLabel(game)}</span><em title={`${moneyText(item.input)} 金币`}>{money(item.input)}</em><em title={`${moneyText(item.output)} 金币`}>{money(item.output)}</em></div>) : <div className="region-stat-empty">暂无匹配区域数据</div>}</div></article>
              </section>

              <section className="panel table-panel"><div className="table-heading"><div><h2>游戏汇总数据</h2><span>悬浮问号查看游戏资料，点击“用户明细”查看该游戏的用户排行</span></div><button type="button" className="table-tool" onClick={() => setExportConfirm(true)}>⇩ 导出当前结果</button></div><div className="table-wrap game-table-wrap"><table><thead><tr><th>游戏</th><th>区域</th><th>活跃用户</th><th>游戏次数</th><th>用户投入</th><th>用户出奖</th><th>净值</th><th>返奖率</th><th>热度</th><th>操作</th></tr></thead><tbody>{loading ? <tr><td colSpan={10}><div className="loading-state"><span />正在加载报表数据…</div></td></tr> : filteredGames.length ? filteredGames.slice(0, 4).map((row) => <tr key={`${row.region}-${row.game}`}><td><GameCell name={row.game} /></td><td>{row.region}</td><td>{format.format(row.active)}</td><td>{format.format(row.plays)}</td><td>{money(row.input)}</td><td>{money(row.output)}</td><td>{money(row.net)}</td><td>{row.rate.toFixed(2)}%</td><td>{row.rank}</td><td><button type="button" className="row-action" onClick={() => openGameDetails(row)}>用户明细</button></td></tr>) : <tr><td colSpan={10}><div className="empty-state"><b>未找到匹配数据</b><span>请调整区域、游戏或用户筛选条件后重试。</span><button type="button" onClick={resetOverview}>清除筛选</button></div></td></tr>}</tbody></table></div><div className="pagination"><span>共 {filteredGames.length} 条 ｜ 20 条/页</span><button className="active" type="button">1</button><button type="button" disabled>2</button></div></section>
            </>
          ) : (
            <>
              <section className="panel filter-panel user-filters">
                <FilterField label="用户ID"><input placeholder="请输入用户ID / 昵称" value={userKeyword} onChange={(event) => setUserKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") queryUsers(); }} /></FilterField>
                <FilterField label="区域"><select value={userRegion} onChange={(event) => setUserRegion(event.target.value)}><option>全部区域</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></FilterField>
                <div className="filter-field game-filter-field"><span>游戏</span><GameSelector value={userGame} onChange={setUserGame} /></div>
                <FilterField label="统计日期" wide><input value="2026-07-01  -  2026-07-17" readOnly /></FilterField>
                <FilterField label="排序方式"><select value={sort} onChange={(event) => setSort(event.target.value)}><option>净值降序</option><option>游戏次数降序</option><option>最近游戏时间</option></select></FilterField>
                <div className="filter-actions"><button type="button" className="primary" onClick={queryUsers}>查询</button><button type="button" onClick={resetUsers}>重置</button><button type="button" className="success" onClick={() => setExportConfirm(true)}>导出用户表</button></div>
                <span className="query-hint">支持精确用户ID查询</span>
              </section>

              <section className="user-metrics"><MetricCard mark="查" title="查询用户数" value={format.format(filteredUsers.length ? 86420 : 0)} note="当前筛选条件下用户数" tone="blue" /><MetricCard mark="高" title="高频游戏用户" value="12,680" note="近7日游戏 ≥ 35次" tone="violet" /><MetricCard mark="人" title="人均用户投入" value={<Money value={190.70} />} note="总用户投入 ÷ 投入用户数" tone="amber" /><MetricCard mark="返" title="平均返奖率" value="89.64%" note="用户出奖 ÷ 用户投入" tone="green" /></section>

              <section className="panel table-panel user-table-panel"><div className="table-heading"><div><h2>游戏用户明细</h2><span>用于查询单个用户的游戏偏好、用户投入、用户出奖、净值与返奖率表现。</span></div><button type="button" className="table-tool" onClick={() => setExportConfirm(true)}>⇩ 导出当前结果</button></div><div className="table-wrap"><table><thead><tr><th>用户ID</th><th>昵称</th><th>区域</th><th>偏好游戏</th><th>活跃天数</th><th>游戏次数</th><th>用户投入</th><th>用户出奖</th><th>净值</th><th>返奖率</th><th>最近游戏时间</th><th>偏好排名</th></tr></thead><tbody>{loading ? <tr><td colSpan={12}><div className="loading-state"><span />正在加载用户数据…</div></td></tr> : visibleUsers.length ? visibleUsers.map((row) => <tr key={row.id}><td><b>{row.id}</b></td><td>{row.nickname}</td><td>{row.region}</td><td><button type="button" className="text-link" onClick={() => { setUserGame(row.game); notify(`已选择 ${row.game}`); }}>{row.game}</button></td><td>{row.days}天</td><td>{format.format(row.plays)}</td><td>{money(row.input)}</td><td>{money(row.output)}</td><td>{money(row.net)}</td><td className={row.rate >= 95 ? "rate-good" : ""}>{row.rate.toFixed(2)}%</td><td>{row.latest}</td><td><span className={`rank-tag ${row.rank.replace(" ", "-").toLowerCase()}`}>{row.rank}</span></td></tr>) : <tr><td colSpan={12}><div className="empty-state"><b>未找到匹配用户</b><span>请检查用户 ID、区域或游戏条件。</span><button type="button" onClick={resetUsers}>清除筛选</button></div></td></tr>}</tbody></table></div><div className="table-footer"><span>净值 = 用户投入 - 用户出奖；返奖率 = 用户出奖 ÷ 用户投入 × 100%。</span><div className="pagination"><span>共 {format.format(filteredUsers.length)} 条 ｜ {pageSize} 条/页</span>{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} type="button" className={page === index + 1 ? "active" : ""} onClick={() => setPage(index + 1)}>{index + 1}</button>)}</div></div></section>
            </>
          )}
        </section>
      </div>

      {detailGame && detailGameMeta && (
        <div className="modal-layer game-detail-layer">
          <button className="modal-backdrop" type="button" aria-label="关闭游戏用户明细" onClick={() => setDetailGame(null)} />
          <section className="game-detail-modal" role="dialog" aria-modal="true" aria-labelledby="game-detail-title" aria-describedby="game-detail-scope">
            <header className="game-detail-head">
              <div className="game-detail-identity">
                <span className="game-detail-avatar" style={{ color: detailGameMeta.color, background: `${detailGameMeta.color}18` }}><DetailGameIcon size={28} weight="duotone" aria-hidden="true" /></span>
                <div><h2 id="game-detail-title">{detailGame.game} 用户游戏排行</h2><p>{detailGameMeta.id} · {detailGameMeta.vendor} · {detailRegion}</p></div>
              </div>
              <button ref={detailCloseRef} type="button" className="game-detail-close" aria-label="关闭游戏用户明细" onClick={() => setDetailGame(null)}><XIcon size={18} weight="bold" aria-hidden="true" /></button>
            </header>

            <div className="game-detail-toolbar">
              <div className="game-detail-controls">
                <div className="detail-period-tabs" role="tablist" aria-label="统计维度">
                  {(Object.keys(detailPeriodConfig) as DetailPeriod[]).map((period) => <button key={period} type="button" role="tab" aria-selected={detailPeriod === period} className={detailPeriod === period ? "active" : ""} onClick={() => setDetailPeriod(period)}>{detailPeriodConfig[period].label}</button>)}
                </div>
                <label className="game-detail-region-filter"><span>区域</span><select aria-label="区域筛选" value={detailRegion} onChange={(event) => setDetailRegion(event.target.value)}><option>全部区域</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
              </div>
              <div className="game-detail-scope" id="game-detail-scope"><span>统计范围：{activeDetailConfig.scope}</span><small>共 {detailRankings.length} 位用户 · 按用户投入降序</small></div>
            </div>

            <div className="game-detail-metrics">
              <div><span>游戏下注次数</span><strong>{format.format(detailTotals.plays)}</strong></div>
              <div><span>用户投入</span><strong>{money(detailTotals.input)}</strong></div>
              <div><span>用户出奖</span><strong>{money(detailTotals.output)}</strong></div>
              <div><span>净值</span><strong>{money(detailTotals.net)}</strong></div>
              <div><span>返奖率</span><strong>{detailTotals.rate.toFixed(2)}%</strong></div>
            </div>

            <div className="game-detail-table-wrap">
              <table className="game-detail-table">
                <thead><tr><th>用户信息</th><th>游戏下注次数</th><th>用户投入</th><th>用户出奖</th><th>净值</th><th>返奖率</th></tr></thead>
                <tbody>{detailRankings.length ? detailRankings.map((row, index) => <tr key={row.id}><td><div className="game-detail-user"><span className={`game-detail-rank rank-${index + 1}`}>{index + 1}</span><span className="game-detail-user-avatar">{row.nickname.slice(0, 1).toUpperCase()}</span><span className="game-detail-user-copy"><strong>{row.nickname}</strong><small>ID {row.id} · {row.region}</small></span></div></td><td>{format.format(row.plays)}</td><td>{money(row.input)}</td><td>{money(row.output)}</td><td>{money(row.net)}</td><td className={row.rate >= 95 ? "rate-good" : ""}>{row.rate.toFixed(2)}%</td></tr>) : <tr><td colSpan={6}><div className="game-detail-empty"><b>暂无用户数据</b><span>{detailGame.game} 在“{detailRegion}”暂无用户记录</span></div></td></tr>}</tbody>
              </table>
            </div>

            <footer className="game-detail-footer"><span>净值 = 用户投入 - 用户出奖；返奖率 = 用户出奖 ÷ 用户投入 × 100%。</span><button type="button" onClick={() => setDetailGame(null)}>关闭</button></footer>
          </section>
        </div>
      )}

      {exportConfirm && <div className="modal-layer"><button className="modal-backdrop" type="button" aria-label="关闭导出确认" onClick={() => !exporting && setExportConfirm(false)} /><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="export-title"><span className="confirm-icon">⇩</span><h2 id="export-title">确认导出数据？</h2><p>将按当前筛选条件导出 {view === "overview" ? filteredGames.length : filteredUsers.length} 条{view === "overview" ? "游戏汇总" : "用户明细"}数据，文件格式为 CSV。</p><div><button type="button" disabled={exporting} onClick={() => setExportConfirm(false)}>取消</button><button type="button" className="success" disabled={exporting} onClick={performExport}>{exporting ? "生成中…" : "确认导出"}</button></div></section></div>}
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite"><span>✓</span>{toast}</div>
    </main>
  );
}
