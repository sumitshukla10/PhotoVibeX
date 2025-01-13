import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Upload, Trash2, Edit } from 'lucide-react';
import { db } from '../lib/firebase';
import { Image } from '../types';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imageData: Image[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        imageData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Image);
      });
      setImages(imageData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append('file', selectedFile);
      // Using unsigned upload preset
      formData.append('upload_preset', 'ml_default');
      
      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
      }

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryData.secure_url) {
        throw new Error('No secure URL received from Cloudinary');
      }

      // Prepare data for Firestore
      const imageData = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        url: cloudinaryData.secure_url,
        cloudinaryId: cloudinaryData.public_id,
        createdAt: Timestamp.now(),
        likes: 0
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'images'), imageData);

      if (!docRef.id) {
        throw new Error('Failed to save to Firestore');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setSelectedFile(null);
      if (e.target instanceof HTMLFormElement) {
        e.target.reset();
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await deleteDoc(doc(db, 'images', imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <Upload className="animate-spin h-5 w-5 mr-2" />
                Uploading...
              </span>
            ) : (
              'Upload Image'
            )}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Images</h2>
        
        <div className="space-y-4">
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-20 h-20 object-cover rounded-md"
              />
              
              <div className="flex-1">
                <h3 className="font-medium">{image.title}</h3>
                <p className="text-sm text-gray-600 truncate">{image.description}</p>
                <p className="text-sm text-gray-500">
                ${image.price} • {formatDistanceToNow(image.createdAt, { addSuffix: true })}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;