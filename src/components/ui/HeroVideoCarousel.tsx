"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { assetPath } from "@/lib/assetPath";

/* ── Video sources ── */
const HERO_VIDEOS = [
    assetPath("/videos/hero_video_1_v3.mp4"),
    assetPath("/videos/hero_video_2_v3.mp4"),
    assetPath("/videos/hero_video_3_v3.mp4"),
    assetPath("/videos/hero_video_4_v3.mp4"),
    assetPath("/videos/hero_video_5_v3.mp4"),
];

/**
 * HeroVideoCarousel — Extracted from HeroHybrid (Sprint 4.1)
 * Sequential crossfade loop of 5 hero videos.
 * Lazy-loadable via next/dynamic.
 */
export default function HeroVideoCarousel() {
    const [activeVideo, setActiveVideo] = useState(0);
    const videoRef0 = useRef<HTMLVideoElement>(null);
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);
    const videoRef3 = useRef<HTMLVideoElement>(null);
    const videoRef4 = useRef<HTMLVideoElement>(null);
    const videoRefs = [videoRef0, videoRef1, videoRef2, videoRef3, videoRef4];

    useEffect(() => {
        const v0 = videoRef0.current;
        const v1 = videoRef1.current;
        const v2 = videoRef2.current;
        const v3 = videoRef3.current;
        const v4 = videoRef4.current;
        if (!v0 || !v1 || !v2 || !v3 || !v4) return;

        const videos = [v0, v1, v2, v3, v4];
        const playNext = (currentIdx: number) => {
            const nextIdx = (currentIdx + 1) % 5;
            setActiveVideo(nextIdx);
            videos[nextIdx].currentTime = 0;
            videos[nextIdx].play().catch(() => {});
        };

        v0.onended = () => playNext(0);
        v1.onended = () => playNext(1);
        v2.onended = () => playNext(2);
        v3.onended = () => playNext(3);
        v4.onended = () => playNext(4);

        // Kick off the first video
        v0.play().catch(() => {});

        return () => {
            videos.forEach(v => { v.onended = null; });
        };
    }, []);

    return (
        <div className="absolute top-0 right-0 z-[2] h-full w-full md:w-2/3">
            <motion.div
                className="absolute inset-0"
                style={{
                    WebkitMaskImage:
                        "linear-gradient(to left, black 60%, transparent 100%)",
                    maskImage:
                        "linear-gradient(to left, black 60%, transparent 100%)",
                }}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                    duration: 1.6,
                    ease: [0.25, 0.4, 0.25, 1] as const,
                    delay: 0.3,
                }}
            >
                {HERO_VIDEOS.map((src, i) => (
                    <video
                        key={i}
                        ref={videoRefs[i]}
                        src={src}
                        muted
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000"
                        style={{ opacity: activeVideo === i ? 0.85 : 0 }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
