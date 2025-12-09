"use client";

import { useState } from "react";

export default function UploadLaporan() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const file = e.target.file.files[0];
    if (!file) {
      setError("Pilih file terlebih dahulu!");
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

      if (!res.ok) {
        setError("Error upload: " + json.error);
        return;
      }

      // 🔥 FIX: backend mengirim { success: true, inserted: number }
      setMessage(`Upload berhasil! ${json.inserted} data berhasil dimasukkan.`);

    } catch (err) {
      setError("ERROR: " + err.message);
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
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Upload
        </button>
      </form>

      {message && (
        <p className="mt-4 text-green-400 font-semibold">{message}</p>
      )}

      {error && (
        <p className="mt-4 text-red-400 font-semibold">{error}</p>
      )}
    </div>
  );
}
