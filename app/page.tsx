"use client";

import { useState } from "react";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [reason, setReason] = useState("Missing required experience");
  const [output, setOutput] = useState("");
  const [uploading, setUploading] = useState(false);

  async function generateDemo() {
    try {
      setOutput("Generating AI response...");

      const res = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resume,
          reason,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput(data.error);
      } else {
        setOutput(data.output || "No response generated.");
      }
    } catch (error) {
      console.error(error);
      setOutput("Something went wrong generating feedback.");
    }
  }

  async function handleResumeUpload(file: File) {
  try {
    setUploading(true);
    setResume("Reading resume PDF...");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/extract-resume", {
      method: "POST",
      body: formData,
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);

      if (data.error) {
        setResume("Could not read PDF: " + data.error);
      } else {
        setResume(data.text || "No text found in PDF.");
      }
    } catch {
      setResume("PDF upload route returned an error:\n\n" + text);
    }
  } catch (error) {
    console.error(error);
    setResume("Something went wrong reading the resume PDF.");
  } finally {
    setUploading(false);
  }
}


  return (
    <main className="min-h-screen bg-[#f4f7fb] p-8 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-[#111827]">
            Candidate Feedback Copilot
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            AI-powered candidate feedback for modern HR teams.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <h2 className="mb-5 text-2xl font-semibold text-[#111827]">
              Candidate Evaluation
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Job Description
                </label>

                <textarea
                  className="min-h-44 w-full rounded-xl border border-gray-300 bg-white p-4 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Candidate Resume
                </label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();

                    const file = e.dataTransfer.files?.[0];

                    if (file && file.type === "application/pdf") {
                      handleResumeUpload(file);
                    } else {
                      setResume("Please upload a PDF resume.");
                    }
                  }}
                  className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-5 text-center text-blue-700"
                >
                  <p className="font-semibold">
                    Drag and drop a PDF resume here
                  </p>

                  <p className="mt-1 text-sm">
                    or click below to upload
                  </p>

                  <input
                    type="file"
                    accept="application/pdf"
                    className="mt-4 text-sm text-black"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        handleResumeUpload(file);
                      }
                    }}
                  />

                  {uploading && (
                    <p className="mt-3 text-sm font-medium text-blue-700">
                      Reading resume PDF...
                    </p>
                  )}
                </div>

                <textarea
                  className="mt-4 min-h-44 w-full rounded-xl border border-gray-300 bg-white p-4 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Resume text will appear here after upload, or paste it manually..."
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Reason Not Selected
                </label>

                <select
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option>Missing required experience</option>
                  <option>Missing certification</option>
                  <option>Stronger candidate selected</option>
                  <option>Role filled internally</option>
                  <option>Application incomplete</option>
                </select>
              </div>

              <button
                onClick={generateDemo}
                className="w-full rounded-xl bg-[#2563eb] px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-[#1d4ed8]"
              >
                Generate Candidate Response
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#111827] p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                AI Generated Output
              </h2>

              <div className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                AI Active
              </div>
            </div>

            <div className="min-h-[600px] whitespace-pre-wrap overflow-auto rounded-xl border border-gray-700 bg-[#1f2937] p-5 text-gray-100">
              {output || "Your generated candidate feedback will appear here."}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}