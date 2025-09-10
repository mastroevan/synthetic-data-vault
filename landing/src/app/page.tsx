"use client";
import { useState, useEffect } from "react";
import { Shield, Zap, Database, Github, Linkedin, Twitter } from "lucide-react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Synthetic Data Generator States
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const [generatedData, setGeneratedData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  // When user selects a template, parse placeholders
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template);
    // Reset variables
    if (template) {
      const content = template.content || "{}";
      const placeholderKeys = Array.from(content.matchAll(/{(.*?)}/g)).map((m) => (m as RegExpMatchArray)[1]);
      const newVars: { [key: string]: string } = {};
      placeholderKeys.forEach((key) => (newVars[key] = ""));
      setVariables(newVars);
    } else {
      setVariables({});
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return alert("Select a template!");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: selectedTemplate.id, variables }),
    });
    const data = await res.json();
    setGeneratedData(data);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-100">
      {/* Hero Section */}
      <div className="flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 text-center">
          Synthetic Data Vault
        </h1>
        <p className="text-lg text-gray-600 mb-6 text-center max-w-xl">
          Generate realistic, privacy-safe datasets on demand. Perfect for AI training, analytics, and testing.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700"
        >
          Join the Waitlist
        </button>

        {/* Features Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Privacy First</h3>
            <p className="text-gray-600 text-center mt-2">
              Data is anonymized and safe for compliance-heavy environments.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Fast & Scalable</h3>
            <p className="text-gray-600 text-center mt-2">
              Generate millions of rows instantly for any industry use case.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
            <Database className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Seamless Integration</h3>
            <p className="text-gray-600 text-center mt-2">
              Export directly to CSV, SQL, or API for smooth workflows.
            </p>
          </div>
        </section>

        {/* Synthetic Data Generator Section */}
        <section className="mt-16 w-full max-w-4xl bg-white p-6 rounded-xl shadow-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Generate Synthetic Data</h2>

          {/* Template Dropdown */}
          <select
            onChange={(e) => handleTemplateChange(e.target.value)}
            value={selectedTemplate?.id || ""}
            className="border p-2 rounded-md w-full mb-4"
          >
            <option value="">Select Template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Dynamic Input Fields */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 mb-4 flex-wrap">
            {Object.keys(variables).map((key) => (
              <input
                key={key}
                type="text"
                placeholder={key}
                value={variables[key]}
                onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                className="border p-2 rounded-md w-full md:w-auto flex-1"
              />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Generate
            </button>
          </div>

          {generatedData && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-semibold mb-2">Generated Data:</h3>
              <pre className="overflow-x-auto">{generatedData.data}</pre>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full mt-16 border-t pt-6 text-center text-gray-600">
        <p className="mb-4">&copy; {new Date().getFullYear()} Synthetic Data Vault. All rights reserved.</p>
        <div className="flex justify-center space-x-6">
          <a href="https://github.com/YOUR_GITHUB" target="_blank" className="hover:text-gray-900">
            <Github className="w-6 h-6" />
          </a>
          <a href="https://linkedin.com/in/YOUR_LINKEDIN" target="_blank" className="hover:text-gray-900">
            <Linkedin className="w-6 h-6" />
          </a>
          <a href="https://twitter.com/YOUR_TWITTER" target="_blank" className="hover:text-gray-900">
            <Twitter className="w-6 h-6" />
          </a>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>

            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdMMGGaP9jtM_XThafpABdSStK6dKN2r4Y1lhGFExYf8E2L_Q/viewform?embedded=true"
              width="100%"
              height="800"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="w-full"
            >
              Loading…
            </iframe>
          </div>
        </div>
      )}
    </main>
  );
}