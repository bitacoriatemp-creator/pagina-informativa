import SmartIsland from "@/components/ui/SmartIsland";

export default function BIMSyncPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-[#AA00FF]">
                Smart BIM Sync
            </h1>
            <p className="mt-4 text-gray-500">
                Módulo de Visualización 3D en Tiempo Real
            </p>

            {/* Persistent Fixed Dock */}
            <SmartIsland mode="fixed" />
        </main>
    );
}
