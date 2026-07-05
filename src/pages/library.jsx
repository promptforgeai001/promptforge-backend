import { useState } from "react";
import { prompts } from "../data/prompts";
import { useNavigate } from "react-router-dom";
import PromptCard from "../components/PromptCard";

function Library() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto px-10 py-20">
      <h1 className="text-5xl font-bold text-center mb-10">
        Prompt Library
      </h1>

      <input
        type="text"
        placeholder="Search prompts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-4 rounded-xl bg-white/10 border border-white/20 outline-none mb-10"
      />

      <div className="grid md:grid-cols-3 gap-8">
        {filteredPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onClick={() => navigate(`/prompt/${prompt.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

export default Library;