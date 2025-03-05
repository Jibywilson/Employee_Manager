import { useState, useEffect } from "react";

const FileList = ({ username, certificateType, document_name }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const token = localStorage.getItem("authToken");

        if (!username && storedUsername) {
            username = storedUsername; // Use stored username if not passed
        }

        if (!username || !certificateType || !document_name) {
            console.warn("Missing parameters:", { username, certificateType, document_name });
            return;
        }

        const fetchFiles = async () => {
            try {
                const url = `http://127.0.0.1:8000/list_uploaded_files_view?name=${username}&certificate_type=${certificateType}&document_name=${document_name}`;
                console.log("API Request:", url);

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Attach token for authentication
                    },
                });

                const data = await response.json();
                console.log("API Response:", data);

                if (response.ok) {
                    setFiles(data.files || []);
                } else {
                    setError(data.error || "Failed to load files.");
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Error fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [username, certificateType, document_name]);

    if (loading) return <p>Loading files...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            <h2 className="text-lg font-bold mb-4">Uploaded Files</h2>
            {files.length === 0 ? (
                <p>No files found.</p>
            ) : (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">File Name</th>
                            <th className="border p-2">Size (KB)</th>
                            <th className="border p-2">Last Modified</th>
                            <th className="border p-2">Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => (
                            <tr key={index} className="text-center border-b">
                                <td className="border p-2">{file.file_name}</td>
                                <td className="border p-2">{(file.size / 1024).toFixed(2)}</td>
                                <td className="border p-2">{new Date(file.last_modified).toLocaleString()}</td>
                                <td className="border p-2">
                                    <a
                                        href={`https://${process.env.REACT_APP_AWS_S3_BUCKET}.s3.${process.env.REACT_APP_AWS_S3_REGION}.amazonaws.com/${file.file_key}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Download
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FileList;
