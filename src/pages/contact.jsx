import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

const API_URL = "https://promptforge-backend-v8z7.onrender.com";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Valid email is required.";
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (!form.message.trim()) next.message = "Message is required.";
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fill in all fields correctly.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        throw new Error(data?.error || "Send failed");
      }

      toast.success("Message sent successfully! ✅");
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (u) => {
    if (u?.email) {
      setForm((p) => ({ ...p, email: u.email }));
    }
  });
  return () => unsub();
}, []);

  return (
    <section className="max-w-3xl mx-auto py-20 px-6">
      <h1 className="text-5xl font-bold text-center mb-4">Contact Us</h1>

      <p className="text-center text-gray-400 mb-12">
        Have a question or suggestion? We'd love to hear from you.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
      >
        <div>
          <label className="block mb-2 text-gray-300">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl outline-none focus:border-blue-500"
          />
          {errors.name ? <p className="mt-2 text-sm text-red-400 font-semibold">{errors.name}</p> : null}
        </div>

        <div>
          <label className="block mb-2 text-gray-300">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl outline-none focus:border-blue-500"
          />
          {errors.email ? <p className="mt-2 text-sm text-red-400 font-semibold">{errors.email}</p> : null}
        </div>

        <div>
          <label className="block mb-2 text-gray-300">Subject</label>
          <input
            name="subject"
            type="text"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl outline-none focus:border-blue-500"
          />
          {errors.subject ? <p className="mt-2 text-sm text-red-400 font-semibold">{errors.subject}</p> : null}
        </div>

        <div>
          <label className="block mb-2 text-gray-300">Message</label>
          <textarea
            name="message"
            rows="6"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message..."
            className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl outline-none focus:border-blue-500 resize-none"
          />
          {errors.message ? <p className="mt-2 text-sm text-red-400 font-semibold">{errors.message}</p> : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition py-4 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </section>
  );
  
}

export default Contact;