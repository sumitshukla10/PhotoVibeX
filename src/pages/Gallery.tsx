import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { db } from '../lib/firebase';
import { Image } from '../types';
import { formatDistanceToNow } from 'date-fns';

const Gallery = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="relative group"
        >
          <Link to={`/image/${image.id}`}>
            <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={image.url}
                alt={image.title}
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-lg font-semibold truncate">{image.title}</h3>
                  <p className="text-sm opacity-90 truncate">{image.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">
                      {formatDistanceToNow(image.createdAt, { addSuffix: true })}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{image.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default Gallery;