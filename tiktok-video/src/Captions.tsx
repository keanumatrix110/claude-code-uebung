import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import { C, clamp, fontFamily } from "./theme";

const SWITCH_CAPTIONS_EVERY_MS = 900;

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });

  return (
    <AbsoluteFill
      style={{
        top: 1250,
        height: 330,
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.12,
          textAlign: "center",
          textTransform: "uppercase",
          whiteSpace: "pre-wrap",
          scale: interpolate(enter, [0, 1], [0.8, 1]),
          opacity: interpolate(enter, [0, 0.4], [0, 1], clamp),
        }}
      >
        {page.tokens.map((token, i) => {
          const active =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          const tokenFrame = ((token.fromMs - page.startMs) / 1000) * fps;
          const hit = spring({
            frame: frame - tokenFrame,
            fps,
            config: { damping: 10, stiffness: 300 },
          });
          const leading = token.text.match(/^\s*/)?.[0] ?? "";
          return (
            <React.Fragment key={`${token.fromMs}-${i}`}>
              {leading}
              <span
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  color: active ? C.yellow : C.white,
                  WebkitTextStroke: "14px #000",
                  paintOrder: "stroke fill",
                  textShadow: "0 10px 0 rgba(0,0,0,0.5)",
                  scale: active ? interpolate(hit, [0, 1], [1, 1.06]) : 1,
                }}
              >
                {token.text.trimStart()}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ hideAfterMs: number }> = ({
  hideAfterMs,
}) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile("captions.json"));
      setCaptions(await response.json());
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const pages = useMemo(() => {
    if (!captions) return [];
    return createTikTokStyleCaptions({
      // Start a new page after each sentence or comma
      captions: captions
        .filter((c) => c.startMs < hideAfterMs)
        .map((c) => ({ ...c, pageBreakAfter: /[.,?!]$/.test(c.text.trim()) })),
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    }).pages;
  }, [captions, hideAfterMs]);

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const next = pages[index + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.round(
          Math.min(
            next ? (next.startMs / 1000) * fps : Infinity,
            ((page.startMs + page.durationMs) / 1000) * fps + 12,
            (hideAfterMs / 1000) * fps,
          ),
        );
        if (endFrame - startFrame <= 0) return null;
        return (
          <Sequence
            key={index}
            name={`Caption ${index}`}
            from={startFrame}
            durationInFrames={endFrame - startFrame}
          >
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
