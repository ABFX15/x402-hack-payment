import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - Offbank",
  description:
    "Offbank Terms of Service. Read the conditions that govern use of the Offbank stablecoin settlement platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main
        className="mx-auto max-w-3xl px-6 py-24"
        style={{ background: "#FFFFFF" }}
      >
        <article>
          <h1 className="text-4xl font-bold tracking-tight text-[#212121] mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-[#8a8a8a] mb-8">Last updated: June 2025</p>

          <div className="space-y-6 text-[#5c5c5c] text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Offbank platform
                (&ldquo;Service&rdquo;), you agree to be bound by these Terms of
                Service (&ldquo;Terms&rdquo;). If you do not agree to all the
                terms and conditions, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                2. Description of Service
              </h2>
              <p>
                Offbank provides non-custodial stablecoin settlement
                infrastructure that enables B2B payments on the Solana
                blockchain. Offbank does not take custody of user funds at any
                point. All transactions are executed through publicly auditable
                smart contracts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                3. Non-Custodial Nature
              </h2>
              <p>
                Offbank is non-custodial. We do not hold, control, or have access
                to your wallet private keys or funds. You are solely responsible
                for the security of your wallet and any transactions you
                authorize through the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                4. Fees
              </h2>
              <p>
                Offbank charges a platform fee on each settlement transaction.
                Current fee schedules are published on our{" "}
                <a href="/pricing" className="text-[#34c759] underline">
                  pricing page
                </a>
                . Fees are deducted at the smart-contract level and are visible
                on-chain. Offbank reserves the right to modify fees with
                reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                5. Eligibility
              </h2>
              <p>
                You must be at least 18 years of age and legally authorized to
                conduct business in your jurisdiction to use the Service.
                Cannabis industry users must hold all required state and local
                licenses for their operations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                6. Prohibited Conduct
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  Use the Service for any unlawful purpose or in violation of
                  any applicable law or regulation
                </li>
                <li>
                  Attempt to interfere with the proper functioning of the smart
                  contracts or platform
                </li>
                <li>
                  Use the Service for money laundering, terrorist financing, or
                  sanctions evasion
                </li>
                <li>Misrepresent your identity or licensing status</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                7. Disclaimer of Warranties
              </h2>
              <p>
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; without warranties of any kind, whether express
                or implied. Offbank does not guarantee uninterrupted access to
                the Service or the Solana blockchain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                8. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, Offbank shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising out of or related to your use of the
                Service. Offbank&rsquo;s total aggregate liability shall not
                exceed the fees paid by you to Offbank in the twelve (12) months
                preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                9. Privacy
              </h2>
              <p>
                Offbank processes minimal user data. Wallet addresses and
                on-chain transactions are publicly visible on the Solana
                blockchain by design. We do not sell user data to third parties.
                For detailed information, see our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                10. Modifications
              </h2>
              <p>
                Offbank reserves the right to modify these Terms at any time. We
                will provide notice of material changes by updating the
                &ldquo;Last updated&rdquo; date above. Your continued use of the
                Service after such changes constitutes acceptance of the updated
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#212121] mb-2">
                11. Contact
              </h2>
              <p>
                For questions about these Terms, contact us at{" "}
                <a
                  href="mailto:adam@settlr.dev"
                  className="text-[#34c759] underline"
                >
                  adam@settlr.dev
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
