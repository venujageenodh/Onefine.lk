/**
 * uploadToCloudinary — direct browser-to-Cloudinary upload
 *
 * Uses an unsigned upload preset so no server round-trip or auth needed.
 * Works from any HTTPS page with no CORS issues.
 *
 * @param {File} file   - The File object from an <input type="file">
 * @returns {Promise<string>} - Resolves to the secure_url of the uploaded image
 */
export async function uploadToCloudinary(file) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error(
            'Missing Cloudinary config. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.'
        );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
    );

    const data = await res.json();

    if (!res.ok) {
        const msg = data?.error?.message || `Upload failed with status ${res.status}`;
        throw new Error(msg);
    }

    return data.secure_url;
}
