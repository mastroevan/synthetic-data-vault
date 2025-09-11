"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Zap, Database } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import Image from 'next/image';

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

  const headerKeys = Object.keys(data[0]);
  const header = headerKeys.join(",");

  const rows = data.map(row => {
    return headerKeys.map(key => {
      const value = row[key];
      if (typeof value === 'object' && value !== null) {
        const stringifiedValue = JSON.stringify(value).replace(/"/g, '""');
        return `"${stringifiedValue}"`;
      }
      return value;
    }).join(",");
  });
  return [header, ...rows].join("\n");
};

// New helper function to convert JSON to SQL INSERT statements
const convertToSql = (data: Record<string, any>[], tableName: string): string => {
  if (data.length === 0) return "";

  const sanitizedTableName = tableName.replace(/\s+/g, '_').toLowerCase();
  const columns = Object.keys(data[0]).join(", ");
  
  const insertStatements = data.map(row => {
    const values = Object.values(row).map(value => {
      if (typeof value === 'string') {
        // Escape single quotes for SQL
        const sanitizedValue = value.replace(/'/g, "''");
        return `'${sanitizedValue}'`;
      } else if (typeof value === 'object' && value !== null) {
        // Stringify objects and arrays, then escape quotes
        const stringifiedValue = JSON.stringify(value).replace(/'/g, "''");
        return `'${stringifiedValue}'`;
      }
      return value;
    }).join(", ");
    
    return `INSERT INTO "${sanitizedTableName}" (${columns}) VALUES (${values});`;
  });

  return insertStatements.join("\n");
};

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  
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

  // New function to handle SQL download
  const handleDownloadSql = () => {
    if (generatedData && selectedTemplate) {
      downloadFile(
        convertToSql(generatedData, selectedTemplate.name),
        `synthetic-data-${selectedTemplate.name.replace(/\s+/g, '-').toLowerCase()}.sql`,
        "application/sql"
      );
    }
  };

  return (
    <div className="relative flex flex-col items-center p-8 bg-gradient-to-br from-gray-500 to-gray-400 text-gray-900 min-h-screen">
      {isSignedIn && isLoaded && (
        <div className="absolute top-8 right-8">
          <UserButton afterSignOutUrl="/" />
        </div>
      )}

      <main className="flex flex-col items-center max-w-5xl w-full flex-grow gap-8">
        
        {!isSignedIn && (
          <>
            {/* Hero Section */}
            <div className="flex flex-col items-center max-w-lg text-center gap-4">
              <Image
                src="/titletxt.png"
                alt="Mock Data Pro"
                quality={100}
                width={700}
                height={700}
                className="w-64 h-auto"
              />
              <p className="text-lg text-gray-800">
                Generate realistic, privacy-safe datasets on demand. Perfect for AI training, analytics, and testing.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/sign-in">
                  <button
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
                  >
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/sign-up">
                  <button
                    className="px-8 py-3 bg-gray-700 text-white rounded-lg shadow-lg hover:bg-gray-600 transition duration-300 ease-in-out"
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Features Section - Pyramid Layout */}
            <section className="flex flex-col items-center gap-8 w-full max-w-2xl">
              <div className="flex flex-col items-center bg-gray-200 bg-opacity-75 p-6 rounded-xl shadow-md w-full">
                <Shield className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">Privacy First</h3>
                <p className="text-gray-700 text-center mt-2">
                  Data is anonymized and safe for compliance-heavy environments.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-8 w-full">
                <div className="flex flex-col items-center bg-gray-200 bg-opacity-75 p-6 rounded-xl shadow-md flex-1">
                  <Zap className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">Fast & Scalable</h3>
                  <p className="text-gray-700 text-center mt-2">
                    Generate millions of rows instantly for any industry use case.
                  </p>
                </div>
                <div className="flex flex-col items-center bg-gray-200 bg-opacity-75 p-6 rounded-xl shadow-md flex-1">
                  <Database className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">Seamless Integration</h3>
                  <p className="text-gray-700 text-center mt-2">
                    Export directly to CSV, SQL, or API for smooth workflows.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Synthetic Data Generator Section */}
        {isSignedIn && isLoaded && (
          <section className="w-full max-w-4xl bg-gray-200 bg-opacity-75 p-6 rounded-xl shadow-md mx-auto text-gray-900">
            <h2 className="text-2xl font-bold mb-4 text-center">Generate Synthetic Data</h2>
            <select
              onChange={(e) => handleTemplateChange(e.target.value)}
              value={selectedTemplate?.id || ""}
              className="border border-gray-400 bg-gray-300 text-gray-900 p-2 rounded-md w-full mb-4"
            >
              <option value="">Select Template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 mb-4">
              <label htmlFor="count" className="text-gray-800">Number of Rows:</label>
              <input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min="1"
                className="border border-gray-400 bg-gray-300 text-gray-900 p-2 rounded-md w-24"
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleGenerate}
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    <button onClick={handleDownloadSql} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      Download SQL
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto bg-gray-300 border border-gray-400 rounded-md">
                  <table className="min-w-full divide-y divide-gray-400">
                    <thead className="bg-gray-200">
                      <tr>
                        {Object.keys(generatedData[0]).map((key) => (
                          <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-400">
                      {generatedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
        )}
        {!isLoaded && <div className="text-center text-gray-600">Loading...</div>}
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto border-t border-gray-400 pt-6 text-center text-gray-500">
        <p className="mb-4">&copy; {new Date().getFullYear()} Synthetic Data Vault. All rights reserved.</p>
      </footer>
    </div>
  );
}