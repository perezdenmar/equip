import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import getCroppedImg from '../utils/cropImage';

const ImageCropperModal = ({ src, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setIsSaving(true);
        try {
            const croppedImageBlob = await getCroppedImg(src, croppedAreaPixels);

            // Create a File object from the blob so it's compatible with FormData
            const croppedFile = new File([croppedImageBlob], "profile_photo.jpg", { type: "image/jpeg" });

            onCropComplete(croppedFile);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-md flex flex-col scale-in relative border border-zinc-200 dark:border-zinc-800">

                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Adjust Profile Photo</h3>
                    <button onClick={onCancel} className="text-zinc-500 hover:text-red-500 transition-colors bg-white dark:bg-zinc-800 p-1.5 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative w-full h-[350px] sm:h-[400px] bg-black">
                    <Cropper
                        image={src}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // Square aspect ratio for profile photos
                        cropShape="round" // Circular crop visualization
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-zinc-500 font-medium mb-2">
                            <span>Zoom</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-md transition flex items-center disabled:opacity-70"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                            <Check size={18} className="mr-2" />
                        )}
                        {isSaving ? 'Processing...' : 'Apply Photo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;
