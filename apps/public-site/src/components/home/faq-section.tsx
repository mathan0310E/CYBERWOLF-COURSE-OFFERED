import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/home/section";

const FAQS = [
  {
    q: "Which courses can I choose?",
    a: "You can choose one or two of the three courses: Cyber Security, AI & Web Development, and Ethical Hacking.",
  },
  {
    q: "How much does it cost?",
    a: "A single course is offered at ₹8,500 (original ₹12,000). The two-course bundle is offered at ₹12,500. The final price is confirmed on the server when your registration is received.",
  },
  {
    q: "Does submitting a registration confirm my place?",
    a: "No. Submitting a registration does not guarantee admission or payment. Our team will follow up using the contact details you provide.",
  },
  {
    q: "Will I receive an email?",
    a: "Yes. You receive a transactional confirmation email for your registration, and our team is notified. We do not automatically add you to marketing emails.",
  },
  {
    q: "How is my data used?",
    a: "Your details are used to process your registration and to send you the transactional emails described in our Privacy Policy. See the Privacy Policy for retention and data-request procedures.",
  },
  {
    q: "Can I register more than once?",
    a: "Yes. If you register again with the same email address, we still confirm your registration and notify our team, but we do not repeat the first-time welcome message.",
  },
];

/**
 * FAQ accordion. Each item is a button controlling a labelled region, so it is
 * operable by keyboard and announced correctly by assistive technology.
 */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="Frequently asked questions"
      description="Answers about courses, pricing, registration and privacy."
    >
      <div className="mx-auto max-w-3xl">
        {FAQS.map((faq, index) => {
          const isOpen = open === index;
          return (
            <div key={faq.q} className="border-b border-border last:border-b-0">
              <h3>
                <button
                  type="button"
                  id={`faq-button-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-[17px] font-medium text-foreground">{faq.q}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-muted transition-transform", isOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div
                id={`faq-panel-${index}`}
                role="region"
                aria-labelledby={`faq-button-${index}`}
                hidden={!isOpen}
                className="pb-5 text-[15px] leading-relaxed text-muted"
              >
                {faq.a}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
