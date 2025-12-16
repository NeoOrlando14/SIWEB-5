"use client";

import { useState } from "react";

export default function UploadLaporan() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const file = e.target.file.files[0];
    if (!file) {
      setError("Pilih file terlebih dahulu!");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/owner-laporan-upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      // Check if response has success property (from successful upload)
      if (json.success) {
        setMessage(`Upload berhasil! ${json.inserted} data berhasil dimasukkan.`);
        // Reset form
        e.target.reset();
        setLoading(false);
        return;
      }

      // If not success, show error
      if (json.error) {
        setError("Error upload: " + json.error);
        setLoading(false);
        return;
      }

      // Fallback for unexpected response
      if (!res.ok) {
        setError("Upload gagal dengan status: " + res.status);
        setLoading(false);
        return;
      }

      setLoading(false);

    } catch (err) {
      setError("ERROR: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Upload Laporan CSV / JSON</h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          name="file"
          className="p-2 bg-gray-800 rounded border border-gray-600"
          accept=".csv, .json"
        />

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {loading && (
        <p className="mt-4 text-blue-400 font-semibold">⏳ Sedang mengupload...</p>
      )}

      {message && (
        <p className="mt-4 text-green-400 font-semibold">✅ {message}</p>
      )}

      {error && (
        <p className="mt-4 text-red-400 font-semibold">❌ {error}</p>
      )}
    </div>
  );
}
