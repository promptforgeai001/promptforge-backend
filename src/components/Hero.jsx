import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = "https://promptforge-backend-v8z7.onrender.com";

function Hero() {
  const [user, setUser] = useState(null);

  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const styles = useMemo(() => {
    // Button must look like your original: background #2563eb
    return `
      .heroWrap {
        text-align: center;
        padding: 120px 20px;
      }
      .generateBtn {
        padding: 12px 25px;
        margin-left: 10px;
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 800;
        transition: transform 180ms ease, filter 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
        box-shadow: 0 14px 36px rgba(37,99,235,0.24);
      }
      .generateBtn:hover:not(:disabled) {
        transform: translateY(-3px);
        filter: brightness(1.06);
        box-shadow: 0 22px 55px rgba(37,99,235,0.32);
      }
      .generateBtn:active:not(:disabled) {
        transform: translateY(-1px) scale(0.99);
      }
      .generateBtn:disabled {
        cursor: not-allowed;
        opacity: 0.7;
        transform: none !important;
        box-shadow: none !important;
        filter: none !important;
      }

      .spin {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.45);
        border-top-color: rgba(255,255,255,1);
        animation: spin 0.9s linear infinite;
        display: inline-block;
      }
      @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }

      .dots {
        display: inline-flex;
        gap: 4px;
        margin-left: 8px;
        transform: translateY(2px);
      }
      .dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255,255,255,0.95);
        opacity: 0.25;
        animation: dotPulse 1s infinite;
      }
      .dots span:nth-child(2) { animation-delay: .15s; }
      .dots span:nth-child(3) { animation-delay: .30s; }
      @keyframes dotPulse {
        0%, 100% { opacity: 0.25; }
        50% { opacity: 1; }
      }

      .resultBox {
        margin-top: 40px;
        max-width: 720px;
        margin-inline: auto;
        text-align: left;
      }

      .skeletonLine {
        height: 14px;
        border-radius: 12px;
        background: rgba(148,163,184,0.18);
        overflow: hidden;
        position: relative;
        margin-top: 10px;
      }
      .skeletonLine::after {
        content: "";
        position: absolute;
        inset: -40px -60px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
        transform: translateX(-30%);
        animation: shimmer 1.1s infinite;
      }
      @keyframes shimmer { 0% { transform: translateX(-30%); } 100% { transform: translateX(30%); } }

      .errorBox {
        margin-top: 14px;
        display: inline-block;
        max-width: 700px;
        border-radius: 12px;
        border: 1px solid rgba(220,38,38,0.35);
        background: rgba(220,38,38,0.08);
        padding: 12px 14px;
        color: #ef4444;
        font-weight: 800;
      }
    `;
  }, []);

  async function handleGenerate() {
    setErrorMsg("");
    setResult("");

    const trimmed = input.trim();
    if (trimmed.length < 3) {
      setErrorMsg("Please enter at least 3 characters.");
      toast.error("Please enter at least 3 characters.");
      return;
    }

    if (!user?.uid) {
      setErrorMsg("Please login to generate prompts.");
      toast.error("Please login to generate prompts.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed, uid: user.uid }),
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        const msg = data?.error || "Generate failed.";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      setResult(data?.prompt || "");
    } catch (e) {
      const msg = e?.message || "Something went wrong.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="heroWrap">
      <style>{styles}</style>

      <h1 style={{ fontSize: "clamp(40px, 6vw, 100px)", fontWeight: "800" }}>
        Generate <span style={{ color: "#3b82f6" }}>AI Prompts</span>
        <br />
        in Seconds
      </h1>

      <p style={{ opacity: 0.7, marginTop: "20px" }}>
        Create powerful AI prompts instantly.
      </p>

      <div style={{ marginTop: "40px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: YouTube Script"
          style={{
            padding: "12px 20px",
            width: "300px",
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.45)",
            outline: "none",
          }}
          disabled={loading}
        />

        <button className="generateBtn" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <span className="spin" aria-hidden="true" />
              Generating
              <span className="dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </>
          ) : (
            "Generate"
          )}
        </button>
      </div>

      {errorMsg ? <div className="errorBox">{errorMsg}</div> : null}

      <div className="resultBox">
        {loading ? (
          <div>
            <div style={{ fontWeight: 900, opacity: 0.8, marginBottom: 8 }}>
              Generating… please wait
            </div>
            <div className="skeletonLine" style={{ width: "92%" }} />
            <div className="skeletonLine" style={{ width: "86%" }} />
            <div className="skeletonLine" style={{ width: "95%" }} />
            <div className="skeletonLine" style={{ width: "78%" }} />
            <div className="skeletonLine" style={{ width: "90%" }} />
          </div>
        ) : result ? (
         
          <div style={{ position: "relative" }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{result}</pre>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast.success("Copied!");
                }}
                style={{
                  padding: "10px 16px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                📋 Copy
              </button>

              <button
               onClick={async () => {
                try {
                  const res = await fetch(`${API_URL}/save-prompt`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      uid: user.uid,
                      prompt: result,
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    toast.error(data.error || "Save failed");
                    return;
                  }

                  toast.success("Saved!");
                } catch (err) {
                  toast.error("Error saving prompt");
                }
              }}
                style={{
                  padding: "10px 16px",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                💾 Save
              </button>
            </div>
          </div>
        ) : (
          
          <div style={{ fontWeight: 800, opacity: 0.7 }}>
            Click Generate to see your output here.
            {!user?.uid ? (
              <div style={{ marginTop: 10, fontWeight: 900 }}>
                <Link to="/login" style={{ color: "#2563eb", textDecoration: "none" }}>
                  Login
                </Link>{" "}
                to enable Generate.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;