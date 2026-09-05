"use client";

import dynamic from "next/dynamic";

/* ProblemChaos usa Matter.js y toca el DOM al montar: se carga solo en cliente,
   con un hueco del mismo alto para que la página no dé un salto al llegar. */
const ProblemChaos = dynamic(() => import("@/components/ui/ProblemChaos"), {
    ssr: false,
    loading: () => (
        <div style={{ height: "200vh", minHeight: 1600, backgroundColor: "#0c0604" }} />
    ),
});

export default function Contenido() {
    return <ProblemChaos />;
}
