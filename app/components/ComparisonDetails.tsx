"use client";

import React from "react";

export default function ComparisonDetails() {
  return (
    <>
      {/* --- INSERTED SECTION: Amazon AI Tools vs. AURORA9 Autonomous Agentic AI-Agents --- */}
      <section id="comparison-details" className="mt-16">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Amazon AI Tools vs. AURORA9 Autonomous Agentic AI-Agents
        </h2>
        <p className="text-gray-300 mb-6">
          A concise, up-to-date rundown of Amazon’s Seller Central AI/ML tools,
          followed by a side-by-side vs. AURORA9’s autonomous agents with
          pros/cons and 5-star feature ratings.
        </p>

        {/* Amazon AI / ML tools list */}
        <h3 className="text-xl font-semibold text-white mt-8 mb-3">
          Amazon AI / ML tools available to Seller Central brands (2024–2025)
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>
            <strong>Enhance My Listing</strong>, generative-AI listing optimizer
            that rewrites or fills missing attributes, titles, and bullets,
            including from a URL or image.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://www.aboutamazon.com/news/innovation-at-amazon/amazon-generative-ai-seller-growth-shopping-experience?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              About Amazon
            </a>
          </li>
          <li>
            <strong>Seller Assistant / AI chatbot (“Amelia”)</strong>, answers
            business questions, helps with inventory and ads tasks, with broader
            automation planned.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://www.reuters.com/technology/amazon-adds-chatbot-its-sellers-boosting-automation-2024-09-19/?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reuters
            </a>
          </li>
          <li>
            <strong>Brand Analytics &amp; Search Query Performance (SQP)</strong>,
            dashboard suite for paid plus organic query performance, market
            basket, demographics, repeat purchase, etc.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://sell.amazon.com/tools/amazon-brand-analytics?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sell on Amazon
            </a>
          </li>
          <li>
            <strong>Custom Analytics (new)</strong>, personal data workbench
            that unifies 100+ metrics previously scattered across reports.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://sellingpartners.aboutamazon.com/amazon-announces-new-tools-to-help-sellers-save-time-and-money?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Amazon SER
            </a>
          </li>
          <li>
            <strong>Product Opportunity Explorer (POE)</strong>, ML-driven
            demand and niche discovery for new product ideas.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://sellercentral.amazon.com/help/hub/reference/external/GNJ4YRTXWLMBY38U?locale=en-US&utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Amazon Seller Central
            </a>
          </li>
          <li>
            <strong>Manage Your Experiments (MYE)</strong>, built-in A/B testing
            for titles, images, bullets, A+ and Brand Story with auto-stop at
            statistical significance.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://sellercentral.amazon.com/help/hub/reference/external/GVP453K5XRBJS7Y9?locale=en-US&utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Amazon Seller Central
            </a>
          </li>
          <li>
            <strong>Automate Pricing</strong>, automated repricer tuned for
            Featured Offer competition.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://sell.amazon.com/tools/automate-pricing?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sell on Amazon
            </a>
          </li>
          <li>
            <strong>Restock/Minimum Inventory Level recommendations</strong>,
            demand-forecasting suggestions for replenishment.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://sellercentral.amazon.com/help/hub/reference/external/G201634550?locale=en-US&utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Amazon Seller Central
            </a>
          </li>
          <li>
            <strong>Amazon Ads AI creatives: Video Generator</strong>, free AI
            tool to auto-produce short product video ads.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://www.theverge.com/news/685160/amazon-ads-ai-video-generator-us-launch-availability?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Verge
            </a>
          </li>
          <li>
            <strong>Brand Tailored Promotions (audience targeting)</strong>,
            ML-informed audience building for offers to
            followers/repeat buyers/cart abandoners.{" "}
            <a
              className="text-blue-400 hover:underline"
              href="https://salesduo.com/blog/amazon-brand-tailored-promotions/?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              SalesDuo
            </a>
          </li>
        </ul>

        {/* Comparison table */}
        <h3 className="text-xl font-semibold text-white mt-10 mb-3">
          Comparison: Amazon AI tools vs. AURORA9 Autonomous Agents
        </h3>
        <p className="text-gray-400 mb-4">
          Ratings: ★☆☆☆☆ to ★★★★★ reflect capability depth for pro brands
          managing at scale.
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-4 py-3">Capability</th>
                <th className="px-4 py-3">Amazon tool</th>
                <th className="px-4 py-3">Pros</th>
                <th className="px-4 py-3">Cons</th>
                <th className="px-4 py-3 text-right">Amazon ★</th>
                <th className="px-4 py-3">AURORA9 agent</th>
                <th className="px-4 py-3 text-right">AURORA9 ★</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  cap: "Listing optimization",
                  amazon: (
                    <>
                      Enhance My Listing{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://www.aboutamazon.com/news/innovation-at-amazon/amazon-generative-ai-seller-growth-shopping-experience?utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Fast, native, policy-aware; reduces copy time",
                  cons:
                    "Generic tone, limited brand voice control, no causal lift loop",
                  aStars: "★★★★☆",
                  aurora: "Creative & Listing Agent",
                  uStars: "★★★★★",
                },
                {
                  cap: "Always-on seller help",
                  amazon: (
                    <>
                      Seller Assistant (“Amelia”){" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://www.reuters.com/technology/amazon-adds-chatbot-its-sellers-boosting-automation-2024-09-19/?utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Native, context on Seller Central screens",
                  cons: "Early rollout, scope limited, actioning still manual",
                  aStars: "★★★☆☆",
                  aurora: "Operations Copilot",
                  uStars: "★★★★★",
                },
                {
                  cap: "Search & market intel",
                  amazon: (
                    <>
                      Brand Analytics + SQP{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://sell.amazon.com/tools/amazon-brand-analytics?utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Unique first-party view; term-level funnel",
                  cons:
                    "No incrementality, gaps by ASIN/locale, export friction",
                  aStars: "★★★★☆",
                  aurora: "Attribution Reconstruction Agent",
                  uStars: "★★★★★",
                },
                {
                  cap: "Data workbench",
                  amazon: (
                    <>
                      Custom Analytics{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://sellingpartners.aboutamazon.com/amazon-announces-new-tools-to-help-sellers-save-time-and-money?utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "One place for KPIs; free",
                  cons: "Descriptive not prescriptive; limited automation hooks",
                  aStars: "★★★★☆",
                  aurora: "Decision Hub",
                  uStars: "★★★★★",
                },
                {
                  cap: "Product research",
                  amazon: (
                    <>
                      Product Opportunity Explorer{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://sellercentral.amazon.com/help/hub/reference/external/GNJ4YRTXWLMBY38U?locale=en-US&utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Direct Amazon demand signals",
                  cons: "Ideation only, no P&L or ops simulation",
                  aStars: "★★★★☆",
                  aurora: "New-Product Simulator",
                  uStars: "★★★★★",
                },
                {
                  cap: "Experimentation",
                  amazon: (
                    <>
                      Manage Your Experiments{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://sellercentral.amazon.com/help/hub/reference/external/GVP453K5XRBJS7Y9?locale=en-US&utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Free, native stats",
                  cons: "Not all modules/locales, no cross-asset tests",
                  aStars: "★★★★☆",
                  aurora: "Experimentation Copilot",
                  uStars: "★★★★★",
                },
                {
                  cap: "Pricing",
                  amazon: (
                    <>
                      Automate Pricing{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://sell.amazon.com/tools/automate-pricing?utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Easy setup, Featured Offer aware",
                  cons:
                    "Margin-blind, no cross-channel parity modeling",
                  aStars: "★★★☆☆",
                  aurora: "Buy Box & Pricing Agent",
                  uStars: "★★★★★",
                },
                {
                  cap: "Inventory planning",
                  amazon: (
                    <>
                      Restock/Min. Inventory{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://sellercentral.amazon.com/help/hub/reference/external/G201634550?locale=en-US&utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Useful baselines; fee-aware",
                  cons:
                    "Not ATS-aware across reserved/transfer, limited ad sync",
                  aStars: "★★★★☆",
                  aurora: "In-Stock Reality Agent",
                  uStars: "★★★★★",
                },
                {
                  cap: "Ad creative",
                  amazon: (
                    <>
                      AI Video Generator{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://www.theverge.com/news/685160/amazon-ads-ai-video-generator-us-launch-availability?utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Free, fast video units",
                  cons: "21s cap, light brand control",
                  aStars: "★★★☆☆",
                  aurora: "Creative Studio Agent",
                  uStars: "★★★★★",
                },
                {
                  cap: "Audience offers",
                  amazon: (
                    <>
                      Brand Tailored Promotions{" "}
                      <a
                        className="text-blue-400 hover:underline"
                        href="https://salesduo.com/blog/amazon-brand-tailored-promotions/?utm_source=chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (ref)
                      </a>
                    </>
                  ),
                  pros: "Easy native segmentation",
                  cons:
                    "Limited lifecycle orchestration, scarce LTV view",
                  aStars: "★★★★☆",
                  aurora: "Lifecycle & CRM Proxy Agent",
                  uStars: "★★★★★",
                },
              ].map((row, i) => (
                <tr key={i} className="border-t border-gray-800 align-top">
                  <td className="px-4 py-4 font-medium text-white">{row.cap}</td>
                  <td className="px-4 py-4 text-gray-300">{row.amazon}</td>
                  <td className="px-4 py-4 text-gray-300">{row.pros}</td>
                  <td className="px-4 py-4 text-gray-300">{row.cons}</td>
                  <td className="px-4 py-4 text-right text-gray-200">{row.aStars}</td>
                  <td className="px-4 py-4 text-gray-300">{row.aurora}</td>
                  <td className="px-4 py-4 text-right text-gray-200">{row.uStars}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pros & Cons summary */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-800 p-5 bg-gray-900/40">
            <h4 className="text-lg font-semibold text-white mb-2">Amazon native AI</h4>
            <p className="text-gray-300">
              <strong>Pros:</strong> free or included, policy-compatible, deep first-party data, low setup.
            </p>
            <p className="text-gray-300 mt-2">
              <strong>Cons:</strong> siloed, mostly assistive not autonomous, limited causal modeling and cross-function automation, early-stage chat assistant.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 p-5 bg-gray-900/40">
            <h4 className="text-lg font-semibold text-white mb-2">AURORA9 agents</h4>
            <p className="text-gray-300">
              <strong>Pros:</strong> end-to-end autonomy with human guardrails, incrementality and profit-first models, cross-tool orchestration, explainable decisions, audit trails.
            </p>
            <p className="text-gray-300 mt-2">
              <strong>Cons:</strong> requires initial configuration and data wiring, governance setup, and change-management to adopt autonomous loops.
            </p>
          </div>
        </div>

        {/* Quick star leaderboard */}
        <h3 className="text-xl font-semibold text-white mt-10 mb-3">
          Quick star leaderboard (capability depth at scale)
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Listing optimization: Amazon ★★★★☆ vs AURORA9 ★★★★★.</li>
          <li>Search analytics: Amazon ★★★★☆ vs AURORA9 ★★★★★.</li>
          <li>Pricing: Amazon ★★★☆☆ vs AURORA9 ★★★★★.</li>
          <li>Inventory planning: Amazon ★★★★☆ vs AURORA9 ★★★★★.</li>
          <li>Experimentation: Amazon ★★★★☆ vs AURORA9 ★★★★★.</li>
          <li>Ads creative: Amazon ★★★☆☆ vs AURORA9 ★★★★★.</li>
          <li>Data workbench: Amazon ★★★★☆ vs AURORA9 ★★★★★.</li>
        </ul>
      </section>
      {/* --- END INSERTED SECTION --- */}
    </>
  );
}
