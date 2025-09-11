"use client";
import { useState, useEffect } from "react";
import { Shield, Zap, Database, Github, Linkedin, Twitter } from "lucide-react";

// Helper function to download a file
const downloadFile = (data: string, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function to convert JSON to CSV
const convertToCsv = (data: Record<string, any>[]): string => {
  if (data.length === 0) return "";

  // Handle nested objects/arrays in header
  const headerKeys = Object.keys(data[0]);
  const header = headerKeys.join(",");

  const rows = data.map(row => {
    return headerKeys.map(key => {
      const value = row[key];
      // Stringify objects and arrays to keep them in one cell
      if (typeof value === 'object' && value !== null) {
        // Handle values with commas or quotes
        const stringifiedValue = JSON.stringify(value).replace(/"/g, '""');
        return `"${stringifiedValue}"`;
      }
      return value;
    }).join(",");
  });
  return [header, ...rows].join("\n");
};

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Synthetic Data Generator States
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [count, setCount] = useState<number>(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template);
    setGeneratedData(null); // Clear previous data
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      alert("Select a template!");
      return;
    }
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate.id, count }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate data.");
      }

      const data = await response.json();
      setGeneratedData(data.data);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      } finally {
        setIsGenerating(false);
      }
  };

  const handleDownloadJson = () => {
    if (generatedData) {
      downloadFile(
        JSON.stringify(generatedData, null, 2),
        `synthetic-data-${selectedTemplate.name.replace(/\s+/g, '-').toLowerCase()}.json`,
        "application/json"
      );
    }
  };

  const handleDownloadCsv = () => {
    if (generatedData) {
      downloadFile(
        convertToCsv(generatedData),
        `synthetic-data-${selectedTemplate.name.replace(/\s+/g, '-').toLowerCase()}.csv`,
        "text/csv"
      );
    }
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
            className="px-8 py-3 bg-gray-700 text-white rounded-lg shadow-lg hover:bg-gray-600 transition duration-300 ease-in-out"
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
                id="template-select"
                onChange={(e) => handleTemplateChange(e.target.value)}
                value={selectedTemplate?.id || ""}
            className="border p-2 rounded-md w-full mb-4"
              >
                <option value="">Select Template</option>
                {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

          {/* New input for number of rows */}
          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="count" className="text-gray-700">Number of Rows:</label>
              <input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min="1"
              className="border p-2 rounded-md w-24"
              />
          </div>
          
          <div className="text-center">
            <button
              onClick={handleGenerate}
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>

          {generatedData && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Generated Data Preview</h3>
                <div className="flex space-x-2">
                  <button onClick={handleDownloadJson} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                    Download JSON
                  </button>
                  <button onClick={handleDownloadCsv} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Download CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto bg-gray-50 border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(generatedData[0]).map((key) => (
                        <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {/* Display objects and arrays nicely */}
                            {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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