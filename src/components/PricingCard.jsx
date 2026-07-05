function PricingCard({ title, price, features, buttonText, onClick }) {
  return (
    <div className="border border-white/10 rounded-2xl p-8 bg-white/5 shadow-lg hover:scale-[1.02] transition">
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="text-4xl font-bold my-5 text-blue-400">{price}</p>

      <ul className="space-y-3 mb-8 text-gray-300">
        {features.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>

      <button
        onClick={onClick || (() => {})}
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition"
        >
        {buttonText}
      </button>
    </div>
  );
}

export default PricingCard;