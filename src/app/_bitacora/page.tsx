import SmartIsland from "@/components/ui/SmartIsland";

export default function BitacoraPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-[#C4A484]">
                Bitácora Digital
            </h1>
            <p className="mt-4 text-gray-500">
                Módulo de Registro de Incidencias
            </p>

            {/* Persistent Fixed Dock */}
            <SmartIsland mode="fixed" />
        </main>
    );
}
