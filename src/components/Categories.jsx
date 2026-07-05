const categories = [
  "Marketing",
  "Freelancing",
  "Business",
  "CV & Jobs",
  "Content Creation"
];

function Categories() {
  return (
    <section className="px-10 py-20">

      <h2 className="text-4xl font-bold text-center mb-12">
        Prompt Categories
      </h2>

      <div className="grid md:grid-cols-5 gap-6">

        {categories.map((cat, index) => (
          <div
            key={index}
            className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-8 text-center"
          >
            <h3 className="text-xl font-bold">
              {cat}
            </h3>

            <button className="mt-4 text-blue-400">
              View Prompts
            </button>
          </div>
        ))}

      </div>

    </section>
  );
}

export default Categories;