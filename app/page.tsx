"use client";

import { CaretDownIcon, CheckIcon, CrownIcon, DiceFiveIcon, GameControllerIcon, MagnifyingGlassIcon, RocketLaunchIcon, SpinnerBallIcon, XIcon, type Icon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

type View = "overview" | "users";
type Vendor = "热游" | "灵仙";

type DetailSortKey = "plays" | "input" | "output" | "net" | "rate";
type UserSortKey = "plays" | "input" | "output" | "net";
type UserSort = `${UserSortKey}-desc` | `${UserSortKey}-asc`;

type GameRow = {
  game: string; region: string; active: number; plays: number;
  input: number; output: number; net: number; rate: number; rank: string;
};

type UserRow = {
  id: string; nickname: string; region: string; game: string; days: number; plays: number;
  input: number; output: number; net: number; rate: number; latest: string; rank: string;
};

type UserGameRow = UserRow & { gameRank: number };

type GameUserRanking = {
  id: string; nickname: string; region: string; plays: number;
  input: number; output: number; net: number; rate: number;
};

const regions = ["阿拉伯", "土耳其", "印度", "印尼", "巴基斯坦", "孟加拉", "菲律宾", "巴西", "其他"];

const baseGames: GameRow[] = [
  { game: "Lucky Wheel", region: "印尼", active: 28420, plays: 186230, input: 5610200, output: 5091880, net: 518320, rate: 90.76, rank: "Top 1" },
  { game: "Crash", region: "菲律宾", active: 19860, plays: 142680, input: 4382400, output: 4078920, net: 303480, rate: 93.08, rank: "Top 2" },
  { game: "Slot King", region: "阿拉伯", active: 15320, plays: 98410, input: 3316200, output: 2968360, net: 347840, rate: 89.51, rank: "Top 3" },
  { game: "Dice", region: "土耳其", active: 11940, plays: 74260, input: 2008800, output: 1859200, net: 149600, rate: 92.55, rank: "Top 4" },
  { game: "Lucky Wheel", region: "印度", active: 6380, plays: 41260, input: 1084200, output: 1112600, net: -28400, rate: 102.62, rank: "Top 5" },
  { game: "Crash", region: "巴基斯坦", active: 4500, plays: 28640, input: 782400, output: 741120, net: 41280, rate: 94.72, rank: "Top 6" },
];

const gameCatalog: Record<string, { icon: Icon; color: string; id: string; vendor: Vendor }> = {
  "Lucky Wheel": { icon: SpinnerBallIcon, color: "#409eff", id: "GAME-10001", vendor: "热游" },
  Crash: { icon: RocketLaunchIcon, color: "#7c3aed", id: "GAME-10002", vendor: "热游" },
  "Slot King": { icon: CrownIcon, color: "#f59e0b", id: "GAME-10003", vendor: "灵仙" },
  Dice: { icon: DiceFiveIcon, color: "#16a34a", id: "GAME-10004", vendor: "灵仙" },
};

const extraGames: { name: string; vendor: Vendor }[] = [
  ...["Turbo Dash", "Neon Spin", "Galaxy Drop", "Gold Miner", "Rocket Rush", "Mystic Cards", "Dragon Vault", "Ocean Catch", "Fruit Fiesta", "Panda Quest", "Jungle Gems", "Candy Blitz", "Pirate Fortune", "Star Casino", "Fire Phoenix", "Treasure Trail", "Royal Reels", "Moon Palace", "Cyber Racer", "Safari Spin", "Crystal Cave", "Desert Gold", "Comet Clash"].map((name) => ({ name, vendor: "热游" as Vendor })),
  ...["Fortune Lotus", "Mega Mahjong", "Tiger Temple", "Ocean Pearl", "Golden Farm", "Dragon Dice", "Wild Buffalo", "Sweet Bonanza", "Vegas Night", "Ninja Strike", "Ancient Tomb", "Lucky Koi", "Diamond Rush", "Space Odyssey", "Mystic Forest", "Coin Carnival", "Phoenix Rise", "Arctic Adventure", "Sunken Treasure", "Rainbow Riches", "Samurai Gold", "Monster Mayhem", "Emerald Isle"].map((name) => ({ name, vendor: "灵仙" as Vendor })),
];

const generatedGameVisuals = [
  { icon: SpinnerBallIcon, color: "#409eff" }, { icon: RocketLaunchIcon, color: "#7c3aed" },
  { icon: CrownIcon, color: "#f59e0b" }, { icon: DiceFiveIcon, color: "#16a34a" },
];

extraGames.forEach(({ name, vendor }, index) => {
  const visual = generatedGameVisuals[index % generatedGameVisuals.length];
  gameCatalog[name] = { ...visual, id: `GAME-${String(10005 + index)}`, vendor };
});

const vendorGames: Record<Vendor, string[]> = {
  热游: Object.entries(gameCatalog).filter(([, meta]) => meta.vendor === "热游").map(([name]) => name),
  灵仙: Object.entries(gameCatalog).filter(([, meta]) => meta.vendor === "灵仙").map(([name]) => name),
};

const baseGameNames = new Set(baseGames.map((row) => row.game));
const games: GameRow[] = [
  ...baseGames,
  ...Object.keys(gameCatalog).filter((game) => !baseGameNames.has(game)).map((game, index) => {
    const input = 1_480_000 - index * 20_400;
    const rate = Number((88.2 + index % 9 * 1.08).toFixed(2));
    const output = Math.round(input * rate / 100);
    return { game, region: regions[index % regions.length], active: 7_800 - index * 95, plays: 48_600 - index * 530, input, output, net: input - output, rate, rank: `Top ${index + 7}` };
  }),
];

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

const detailSortLabels: Record<DetailSortKey, string> = { plays: "游戏下注次数", input: "用户投入", output: "用户出奖", net: "盈亏", rate: "返奖率" };
const userSortOptions: { value: UserSort; label: string }[] = [
  { value: "input-desc", label: "用户投入高到低" }, { value: "input-asc", label: "用户投入低到高" },
  { value: "output-desc", label: "用户出奖高到低" }, { value: "output-asc", label: "用户出奖低到高" },
  { value: "net-desc", label: "盈亏高到低" }, { value: "net-asc", label: "盈亏低到高" },
  { value: "plays-desc", label: "游戏次数高到低" }, { value: "plays-asc", label: "游戏次数低到高" },
];

function buildGameUserRankings(gameName: string): GameUserRanking[] {
  const scale = 0.12;
  return users.flatMap(buildUserGameRows).filter((user) => user.game === gameName).map((user) => {
    const input = Math.max(1, Math.round(user.input * scale));
    const rate = user.rate;
    const output = Math.round(input * rate / 100);
    return {
      id: user.id,
      nickname: user.nickname,
      region: user.region,
      plays: Math.max(1, Math.round(user.plays * scale)),
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

function ProfitLoss({ value }: { value: number }) {
  const loss = value < 0;
  return <span className={`profit-loss ${loss ? "loss" : ""}`} aria-label={`${loss ? "-" : ""}${moneyText(Math.abs(value))} 金币`}>{loss && <span aria-hidden="true">−</span>}<Money value={Math.abs(value)} /></span>;
}

const profitLoss = (value: number) => <ProfitLoss value={value} />;

function buildUserGameRows(user: UserRow): Omit<UserGameRow, "gameRank">[] {
  const gameNames = [user.game, ...Object.keys(gameCatalog).filter((game) => game !== user.game)];
  return gameNames.map((game, index) => {
    const inputWeight = index === 0 ? 1 : Math.max(0.05, 0.64 * Math.pow(0.78, index - 1));
    const rateOffset = (index % 5 - 2) * 0.72;
    const input = Math.max(1, Math.round(user.input * inputWeight));
    const rate = Number(Math.max(82, user.rate + rateOffset).toFixed(2));
    const output = Math.round(input * rate / 100);
    return { ...user, game, input, output, net: input - output, rate, plays: Math.max(1, Math.round(user.plays * inputWeight)) };
  });
}

function MetricCard({ mark, title, value, note, tone, valueTitle, valueHint }: { mark: string; title: string; value: React.ReactNode; note: string; tone: string; valueTitle?: string; valueHint?: string }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}>{mark}</span><div className="metric-copy"><p>{title}</p><small>{note}</small></div><div className="metric-value-block"><strong title={valueTitle}>{value}</strong>{valueHint && <small className="metric-value-hint">{valueHint}</small>}</div></article>;
}

function FilterField({ label, children, wide = false, error }: { label: string; children: React.ReactNode; wide?: boolean; error?: string }) {
  return <label className={`filter-field ${wide ? "wide" : ""} ${error ? "has-error" : ""}`}><span>{label}</span>{children}{error && <em>{error}</em>}</label>;
}

function GameSelector({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState<Vendor>(() => gameFilterVendor(value) ?? gameCatalog[value]?.vendor ?? "热游");
  const [keyword, setKeyword] = useState("");
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
    setKeyword("");
    if (gameCatalog[next]) setVendor(gameCatalog[next].vendor);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  const SelectedIcon = selectedMeta?.icon ?? GameControllerIcon;
  const searchKeyword = keyword.trim().toLowerCase();
  const displayedGames = searchKeyword
    ? Object.keys(gameCatalog).filter((gameName) => gameName.toLowerCase().includes(searchKeyword) || gameCatalog[gameName].id.toLowerCase().includes(searchKeyword))
    : vendorGames[vendor];

  return (
    <div className="game-selector" ref={selectorRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`game-selector-trigger ${open ? "open" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) { setVendor(gameFilterVendor(value) ?? selectedMeta?.vendor ?? "热游"); setKeyword(""); }
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
            <div><strong>选择游戏</strong><span>可选择全部游戏、厂商全部游戏或单项游戏</span></div>
          </div>

          {!searchKeyword && (
            <button type="button" className={`all-games-option ${value === "全部游戏" ? "selected" : ""}`} aria-pressed={value === "全部游戏"} onClick={() => selectGame("全部游戏")}>
              <span className="vendor-game-icon"><GameControllerIcon size={20} weight="duotone" aria-hidden="true" /></span>
              <span><strong>全部游戏</strong><small>汇总热游与灵仙的全部游戏</small></span>
              <span className="game-radio" aria-hidden="true">{value === "全部游戏" && <CheckIcon size={12} weight="bold" />}</span>
            </button>
          )}

          <div className="vendor-switch" role="group" aria-label="游戏厂商">
            {(Object.keys(vendorGames) as Vendor[]).map((item) => (
              <button key={item} type="button" className={vendor === item ? "active" : ""} aria-pressed={vendor === item} onClick={() => { setVendor(item); setKeyword(""); }}>{item}</button>
            ))}
          </div>

          <label className="game-selector-search">
            <MagnifyingGlassIcon size={15} aria-hidden="true" />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索游戏名称 / GAME-xxxxx" aria-label="搜索游戏名称或游戏 ID" />
          </label>

          <div className="vendor-game-list" role="radiogroup" aria-label={`${vendor}游戏列表`}>
            {!searchKeyword && (() => {
              const selected = value === vendorAllValue(vendor);
              return (
                <button type="button" role="radio" aria-checked={selected} className={`vendor-all-option ${selected ? "selected" : ""}`} onClick={() => selectGame(vendorAllValue(vendor))}>
                  <span className="vendor-game-icon"><GameControllerIcon size={20} weight="duotone" aria-hidden="true" /></span>
                  <span><strong>{vendor} · 全部游戏</strong><small>汇总该厂商旗下全部游戏</small></span>
                  <span className="game-radio" aria-hidden="true">{selected && <CheckIcon size={12} weight="bold" />}</span>
                </button>
              );
            })()}
            {displayedGames.map((gameName) => {
              const meta = gameCatalog[gameName];
              const GameIcon = meta.icon;
              const selected = value === gameName;
              return (
                <button key={gameName} type="button" role="radio" aria-checked={selected} className={selected ? "selected" : ""} onClick={() => selectGame(gameName)}>
                  <span className="vendor-game-icon" style={{ color: meta.color, background: `${meta.color}18` }}><GameIcon size={20} weight="duotone" aria-hidden="true" /></span>
                  <span><strong>{gameName}</strong><small>{meta.id} · {meta.vendor}</small></span>
                  <span className="game-radio" aria-hidden="true">{selected && <CheckIcon size={12} weight="bold" />}</span>
                </button>
              );
            })}
            {!displayedGames.length && <div className="game-search-empty">未找到匹配的游戏 ID 或名称</div>}
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

function UserProfileModal({ user, onClose, closeRef }: { user: UserRow; onClose: () => void; closeRef: React.RefObject<HTMLButtonElement | null> }) {
  const gameMeta = gameCatalog[user.game];
  const GameIcon = gameMeta?.icon ?? GameControllerIcon;
  const dimensions = [
    { label: "活跃度", value: Math.min(100, Math.round(user.days / 14 * 100)), detail: `${user.days} 天` },
    { label: "游戏频次", value: Math.min(100, Math.round(user.plays / 400 * 100)), detail: `${format.format(user.plays)} 次` },
    { label: "返奖表现", value: Math.round(user.rate), detail: `${user.rate.toFixed(2)}%` },
  ];
  const point = (value: number, index: number) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / dimensions.length;
    const radius = 61 * value / 100;
    return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`;
  };
  const radarPoints = dimensions.map((dimension, index) => point(dimension.value, index)).join(" ");

  return (
    <div className="modal-layer user-profile-layer">
      <button className="modal-backdrop" type="button" aria-label="关闭用户画像" onClick={onClose} />
      <section className="user-profile-modal" role="dialog" aria-modal="true" aria-labelledby="user-profile-title">
        <header className="user-profile-head">
          <div className="user-profile-identity"><span>{user.nickname.slice(0, 1).toUpperCase()}</span><div><h2 id="user-profile-title">{user.nickname} 用户画像</h2><p>ID {user.id} · {user.region}</p></div></div>
          <button ref={closeRef} type="button" className="game-detail-close" aria-label="关闭用户画像" onClick={onClose}><XIcon size={18} weight="bold" aria-hidden="true" /></button>
        </header>

        <div className="user-profile-content">
          <section className="profile-key-data" aria-label="用户偏好信息">
            <article><span>偏好游戏</span><div className="profile-game"><i style={{ color: gameMeta?.color, background: `${gameMeta?.color ?? "#667085"}18` }}><GameIcon size={19} weight="duotone" aria-hidden="true" /></i><strong>{user.game}</strong></div></article>
            <article><span>偏好排名</span><div><b className={`rank-tag ${user.rank.replace(" ", "-").toLowerCase()}`}>{user.rank}</b></div></article>
            <article><span>最近游戏时间</span><strong>{user.latest}</strong></article>
          </section>

          <div className="profile-charts">
            <article className="profile-chart-card"><div className="profile-chart-title"><h3>游戏行为画像</h3><span>按当前统计周期</span></div><div className="profile-radar-wrap"><svg className="profile-radar" viewBox="0 0 200 200" role="img" aria-label="活跃度、游戏频次和返奖表现雷达图"><polygon points="100,39 47,130.5 153,130.5" /><polygon points="100,69.5 73.5,115.25 126.5,115.25" /><line x1="100" y1="39" x2="100" y2="161" /><line x1="47" y1="130.5" x2="153" y2="130.5" /><line x1="47" y1="130.5" x2="100" y2="39" /><line x1="153" y1="130.5" x2="100" y2="39" /><polygon className="profile-radar-area" points={radarPoints} />{dimensions.map((dimension, index) => { const [x, y] = point(dimension.value, index).split(","); return <circle key={dimension.label} cx={x} cy={y} r="4" />; })}</svg><div className="profile-radar-labels">{dimensions.map((dimension) => <span key={dimension.label}><b>{dimension.label}</b><small>{dimension.detail}</small></span>)}</div></div></article>
            <article className="profile-chart-card"><div className="profile-chart-title"><h3>投入与出奖对比</h3><span>返奖率 {user.rate.toFixed(2)}%</span></div><div className="profile-fund-bars"><div><span>用户投入</span><b><Money value={user.input} /></b><i><em className="input" style={{ width: "100%" }} /></i></div><div><span>用户出奖</span><b><Money value={user.output} /></b><i><em className="output" style={{ width: `${user.rate}%` }} /></i></div><div className="profile-net"><span>盈亏</span><strong><ProfitLoss value={user.net} /></strong><small>用户投入 − 用户出奖</small></div></div></article>
          </div>
        </div>
        <footer className="user-profile-footer"><span>画像数据基于当前用户的游戏明细统计。</span><button type="button" onClick={onClose}>关闭</button></footer>
      </section>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [region, setRegion] = useState("全部区域");
  const [game, setGame] = useState(vendorAllValue("热游"));
  const [userRegion, setUserRegion] = useState("全部区域");
  const [userGame, setUserGame] = useState(vendorAllValue("热游"));
  const [userKeyword, setUserKeyword] = useState("");
  const [sort, setSort] = useState<UserSort>("input-desc");
  const [appliedUser, setAppliedUser] = useState({ keyword: "", region: "全部区域", game: vendorAllValue("热游"), sort: "input-desc" as UserSort });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminMenu, setAdminMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [detailGame, setDetailGame] = useState<GameRow | null>(null);
  const [detailSortKey, setDetailSortKey] = useState<DetailSortKey>("input");
  const [detailSortOrder, setDetailSortOrder] = useState<"desc" | "asc">("desc");
  const [profileUser, setProfileUser] = useState<UserRow | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailCloseRef = useRef<HTMLButtonElement | null>(null);
  const profileCloseRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    if (!profileUser) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => profileCloseRef.current?.focus());
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileUser(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileUser]);

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }

  function simulateQuery(message = "查询完成，数据已更新") {
    setLoading(true);
    setTimeout(() => { setLoading(false); notify(message); }, 520);
  }

  const filteredGames = useMemo(() => games.filter((row) =>
    (region === "全部区域" || row.region === region) && gameFilterMatches(row.game, game)
  ), [region, game]);

  const filteredUsers = useMemo<UserGameRow[]>(() => {
    const keyword = appliedUser.keyword.trim().toLowerCase();
    const rows = users.flatMap(buildUserGameRows).filter((row) =>
      (!keyword || row.id.includes(keyword) || row.nickname.toLowerCase().includes(keyword)) &&
      (appliedUser.region === "全部区域" || row.region === appliedUser.region) &&
      gameFilterMatches(row.game, appliedUser.game)
    );
    const ranks = new Map([...rows].sort((first, second) => second.input - first.input).map((row, index) => [`${row.id}-${row.game}`, index + 1]));
    const [sortKey, sortDirection] = appliedUser.sort.split("-") as [UserSortKey, "desc" | "asc"];
    const sortedRows = [...rows].sort((first, second) => sortDirection === "desc" ? second[sortKey] - first[sortKey] : first[sortKey] - second[sortKey]);
    return sortedRows.map((row) => ({ ...row, gameRank: ranks.get(`${row.id}-${row.game}`) ?? 0 }));
  }, [appliedUser]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const visiblePageItems = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (page <= 4) return [1, 2, 3, 4, "ellipsis", totalPages];
    if (page >= totalPages - 3) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
  }, [page, totalPages]);
  const detailRankings = useMemo(() => {
    if (!detailGame) return [];
    const rows = buildGameUserRankings(detailGame.game);
    return [...rows].sort((first, second) => detailSortOrder === "desc" ? second[detailSortKey] - first[detailSortKey] : first[detailSortKey] - second[detailSortKey]);
  }, [detailGame, detailSortKey, detailSortOrder]);
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

  function switchView(next: View) {
    if (next === "users" && region !== "全部区域") {
      setUserRegion(region);
      setAppliedUser((current) => ({ ...current, region }));
    }
    setView(next); setPage(1);
  }

  function selectOverviewRegion(nextRegion: string) {
    setRegion(nextRegion);
    if (nextRegion !== "全部区域") {
      setUserRegion(nextRegion);
      setAppliedUser((current) => ({ ...current, region: nextRegion }));
      setPage(1);
    }
  }

  function queryUsers() {
    setAppliedUser({ keyword: userKeyword, region: userRegion, game: userGame, sort });
    setPage(1); setLoading(true);
    setTimeout(() => { setLoading(false); notify("查询完成，已更新用户列表"); }, 520);
  }

  function resetOverview() {
    setRegion("全部区域"); setGame(vendorAllValue("热游")); notify("筛选条件已重置");
  }

  function resetUsers() {
    setUserKeyword(""); setUserRegion("全部区域"); setUserGame(vendorAllValue("热游")); setSort("input-desc");
    setAppliedUser({ keyword: "", region: "全部区域", game: vendorAllValue("热游"), sort: "input-desc" }); setPage(1); notify("筛选条件已重置");
  }

  function openGameDetails(gameRow: GameRow) {
    setDetailSortKey("input");
    setDetailSortOrder("desc");
    setDetailGame(gameRow);
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
          <div className="page-title"><div><h1>游戏数据报表</h1><p>按区域、游戏或用户维度查询用户投入、用户出奖、返奖率与盈亏。</p></div><button type="button" className="refresh-link" onClick={() => simulateQuery("数据刷新完成")}>↻ 刷新数据</button></div>
          <div className="business-tabs" role="tablist"><button role="tab" aria-selected={view === "overview"} className={view === "overview" ? "active" : ""} onClick={() => switchView("overview")}>总览报表</button><button role="tab" aria-selected={view === "users"} className={view === "users" ? "active" : ""} onClick={() => switchView("users")}>游戏用户列表</button></div>

          {view === "overview" ? (
            <>
              <section className="panel filter-panel overview-filters">
                <FilterField label="区域"><select value={region} onChange={(event) => selectOverviewRegion(event.target.value)}><option>全部区域</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></FilterField>
                <div className="filter-field game-filter-field"><span>游戏</span><GameSelector value={game} onChange={setGame} /></div>
                <FilterField label="统计日期" wide><input value="2026-07-01  -  2026-07-17" readOnly /></FilterField>
                <div className="filter-actions"><button type="button" className="primary" onClick={() => simulateQuery()}>查询</button><button type="button" onClick={resetOverview}>重置</button></div>
                <span className="update-time">数据更新时间：10:30</span>
              </section>

              <section className="overview-metrics">
                <MetricCard mark="活" title="活跃游戏用户" value="86,420" note="统计周期内产生任意游戏流水的去重用户数" tone="blue" />
                <MetricCard mark="投" title="用户投入" value={<Money value={16_480_200} />} valueTitle={`完整金额：${moneyText(16_480_200)} 金币`} valueHint={amountUnitText(16_480_200)} note="用户实际投入金额" tone="amber" />
                <MetricCard mark="奖" title="用户出奖" value={<Money value={14_998_360} />} valueTitle={`完整金额：${moneyText(14_998_360)} 金币`} valueHint={amountUnitText(14_998_360)} note="游戏返奖/派奖金额" tone="red" />
                <MetricCard mark="盈" title="盈亏" value={<ProfitLoss value={1_481_840} />} valueTitle={`完整金额：${moneyText(1_481_840)} 金币`} valueHint={amountUnitText(1_481_840)} note="用户投入 - 用户出奖" tone="cyan" />
                <MetricCard mark="返" title="返奖率" value="91.01%" note="用户出奖 ÷ 用户投入 × 100%" tone="green" />
              </section>

              <section className="panel table-panel"><div className="table-heading"><div><h2>游戏汇总数据</h2><span>悬浮问号查看游戏资料，点击“用户明细”查看该游戏的用户排行</span></div></div><div className="table-wrap game-table-wrap"><table><thead><tr><th>游戏</th><th>区域</th><th>活跃用户</th><th>游戏次数</th><th>用户投入</th><th>用户出奖</th><th>盈亏</th><th>返奖率</th><th>操作</th></tr></thead><tbody>{loading ? <tr><td colSpan={9}><div className="loading-state"><span />正在加载报表数据…</div></td></tr> : filteredGames.length ? filteredGames.slice(0, 4).map((row) => <tr key={`${row.region}-${row.game}`}><td><GameCell name={row.game} /></td><td>{row.region}</td><td>{format.format(row.active)}</td><td>{format.format(row.plays)}</td><td>{money(row.input)}</td><td>{money(row.output)}</td><td>{profitLoss(row.net)}</td><td>{row.rate.toFixed(2)}%</td><td><button type="button" className="row-action" onClick={() => openGameDetails(row)}>用户明细</button></td></tr>) : <tr><td colSpan={9}><div className="empty-state"><b>未找到匹配数据</b><span>请调整区域、游戏或用户筛选条件后重试。</span><button type="button" onClick={resetOverview}>清除筛选</button></div></td></tr>}</tbody></table></div><div className="pagination"><span>共 {filteredGames.length} 条 ｜ 20 条/页</span><button className="active" type="button">1</button><button type="button" disabled>2</button></div></section>
            </>
          ) : (
            <>
              <section className="panel filter-panel user-filters">
                <FilterField label="用户ID"><input placeholder="请输入用户ID / 昵称" value={userKeyword} onChange={(event) => setUserKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") queryUsers(); }} /></FilterField>
                <FilterField label="区域"><select value={userRegion} onChange={(event) => setUserRegion(event.target.value)}><option>全部区域</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></FilterField>
                <div className="filter-field game-filter-field"><span>游戏</span><GameSelector value={userGame} onChange={setUserGame} /></div>
                <FilterField label="统计日期" wide><input value="2026-07-01  -  2026-07-17" readOnly /></FilterField>
                <FilterField label="排序方式"><select value={sort} onChange={(event) => setSort(event.target.value as UserSort)}>{userSortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></FilterField>
                <div className="filter-actions"><button type="button" className="primary" onClick={queryUsers}>查询</button><button type="button" onClick={resetUsers}>重置</button></div>
              </section>

              <section className="panel table-panel user-table-panel">
                <div className="table-heading">
                  <div><h2>游戏用户明细</h2><span>按用户与游戏维度展示投入、出奖、盈亏与返奖率表现。</span></div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>游戏排行</th><th>用户ID</th><th>昵称</th><th>区域</th><th>游戏</th><th>活跃天数</th><th>游戏次数</th><th>用户投入</th><th>用户出奖</th><th>盈亏</th><th>返奖率</th></tr></thead>
                    <tbody>{loading ? <tr><td colSpan={11}><div className="loading-state"><span />正在加载用户数据…</div></td></tr> : visibleUsers.length ? visibleUsers.map((row) => <tr key={`${row.id}-${row.game}`}><td><span className={`game-rank ${row.gameRank <= 3 ? `top-${row.gameRank}` : ""}`}>{row.gameRank}</span></td><td><b>{row.id}</b></td><td>{row.nickname}</td><td>{row.region}</td><td><GameCell name={row.game} /></td><td>{row.days}天</td><td>{format.format(row.plays)}</td><td>{money(row.input)}</td><td>{money(row.output)}</td><td>{profitLoss(row.net)}</td><td className={row.rate >= 95 ? "rate-good" : ""}>{row.rate.toFixed(2)}%</td></tr>) : <tr><td colSpan={11}><div className="empty-state"><b>未找到匹配用户游戏数据</b><span>请检查用户 ID、区域或游戏条件。</span><button type="button" onClick={resetUsers}>清除筛选</button></div></td></tr>}</tbody>
                  </table>
                </div>
                <div className="table-footer">
                  <span>游戏排行按用户投入金额降序；盈亏 = 用户投入 - 用户出奖；返奖率 = 用户出奖 ÷ 用户投入 × 100%。</span>
                  <div className="pagination">
                    <span>共 {format.format(filteredUsers.length)} 条 ｜ {pageSize} 条/页</span>
                    {visiblePageItems.map((item, index) => item === "ellipsis" ? <span className="pagination-ellipsis" key={`ellipsis-${index}`} aria-hidden="true">…</span> : <button key={item} type="button" className={page === item ? "active" : ""} onClick={() => setPage(item)}>{item}</button>)}
                  </div>
                </div>
              </section>
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
                <div><h2 id="game-detail-title">{detailGame.game} 用户游戏排行</h2><p>{detailGameMeta.id} · {detailGameMeta.vendor}</p></div>
              </div>
              <button ref={detailCloseRef} type="button" className="game-detail-close" aria-label="关闭游戏用户明细" onClick={() => setDetailGame(null)}><XIcon size={18} weight="bold" aria-hidden="true" /></button>
            </header>

            <div className="game-detail-toolbar">
              <div className="game-detail-toolbar-foot"><div className="detail-sort-controls"><label><span>排序字段</span><select aria-label="排序字段" value={detailSortKey} onChange={(event) => setDetailSortKey(event.target.value as DetailSortKey)}>{(Object.keys(detailSortLabels) as DetailSortKey[]).map((key) => <option key={key} value={key}>{detailSortLabels[key]}</option>)}</select></label><label><span>排序顺序</span><select aria-label="排序顺序" value={detailSortOrder} onChange={(event) => setDetailSortOrder(event.target.value as "desc" | "asc")}><option value="desc">降序</option><option value="asc">升序</option></select></label></div><div className="game-detail-scope" id="game-detail-scope"><span>统计日期：2026-07-17</span><small>共 {detailRankings.length} 位用户 · 按{detailSortLabels[detailSortKey]}{detailSortOrder === "desc" ? "降序" : "升序"}</small></div></div>
            </div>

            <div className="game-detail-metrics">
              <div><span>游戏下注次数</span><strong>{format.format(detailTotals.plays)}</strong></div>
              <div><span>用户投入</span><strong>{money(detailTotals.input)}</strong></div>
              <div><span>用户出奖</span><strong>{money(detailTotals.output)}</strong></div>
              <div><span>盈亏</span><strong>{profitLoss(detailTotals.net)}</strong></div>
              <div><span>返奖率</span><strong>{detailTotals.rate.toFixed(2)}%</strong></div>
            </div>

            <div className="game-detail-table-wrap">
              <table className="game-detail-table">
                <thead><tr><th>用户信息</th><th>游戏下注次数</th><th>用户投入</th><th>用户出奖</th><th>盈亏</th><th>返奖率</th></tr></thead>
                <tbody>{detailRankings.length ? detailRankings.map((row, index) => <tr key={row.id}><td><div className="game-detail-user"><span className={`game-detail-rank rank-${index + 1}`}>{index + 1}</span><span className="game-detail-user-avatar">{row.nickname.slice(0, 1).toUpperCase()}</span><span className="game-detail-user-copy"><strong>{row.nickname}</strong><small>ID {row.id} · {row.region}</small></span></div></td><td>{format.format(row.plays)}</td><td>{money(row.input)}</td><td>{money(row.output)}</td><td>{profitLoss(row.net)}</td><td className={row.rate >= 95 ? "rate-good" : ""}>{row.rate.toFixed(2)}%</td></tr>) : <tr><td colSpan={6}><div className="game-detail-empty"><b>暂无符合条件的用户</b><span>请调整数值区间后重试</span></div></td></tr>}</tbody>
              </table>
            </div>

            <footer className="game-detail-footer"><span>盈亏 = 用户投入 - 用户出奖；返奖率 = 用户出奖 ÷ 用户投入 × 100%。</span><button type="button" onClick={() => setDetailGame(null)}>关闭</button></footer>
          </section>
        </div>
      )}

      {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} closeRef={profileCloseRef} />}
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite"><span>✓</span>{toast}</div>
    </main>
  );
}
