import SmartIsland from "@/components/ui/SmartIsland";

export default function SmartConceptsPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-[#00FFAA]">
                Smart Concepts
            </h1>
            <p className="mt-4 text-gray-500">
                Módulo de Control de Precios Unitarios
            </p>

            {/* Persistent Fixed Dock */}
            <SmartIsland mode="fixed" />
        </main>
    );
}
