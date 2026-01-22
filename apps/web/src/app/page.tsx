import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>LeadOps AI</h1>
        <div>
          <SignedIn><UserButton /></SignedIn>
          <SignedOut><SignInButton /></SignedOut>
        </div>
      </header>

      <p>
        Dashboard deterministica per lead-gen: email, chiamate (Vapi/Twilio), calendly, campagne e prodotti.
      </p>

      <SignedIn>
        <Link href="/dashboard">Vai alla dashboard →</Link>
      </SignedIn>

      <SignedOut>
        <p>Accedi per iniziare.</p>
      </SignedOut>
    </main>
  );
}
