import SmartIsland from "@/components/ui/SmartIsland";

export default function CalendarioPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-[#00AAFF]">
                Smart Calendar
            </h1>
            <p className="mt-4 text-gray-500">
                Módulo de Cronograma Inteligente
            </p>

            {/* Persistent Fixed Dock */}
            <SmartIsland mode="fixed" />
        </main>
    );
}
