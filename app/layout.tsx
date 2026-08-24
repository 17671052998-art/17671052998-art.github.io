import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://17671052998-art.github.io"),
  title: "游戏数据报表 · Hawk Admin",
  description: "按区域、游戏或用户维度查询用户投入、用户出奖、返奖率与盈亏。",
  openGraph: {
    title: "游戏数据报表 · Hawk Admin",
    description: "按区域、游戏或用户维度查询用户投入、用户出奖、返奖率与盈亏。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hawk Admin 游戏数据报表" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "游戏数据报表 · Hawk Admin",
    description: "按区域、游戏或用户维度查询用户投入、用户出奖、返奖率与盈亏。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
