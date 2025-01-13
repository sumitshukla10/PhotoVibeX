import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Image, Comment } from '../types';

const ImageDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<Image | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!id) return;
      
      const docRef = doc(db, 'images', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setImage({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt.toDate(),
        } as Image);
      }
      
      setLoading(false);
    };

    const q = query(
      collection(db, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentData: Comment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        commentData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Comment);
      });
      setComments(commentData);
    });

    fetchImage();
    return () => unsubscribe();
  }, [id]);

  const handleLike = async () => {
    if (!user || !image) return;
    
    const imageRef = doc(db, 'images', image.id);
    await updateDoc(imageRef, {
      likes: image.likes + 1,
    });
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !image || !newComment.trim()) return;

    await addDoc(collection(db, 'comments'), {
      imageId: image.id,
      userId: user.id,
      userEmail: user.email,
      content: newComment.trim(),
      createdAt: new Date(),
    });

    setNewComment('');
  };

  // const handleWhatsAppPurchase = () => {
  //   if (!image) return;
    
  //   const message = encodeURIComponent(
  //     `Hi! I'm interested in purchasing the photo "${image.title}" for $${image.price}.`
  //   );
  //   window.open(`https://wa.me/?text=${message}`, '_blank');
  // };

  const handleWhatsAppPurchase = () => {
    if (!image) return;
    
    const message = encodeURIComponent(
      `Hi! I'm interested in purchasing the photo "${image.title}" for $₹{image.price}.`
    );
    
    // Use your custom WhatsApp number in the link
    const phoneNumber = '7678674553';
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Image not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-indigo-600 hover:text-indigo-800"
        >
          Return to gallery
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-[60vh] object-cover"
          />
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{image.title}</h1>
              <button
                onClick={handleWhatsAppPurchase}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Purchase ₹ {image.price}
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">{image.description}</p>
            
            <div className="flex items-center space-x-6 mb-6">
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Heart className="h-5 w-5" />
                <span>{image.likes}</span>
              </button>
              
              <button className="flex items-center space-x-1 text-gray-600">
                <MessageCircle className="h-5 w-5" />
                <span>{comments.length}</span>
              </button>
              
              <button className="flex items-center space-x-1 text-gray-600">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Comments</h2>
              
              {user ? (
                <form onSubmit={handleComment} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Post Comment
                  </button>
                </form>
              ) : (
                <p className="text-gray-600 mb-6">
                  Please <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-800">login</button> to comment
                </p>
              )}

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{comment.userEmail}</span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-600">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageDetails;