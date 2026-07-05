import { useParams } from "react-router-dom";
import { prompts } from "../data/prompts";

function PromptDetail() {

  const { id } = useParams();
  const prompt = prompts.find(p => p.id === Number(id));

  if (!prompt) return <p>Prompt not found</p>;

  return (
    <div style={{ padding: "40px 0" }}>

      <h1 style={{ fontSize: "32px", marginBottom: "15px" }}>
        {prompt.title}
      </h1>

      <p style={{ marginBottom: "20px", opacity: 0.7 }}>
        {prompt.description}
      </p>

      <button
        style={{
          padding: "10px 20px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px"
        }}
        onClick={() => navigator.clipboard.writeText(prompt.title)}
      >
        Copy Prompt Title
      </button>

    </div>
  );
}

export default PromptDetail;