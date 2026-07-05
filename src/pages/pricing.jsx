import { useNavigate } from "react-router-dom";
import PricingCard from "../components/PricingCard";

function Pricing() {
  const navigate = useNavigate();



  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h1 className="text-5xl font-bold mb-4 text-blue-500">
          Choose Your Plan
        </h1>
        <p className="text-gray-400 text-lg">
          Start free, or upgrade for unlimited AI prompt generation.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
        <PricingCard
          title="Free Plan"
          price="$0/month"
          features={[
            "10 prompts per day",
            "Basic prompt library",
            "Saved prompts",
            "Community support",
          ]}
          buttonText="Start Free"
          onClick={() => navigate("/")}
        />

        <PricingCard
          title="Pro Plan"
          price="$4.99/month"
          features={[
            "Unlimited prompts",
            "AI tools",
            "Priority support",
            "Premium access",
          ]}
          buttonText="Upgrade Now"
          onClick={() => navigate("/upgrade")}
        />
      </div>
    </div>
  );
}

export default Pricing;