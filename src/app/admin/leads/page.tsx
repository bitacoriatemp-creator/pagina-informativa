import { getSupabaseAdmin, type Participante } from "@/lib/supabaseAdmin";
import LeadsDashboard from "./LeadsDashboard";

/**
 * /admin/leads — Dashboard interno de leads (host local only).
 *
 * Server Component: lee participantes con service_role en el servidor y
 * pasa los datos como props al Client Component que renderiza UI/charts.
 * Nunca se expone el key al cliente.
 */

export const dynamic = "force-dynamic";   // datos siempre frescos
export const revalidate = 0;

export default async function AdminLeadsPage() {
    let leads: Participante[] = [];
    let errorMsg: string | null = null;

    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from("participantes")
            .select("nombre, email, perfil, obras_activas, interes_compra, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            errorMsg = `Supabase error: ${error.message}`;
        } else {
            leads = (data ?? []) as Participante[];
        }
    } catch (err) {
        errorMsg = err instanceof Error ? err.message : String(err);
    }

    if (errorMsg) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-20">
                <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                    Dashboard de Leads
                </h1>
                <div className="mt-8 rounded-xl border border-red-900/60 bg-red-950/30 p-6">
                    <div className="text-xs uppercase tracking-widest text-red-400">
                        No se pudo cargar
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap text-sm text-red-100/90">
                        {errorMsg}
                    </pre>
                    <div className="mt-6 text-xs text-zinc-500 leading-relaxed">
                        <div className="font-semibold text-zinc-400 mb-2">Checklist:</div>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>¿Existe <code className="text-amber-400">.env.local</code> en la raíz del proyecto?</li>
                            <li>¿Tiene <code className="text-amber-400">SUPABASE_SERVICE_ROLE_KEY</code> con el valor real?</li>
                            <li>Después de editar <code className="text-amber-400">.env.local</code>, reinicia <code className="text-amber-400">npm run dev</code>.</li>
                        </ol>
                    </div>
                </div>
            </main>
        );
    }

    return <LeadsDashboard leads={leads} />;
}

export const metadata = {
    title: "Leads · Admin BitacorIA",
};
