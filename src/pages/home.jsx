import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/hero";
import { useTheme } from "../context/ThemeContext";

function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [openFaq, setOpenFaq] = useState(0);

  const colors = useMemo(
    () => ({
      pageBg: isDark
        ? "linear-gradient(180deg, #050814 0%, #070b17 45%, #050814 100%)"
        : "linear-gradient(180deg, #f7f9ff 0%, #ffffff 55%, #f7f9ff 100%)",
      text: isDark ? "#e5e7eb" : "#0f172a",
      muted: isDark ? "rgba(229,231,235,0.72)" : "rgba(15,23,42,0.68)",
      card: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",
      border: isDark ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.35)",
      primary: "#2563eb",
      shadow: isDark ? "0 20px 70px rgba(0,0,0,0.45)" : "0 16px 50px rgba(2,6,23,0.10)",
      codeBg: isDark ? "rgba(2,6,23,0.42)" : "rgba(2,6,23,0.03)",
    }),
    [isDark]
  );

  const container = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 18px",
  };

  const sectionTitle = {
    fontSize: 34,
    fontWeight: 1000,
    margin: 0,
    color: colors.text,
  };

  const sectionSub = {
    marginTop: 10,
    maxWidth: 760,
    marginInline: "auto",
    color: colors.muted,
    lineHeight: 1.8,
  };

  const card = (extra = {}) => ({
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 22,
    padding: 22,
    boxShadow: "none",
    ...extra,
  });

  const hoverableCard = {
    transition: "transform 200ms ease, box-shadow 200ms ease",
  };

  const features = [
    {
      icon: "⚡",
      title: "Structured Prompt Generation",
      desc: "Turn your idea into a professional prompt in seconds.",
    },
    {
      icon: "📚",
      title: "Prompt Library",
      desc: "Save, copy, and reuse your best prompts anytime.",
    },
    {
      icon: "🧠",
      title: "Rewrite & Summarize",
      desc: "Improve and clarify your text using the same workflow.",
    },
    {
      icon: "🔒",
      title: "Daily Usage + Premium",
      desc: "Free users have a daily limit; premium unlocks more usage.",
    },
  ];

  const steps = [
    {
      n: "1",
      title: "Enter your idea",
      desc: "Type a simple description of what you want to create.",
    },
    {
      n: "2",
      title: "Click Generate",
      desc: "Get a structured, professional prompt instantly.",
    },
    {
      n: "3",
      title: "Save & reuse",
      desc: "Use your prompt again from the library for consistent results.",
    },
  ];

  const testimonials = [
    {
      name: "Kavindu",
      role: "Content Creator",
      quote: "It’s fast and the prompts are much more usable than my drafts.",
    },
    {
      name: "Dulani",
      role: "Marketer",
      quote: "The library makes it easy to repeat what works. Clean UI too.",
    },
    {
      name: "Nishan",
      role: "Developer",
      quote: "Rewrite/summarize flow is simple and saves time for every project.",
    },
  ];

  const faqs = [
    {
      q: "Is this only for ChatGPT?",
      a: "No. PromptForge is designed to generate structured prompts that you can use across AI tools and workflows.",
    },
    {
      q: "Do you store my prompts?",
      a: "Yes. Prompts you save go into your account in Firestore so you can manage them in your library.",
    },
    {
      q: "What if I hit my daily limit?",
      a: "Free users have a daily cap. You can manage usage and upgrade if you want unlimited access (handled in pricing flow).",
    },
  ];

  return (
    <div style={{ background: colors.pageBg, minHeight: "100vh" }}>
      {/* Top (Your Hero includes the Generate button) */}
      <Hero />

      {/* Features */}
      <section style={{ padding: "40px 0 0" }}>
        <div style={container}>
          <div style={{ textAlign: "center" }}>
            <h2 style={sectionTitle}>Generate Better Prompts. Faster.</h2>
            <p style={sectionSub}>
              Clean UI, structured output, and a library to help you reuse what works.
            </p>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{ ...card(hoverableCard) }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = colors.shadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDark ? "rgba(37,99,235,0.16)" : "rgba(37,99,235,0.08)",
                      border: `1px solid ${colors.border}`,
                      fontSize: 20,
                      flex: "0 0 auto",
                    }}
                  >
                    {f.icon}
                  </div>
                  <div style={{ fontWeight: 1000, color: colors.text }}>{f.title}</div>
                </div>
                <div style={{ marginTop: 10, color: colors.muted, lineHeight: 1.8, fontSize: 14 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "48px 0 0" }}>
        <div style={container}>
          <div style={{ textAlign: "center" }}>
            <h2 style={sectionTitle}>How it works</h2>
            <p style={sectionSub}>A simple flow from idea → prompt → reuse.</p>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {steps.map((s, i) => (
              <div key={i} style={card()}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDark ? "rgba(37,99,235,0.14)" : "rgba(37,99,235,0.08)",
                      border: `1px solid ${colors.border}`,
                      fontWeight: 1000,
                      color: colors.primary,
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ fontWeight: 1000, color: colors.text }}>{s.title}</div>
                </div>
                <div style={{ marginTop: 10, color: colors.muted, lineHeight: 1.8, fontSize: 14 }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample */}
      <section style={{ padding: "48px 0 0" }}>
        <div style={container}>
          <div style={card()}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18, alignItems: "start" }}>
              <div>
                <h3 style={{ margin: 0, color: colors.text, fontSize: 22, fontWeight: 1000 }}>
                  Example output (preview)
                </h3>
                <p style={{ marginTop: 10, color: colors.muted, lineHeight: 1.8 }}>
                  Structured prompts improve clarity and produce more consistent AI results.
                </p>

                <div style={{ marginTop: 14, color: colors.muted, fontSize: 13, lineHeight: 1.7 }}>
                  Tip: add target audience + tone + output format.
                </div>
              </div>

              <div style={{ background: colors.codeBg, border: `1px solid ${colors.border}`, borderRadius: 18, padding: 14 }}>
                <pre style={{ margin: 0, color: colors.text, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
{`Role: You are an expert prompt engineer.
Context: The user wants help creating a high-quality prompt.
Goal: Produce a detailed, professional prompt.
Constraints: Be specific, concise, and ready to use.
Tone: Confident and helpful.
Output Format: Provide the final prompt only.

User Idea: (type your idea here)`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* FAQ */}
      <section style={{ padding: "48px 0 0" }}>
        <div style={container}>
          <div style={{ textAlign: "center" }}>
            <h2 style={sectionTitle}>FAQ</h2>
            <p style={sectionSub}>Quick answers to common questions.</p>
          </div>

          <div style={{ marginTop: 22, display: "grid", gap: 12, maxWidth: 860, marginInline: "auto" }}>
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} style={{ ...card(), padding: 0, overflow: "hidden" }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      color: colors.text,
                      cursor: "pointer",
                      padding: "16px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontWeight: 1000,
                      textAlign: "left",
                      gap: 12,
                    }}
                    aria-expanded={isOpen}
                  >
                    <span>{f.q}</span>
                    <span style={{ color: colors.primary, fontWeight: 1000 }}>{isOpen ? "−" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 18px 16px", color: colors.muted, lineHeight: 1.8, fontSize: 14 }}>
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA (no Upgrade button) */}
      <section style={{ padding: "50px 0 70px" }}>
        <div style={container}>
          <div style={{ ...card(), textAlign: "center" }}>
            <h3 style={{ margin: 0, color: colors.text, fontSize: 22, fontWeight: 1000 }}>
              Ready to generate your first prompt?
            </h3>
            <p style={{ marginTop: 10, color: colors.muted, lineHeight: 1.8 }}>
              Use the <b>Generate</b> button in the Hero section, then reuse it from your library.
            </p>
            <div style={{ marginTop: 18 }}>
              <Link
                to="prices"
                style={{
                  textDecoration: "none",
                  background: colors.primary,
                  color: "#fff",
                  padding: "14px 22px",
                  borderRadius: 16,
                  fontWeight: 1000,
                  border: "none",
                  display: "inline-block",
                }}
              >
                Go to upgrade
              </Link>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;