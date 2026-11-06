import React from "react";
import { FONT } from "./theme";

export const Emoji: React.FC<{ e: string; size: number; style?: React.CSSProperties }> = ({ e, size, style }) => (
  <div style={{ fontFamily: FONT, fontSize: size, lineHeight: 1, ...style }}>{e}</div>
);
