"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import SmartIslandShowcase from "@/components/ui/SmartIslandShowcase";
import SmartIsland from "@/components/ui/SmartIsland";

/* La isla flotante vive aquí porque aquí está su ancla (#island-anchor, dentro
   del showcase). En la home ya no queda ninguna sección que la revele, así que
   se quedaba montada e invisible para siempre. */
export default function Contenido() {
    const showcaseRef = useRef<HTMLDivElement>(null);
    const showcaseInView = useInView(showcaseRef, { margin: "0px 0px -95% 0px" });

    return (
        <>
            <SmartIsland
                islandState={showcaseInView ? "center" : "hidden"}
                hideIsland={false}
                isBimSectionActive={false}
                forceExpand={showcaseInView}
                triggerPop={null}
            />
            <div ref={showcaseRef}>
                <SmartIslandShowcase />
            </div>
        </>
    );
}
