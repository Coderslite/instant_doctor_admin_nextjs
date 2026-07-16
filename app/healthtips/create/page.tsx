"use client";

import React, { useEffect, useState } from "react";
import { db, storage } from "@/firebase/clientApp";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { getHealthCategory } from "@/server/healthtips";
import type { HealthCategoryModel } from "@/app/model/healthtips_model";

// 🔥 SLUG GENERATOR
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove symbols
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/-+/g, "-"); // collapse repeated -
}

export default function CreateHealthTipPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [publishedAt, setPublishedAt] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [categories, setCategories] = useState<HealthCategoryModel[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getHealthCategory();
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Failed fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // 🔹 Upload Image
  const handleImageUpload = async () => {
    if (!imageFile) {
      alert("Please select an image first!");
      return;
    }

    const fileRef = ref(storage, `healthtips/${uuidv4()}-${imageFile.name}`);
    const uploadTask = uploadBytesResumable(fileRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setMessage("❌ Image upload failed.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(downloadURL);
        setMessage("✅ Image uploaded successfully!");
      }
    );
  };

  // 🔹 Save Health Tip
  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in title and description!");
      return;
    }

    if (!imageUrl) {
      alert("Please upload an image before saving.");
      return;
    }

    if (!publishedAt) {
      alert("Please set a publish date.");
      return;
    }

    if (!categoryId) {
      alert("Please select a category.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("⏳ Saving health tip...");

      // 🔥 Generate SEO slug
      const baseSlug = generateSlug(title);
      const slug = `${baseSlug}-${Date.now()}`; // unique + SEO-friendly

      const docRef = doc(collection(db, "HealthTips"));
      await setDoc(docRef, {
        id: docRef.id,
        title,
        slug, // <-- added
        description,
        image: imageUrl,
        categoryId,
        type: "article",
        isSent: false,
        views: 0,
        createdAt: serverTimestamp(),
        publishedAt: Timestamp.fromDate(new Date(publishedAt)),
      });

      setMessage("✅ Health tip created successfully!");

      // reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
      setImageUrl("");
      setPublishedAt("");
      setUploadProgress(null);
    } catch (error) {
      console.error("Error saving health tip:", error);
      setMessage("❌ Failed to save health tip.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          🩺 Create New Health Tip
        </h1>

        {/* Top Controls */}
        <div className="flex gap-3 justify-end mb-6">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-4 py-2 rounded-lg border ${
              !isPreview
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-4 py-2 rounded-lg border ${
              isPreview
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            👁 Preview
          </button>
        </div>

        {/* Title Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Title:</label>
          <input
            type="text"
            placeholder="Enter health tip title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category selector */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Category:
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Publish Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Publish Date:
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Upload Image:
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
            />
            <button
              onClick={handleImageUpload}
              disabled={!imageFile}
              className={`px-4 py-2 rounded-lg ${
                !imageFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-semibold`}
            >
              Upload
            </button>
          </div>
          {uploadProgress !== null && (
            <p className="text-sm text-gray-600 mt-2">
              Upload Progress: {uploadProgress.toFixed(0)}%
            </p>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Uploaded"
              className="mt-4 rounded-lg w-48 h-32 object-cover border"
            />
          )}
        </div>

        {/* Description / Preview */}
        <div className="border border-gray-200 rounded-lg p-4 min-h-[300px] bg-gray-50 overflow-auto mb-6">
          {!isPreview ? (
            <textarea
              className="w-full h-[300px] p-4 border-none focus:ring-0 bg-transparent font-mono text-sm text-gray-800"
              placeholder="Write your health tip content here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          ) : (
            <iframe
              title="healthtip-preview"
              srcDoc={description}
              className="w-full h-[300px] border-none rounded-md bg-white"
            />
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">{message}</p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`${
              isSaving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-3 rounded-lg font-semibold shadow-md transition`}
          >
            {isSaving ? "⏳ Saving..." : "💾 Save Health Tip"}
          </button>
        </div>
      </div>
    </div>
  );
}
