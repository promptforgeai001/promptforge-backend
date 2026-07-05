function PricingCard({ title, price, features, buttonText, onClick }) {
  return (
    <div className="border rounded-2xl p-6 shadow-lg bg-white/5">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-4xl font-bold my-4">{price}</p>

      <ul className="space-y-2 mb-6">
        {features.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>

      <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl">
        {buttonText}
      </button>
    </div>
  );
}

export default PricingCard;