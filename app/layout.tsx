import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的游戏战绩 · Hawk Play",
  description: "查看个人游戏次数、投入、奖励、返还率与常玩游戏排行。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
