function PromptCard({ prompt, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition"
    >
      <h2 className="text-2xl font-bold">{prompt.title}</h2>
      <span className="inline-block mt-3 px-3 py-1 bg-blue-600 rounded-full text-sm">
        {prompt.category}
      </span>
      <p className="text-gray-400 mt-4">{prompt.description}</p>
    </div>
  );
}

export default PromptCard;