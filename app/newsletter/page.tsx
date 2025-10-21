"use client";
import { useState } from "react";
import { getAllUsers } from "@/server/user";

export default function NewsletterPage() {
    const [htmlCode, setHtmlCode] = useState("");
    const [recipientType, setRecipientType] = useState("users");
    const [isPreview, setIsPreview] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState("");

    const handleSend = async () => {
        if (!htmlCode.trim()) {
            alert("Please paste the newsletter HTML before sending.");
            return;
        }

        setIsSending(true);
        setMessage("⏳ Fetching recipients...");

        try {
            // 🔹 Fetch all users from Firestore
            const allUsers = await getAllUsers();

            // 🔹 Filter recipients by type
            let filteredEmails: string[] = [];
            if (recipientType === "users") {
                filteredEmails = allUsers
                    .filter((u) => u.role === "User")
                    .map((u) => u.email)
                    .filter(Boolean);
            } else if (recipientType === "doctors") {
                filteredEmails = allUsers
                    .filter((u) => u.role === "Soctor")
                    .map((u) => u.email)
                    .filter(Boolean);
            } else {
                // All
                filteredEmails = allUsers.map((u) => u.email).filter(Boolean);
            }

            if (filteredEmails.length === 0) {
                setMessage("⚠️ No recipients found for this category.");
                setIsSending(false);
                return;
            }

            setMessage(`📤 Sending newsletter to ${filteredEmails.length} recipients...`);

            // 🔹 Send to backend
            const response = await fetch("https://us-central1-instant-doctor-a4e4c.cloudfunctions.net/api/mail/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    html: htmlCode,
                    emails: filteredEmails,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("✅ " + data.message);
            } else {
                setMessage("❌ " + data.message);
            }
        } catch (error) {
            console.error("Error sending newsletter:", error);
            setMessage("⚠️ Failed to send newsletter. Try again later.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
            <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl p-6">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    📢 Instant Doctor Newsletter Center
                </h1>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <label className="text-gray-700 font-medium">Send To:</label>
                        <select
                            value={recipientType}
                            onChange={(e) => setRecipientType(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="users">Users</option>
                            <option value="doctors">Doctors</option>
                            <option value="all">All</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsPreview(false)}
                            className={`px-4 py-2 rounded-lg border ${!isPreview
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300"
                                }`}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => setIsPreview(true)}
                            className={`px-4 py-2 rounded-lg border ${isPreview
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-gray-700 border-gray-300"
                                }`}
                        >
                            👁 Preview
                        </button>
                    </div>
                </div>

                {/* Editor / Preview */}
                <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] bg-gray-50 overflow-auto">
                    {!isPreview ? (
                        <textarea
                            className="w-full h-[400px] p-4 border-none focus:ring-0 bg-transparent font-mono text-sm text-gray-800"
                            placeholder="Paste your newsletter HTML code here..."
                            value={htmlCode}
                            onChange={(e) => setHtmlCode(e.target.value)}
                        />
                    ) : (
                        <iframe
                            title="newsletter-preview"
                            srcDoc={htmlCode}
                            className="w-full h-[400px] border-none rounded-md bg-white"
                        />
                    )}
                </div>

                {/* Send Button */}
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-600">{message}</p>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className={`${isSending ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                            } text-white px-6 py-3 rounded-lg font-semibold shadow-md transition`}
                    >
                        {isSending ? "⏳ Sending..." : "🚀 Send Newsletter"}
                    </button>
                </div>
            </div>
        </div>
    );
}
