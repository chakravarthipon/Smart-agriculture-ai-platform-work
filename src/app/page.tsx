"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  ScanLine,
  Activity,
  History,
  BookOpen,
  Bell,
  ArrowRight,
  CheckCircle2,
  Camera,
  Brain,
  BarChart3,
  Shield,
  Upload,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: ScanLine,
    title: "AI Disease Detection",
    description:
      "Upload a leaf image and get instant AI-powered disease classification with confidence scores.",
  },
  {
    icon: Brain,
    title: "Intelligent Image Analysis",
    description:
      "Advanced computer vision processes your plant images for accurate condition identification.",
  },
  {
    icon: Activity,
    title: "Crop Health Monitoring",
    description:
      "Track plant health over time with continuous monitoring and observation records.",
  },
  {
    icon: BookOpen,
    title: "Disease Information",
    description:
      "Access a comprehensive library of crop diseases with symptoms, causes, and management guidance.",
  },
  {
    icon: Bell,
    title: "Early Warning",
    description:
      "Receive alerts when repeated observations indicate potential disease progression.",
  },
  {
    icon: History,
    title: "Detection History",
    description:
      "Maintain a complete record of all detections with search, filtering, and export capabilities.",
  },
];

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Capture and Upload",
    description:
      "Take a clear photo of a plant leaf or upload an existing image from your device.",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Analyzes the Image",
    description:
      "Our deep learning model processes the image through a computer vision pipeline.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "View Disease Prediction",
    description:
      "Receive the predicted disease classification with confidence score and detailed information.",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Take Action",
    description:
      "Explore recommended next steps, prevention measures, and management guidance.",
  },
];

const highlights = [
  { icon: Shield, label: "AI-powered image analysis" },
  { icon: Activity, label: "Plant health monitoring" },
  { icon: History, label: "Detection history tracking" },
  { icon: BookOpen, label: "Preventive guidance" },
];

const supportedCrops = [
  { name: "Tomato", diseases: 9, color: "#D9534F" },
  { name: "Potato", diseases: 3, color: "#E7A33E" },
  { name: "Corn", diseases: 4, color: "#3C9565" },
  { name: "Apple", diseases: 4, color: "#D9534F" },
  { name: "Grape", diseases: 4, color: "#7B68EE" },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-semibold text-text-primary">
              AgriVision AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#crops"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Crop Diseases
            </a>
            <a
              href="#about"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              About
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="text-sm bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest-deep transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3"
          >
            <a
              href="#features"
              className="block text-sm text-text-secondary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="block text-sm text-text-secondary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>

            <a
              href="#crops"
              className="block text-sm text-text-secondary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Crop Diseases
            </a>

            <div className="flex gap-3 pt-2 border-t border-border">
              <Link
                href="/login"
                className="text-sm text-text-secondary py-2"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="text-sm bg-forest text-white px-4 py-2 rounded-lg font-medium"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest/5 via-transparent to-fresh/5" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-mint text-forest text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                <Leaf size={14} />
                Smart Agriculture Technology
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.1] text-text-primary mb-6">
                Protect Every Leaf.{" "}
                <span className="text-forest">
                  Grow a Better Tomorrow.
                </span>
              </h1>

              <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
                Detect crop diseases earlier with AI-powered plant analysis.
                Make informed decisions, monitor crop health, and protect your
                harvest with intelligent agricultural technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest-deep transition-colors font-medium text-sm"
                >
                  Start Free Detection
                  <ArrowRight size={16} />
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 border border-border text-text-primary px-6 py-3 rounded-lg hover:bg-mint hover:border-forest/20 transition-colors font-medium text-sm"
                >
                  Explore Platform
                </a>
              </div>

              {/* Trust highlights */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                {highlights.map((h) => (
                  <div
                    key={h.label}
                    className="flex items-center gap-2.5 text-sm text-text-secondary"
                  >
                    <h.icon
                      size={16}
                      className="text-forest flex-shrink-0"
                    />
                    <span>{h.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-surface rounded-2xl border border-border shadow-lg p-6 max-w-md ml-auto">
                {/* Mock detection interface */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-forest/10 rounded-lg flex items-center justify-center">
                    <ScanLine size={20} className="text-forest" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Disease Analysis
                    </p>

                    <p className="text-xs text-text-secondary">
                      Tomato leaf scan
                    </p>
                  </div>
                </div>

                <div className="bg-bg rounded-xl p-4 mb-4">
                  {/* Tomato Leaf Image */}
                  <div className="relative w-full h-36 rounded-lg overflow-hidden mb-3 bg-mint">
                    <Image
                      src="/images/tomato-leaf.jpg"
                      alt="Tomato leaf disease analysis"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>tomato_leaf_01.jpg</span>
                    <span>2.4 MB</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Prediction
                    </span>

                    <span className="text-sm font-medium text-text-primary">
                      Early Blight
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Confidence
                    </span>

                    <span className="text-sm font-medium text-forest">
                      94.2%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Status
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs text-warning">
                      <span className="w-1.5 h-1.5 bg-warning rounded-full" />
                      Attention Needed
                    </span>
                  </div>

                  <div className="w-full bg-border rounded-full h-1.5">
                    <div
                      className="bg-forest h-1.5 rounded-full"
                      style={{ width: "94%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating stat card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -left-8 bottom-12 bg-surface rounded-xl border border-border shadow-lg p-4 w-48"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-success" />
                  <span className="text-xs font-medium text-text-primary">
                    Analysis Complete
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary">
                  3 conditions identified
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-medium text-forest mb-3">
                Platform Features
              </p>

              <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Intelligent Tools for Smarter Farming
              </h2>

              <p className="text-text-secondary max-w-2xl mx-auto">
                A comprehensive suite of agricultural intelligence tools
                designed to help farmers protect their crops and make
                data-driven decisions.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-surface border border-border rounded-xl p-6 hover:border-forest/20 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-mint rounded-lg flex items-center justify-center mb-4 group-hover:bg-forest/10 transition-colors">
                  <feature.icon size={20} className="text-forest" />
                </div>

                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-forest mb-3">
              Simple Process
            </p>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
              How It Works
            </h2>

            <p className="text-text-secondary max-w-xl mx-auto">
              Four simple steps to identify and manage crop diseases using AI
              technology.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-border" />

            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <div className="w-24 h-24 bg-mint rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                  <step.icon size={32} className="text-forest" />

                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-forest text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Crops */}
      <section id="crops" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-forest mb-3">
              Crop Coverage
            </p>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Supported Crops
            </h2>

            <p className="text-text-secondary max-w-xl mx-auto">
              Our model supports disease detection across multiple crop types,
              with the ability to identify various conditions from leaf images.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {supportedCrops.map((crop, i) => (
              <motion.div
                key={crop.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface border border-border rounded-xl p-5 text-center hover:border-forest/20 transition-all"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: crop.color + "15" }}
                >
                  <Leaf size={28} style={{ color: crop.color }} />
                </div>

                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  {crop.name}
                </h3>

                <p className="text-xs text-text-secondary">
                  {crop.diseases} conditions
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-forest mb-3">
              About AgriVision AI
            </p>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Technology Serving Agriculture
            </h2>

            <p className="text-text-secondary leading-relaxed mb-6">
              AgriVision AI combines deep learning and computer vision to help
              farmers identify potential crop diseases early. By analyzing leaf
              images, our system provides decision-support information that can
              help farmers take timely action to protect their harvests.
            </p>

            <p className="text-text-secondary leading-relaxed">
              Our AI analysis is designed as decision-support information, not
              a definitive laboratory diagnosis. We recommend combining AI
              insights with professional agricultural guidance for the best
              outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-forest rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-forest-deep/50 to-transparent" />

            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Your Next Harvest Starts with Healthier Crops
              </h2>

              <p className="text-white/80 max-w-lg mx-auto mb-8">
                Start using AI-powered disease detection to protect your
                plants and improve your agricultural outcomes.
              </p>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-forest px-6 py-3 rounded-lg hover:bg-mint transition-colors font-medium text-sm"
              >
                <Upload size={16} />
                Analyze Your First Leaf
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
                  <Leaf size={18} className="text-white" />
                </div>

                <span className="font-semibold text-text-primary">
                  AgriVision AI
                </span>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed">
                Intelligent crop health monitoring and disease detection
                powered by artificial intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                Product
              </h4>

              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    Features
                  </a>
                </li>

                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    How It Works
                  </a>
                </li>

                <li>
                  <a
                    href="#crops"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    Supported Crops
                  </a>
                </li>

                <li>
                  <Link
                    href="/dashboard/diseases"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    Disease Library
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                Resources
              </h4>

              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    About
                  </a>
                </li>

                <li>
                  <Link
                    href="/login"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    Sign In
                  </Link>
                </li>

                <li>
                  <Link
                    href="/register"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                Legal
              </h4>

              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    Privacy Policy
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    Terms of Service
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-xs text-text-secondary">
              &copy; {new Date().getFullYear()} AgriVision AI. All rights
              reserved. Smart Agriculture Technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}