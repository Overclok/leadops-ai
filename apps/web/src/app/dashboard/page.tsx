import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <SignedOut>
        <p>Devi autenticarti.</p>
        <Link href="/">Torna alla home</Link>
      </SignedOut>

      <SignedIn>
        <h1>Dashboard</h1>
        <p style={{ marginTop: 0, opacity: 0.75 }}>
          KPI deterministici basati su eventi (tenant single-user).
        </p>

        <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <h2>Bootstrap</h2>
          <ol>
            <li>Chiama <code>/api/tenant</code> per ottenere <code>tenant_id</code> e <code>webhook_secret</code>.</li>
            <li>Configura n8n con questi valori.</li>
            <li>Invia eventi firmati a <code>/api/events</code>.</li>
            <li>Leggi KPI da <code>/api/metrics?period=weekly</code>.</li>
          </ol>
        </section>
      </SignedIn>
    </main>
  );
}
