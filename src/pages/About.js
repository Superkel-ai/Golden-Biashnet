// src/pages/About.js

import Hero from "../components/about/Hero";
import Vision from "../components/about/Vision";
import Invest from "../components/about/Invest";
import Download from "../components/about/Download";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Hero />

      {/* Vision & Roadmap */}
      <Vision />

      {/* Investors & Supporters */}
      <Invest />

      {/* Company Documents */}
      <Download />
    </div>
  );
}