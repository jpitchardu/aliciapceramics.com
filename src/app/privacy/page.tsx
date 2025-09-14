"use client";

import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    // Override body overflow for this page
    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalHeight = body.style.height;

    body.style.overflow = "auto";
    body.style.height = "auto";

    return () => {
      // Restore original styles when leaving the page
      body.style.overflow = originalOverflow;
      body.style.height = originalHeight;
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="font-heading text-3xl text-earth-dark mb-8">
            Privacy Policy
          </h1>

          <div className="space-y-6 font-body text-earth-dark">
            <section>
              <h2 className="font-heading text-xl mb-4">
                Information We Collect
              </h2>
              <p className="mb-4">
                When you place a commission order with Alicia P Ceramics, we
                collect:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  Your name and contact information (email and phone number)
                </li>
                <li>
                  Details about your ceramic piece order (pieces, timeline,
                  inspiration)
                </li>
                <li>Any special considerations or requirements you provide</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl mb-4">
                How We Use Your Information
              </h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Process and fulfill your custom ceramic orders</li>
                <li>
                  Communicate with you about your order status and timeline
                </li>
                <li>
                  Send you text messages about order updates (with your consent)
                </li>
                <li>Provide customer service and support</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only when required
                by law or to protect our rights.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl mb-4">Text Messaging</h2>
              <p>
                By providing your phone number and consenting to text messages,
                you agree to receive SMS communications from Alicia P Ceramics
                about your order.{" "}
                <strong>
                  SMS messaging is optional and not required to complete your
                  order.
                </strong>{" "}
                <strong>
                  Message frequency varies. Standard message and data rates may
                  apply depending on your mobile carrier.
                </strong>{" "}
                You can opt out at any time by replying STOP to any message.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl mb-4">Information Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Service Providers:</strong> With trusted third-party
                  services that help us operate our business (such as SMS
                  delivery and payment processing)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong>Business Operations:</strong> With your explicit
                  consent for specific purposes
                </li>
              </ul>
              <p className="mt-4">
                All service providers operate under their published privacy
                policies and security standards.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl mb-4">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we have about you
                </li>
                <li>
                  <strong>Delete:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Correct:</strong> Request correction of inaccurate
                  personal information
                </li>
                <li>
                  <strong>Opt-out:</strong> Stop receiving text messages by
                  replying STOP
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please reach out to us on our social
                media platforms or by replying to any of our communications.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact
                us through our commission form or by replying to any of our
                communications.
              </p>
            </section>

            <section className="text-sm text-stone-600 border-t pt-4 mt-8">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
