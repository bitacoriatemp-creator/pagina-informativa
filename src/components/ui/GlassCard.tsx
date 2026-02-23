"use client";

import { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: ReactNode;
    highlighted?: boolean;
}

export default function GlassCard({
    children,
    highlighted = false,
    className = "",
    ...motionProps
}: GlassCardProps) {
    return (
        <motion.div
            className={`${highlighted ? "glass-card-primary" : "glass-card"} ${className}`}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}
