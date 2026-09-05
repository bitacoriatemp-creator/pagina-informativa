"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/* Aparición al entrar en pantalla: sube un poco y funde.
   `once` para que no parpadee al volver a subir, y `amount: 0.2` para que
   arranque cuando ya se ve una quinta parte —no cuando asoma un píxel—, que
   es lo que hace que se sienta acompasado con el scroll y no aleatorio.
   El MotionConfig de MarketingShell respeta "reducir movimiento" del sistema:
   quien lo tenga activado ve el contenido sin desplazamiento. */
export default function Revelar({
    children,
    delay = 0,
    className,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}
