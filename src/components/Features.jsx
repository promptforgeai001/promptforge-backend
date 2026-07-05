const features = [
  {
    title: "AI Prompt Generator",
    desc: "Generate professional prompts instantly."
  },
  {
    title: "Prompt Library",
    desc: "Access thousands of prompts."
  },
  {
    title: "Multi AI Support",
    desc: "Works with ChatGPT, Claude and Gemini."
  },
  {
    title: "One Click Copy",
    desc: "Copy prompts instantly."
  },
  {
    title: "Prompt Optimization",
    desc: "Improve prompt quality."
  },
  {
    title: "Save Favorites",
    desc: "Store your best prompts."
  }
];

function Features() {
  return (
    <section className="px-10 py-20">

      <h2 className="text-4xl font-bold text-center mb-12">
        Powerful Features
      </h2>

      <div className="grid md:grid-cols-3 gap-8">

        {features.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 p-8 rounded-2xl"
          >
            <h3 className="text-2xl font-bold mb-3">
              {item.title}
            </h3>

            <p className="text-gray-400">
              {item.desc}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}

export default Features;