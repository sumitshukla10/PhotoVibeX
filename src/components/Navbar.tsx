// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Camera, LogIn, LogOut, Settings, Sun, Moon, Image as ImageIcon } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import { auth } from '../lib/firebase';

// const Navbar = () => {
//   const { user } = useAuth();
//   const { isDark, toggleTheme } = useTheme();

//   const handleLogout = async () => {
//     try {
//       await auth.signOut();
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   return (
//     <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           <Link to="/" className="flex items-center space-x-2">
//             <div className="relative w-8 h-8">
//               <Camera className="absolute text-indigo-600 dark:text-indigo-400 w-8 h-8" />
//               <ImageIcon className="absolute text-indigo-400 dark:text-indigo-600 w-8 h-8 opacity-50 transform translate-x-1 translate-y-1" />
//             </div>
//             <span className="text-xl font-bold text-gray-900 dark:text-white">PhotoVibeX</span>
//           </Link>
          
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={toggleTheme}
//               className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//               aria-label="Toggle theme"
//             >
//               {isDark ? (
//                 <Sun className="h-5 w-5" />
//               ) : (
//                 <Moon className="h-5 w-5" />
//               )}
//             </button>

//             {user ? (
//               <>
//                 <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
//                 {user.isAdmin && (
//                   <Link
//                     to="/admin"
//                     className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//                   >
//                     <Settings className="h-5 w-5" />
//                   </Link>
//                 )}
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//                 >
//                   <LogOut className="h-5 w-5" />
//                   <span>Logout</span>
//                 </button>
//               </>
//             ) : (
//               <Link
//                 to="/login"
//                 className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//               >
//                 <LogIn className="h-5 w-5" />
//                 <span>Login</span>
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, Settings, Sun, Moon, Camera as CameraIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../lib/firebase';
import { motion } from 'framer-motion';  // Importing framer-motion

const Navbar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              {/* Adding framer-motion to CameraIcon for animation */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}  // Rotate and scale when hovered
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <CameraIcon className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
              </motion.div>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">PhotoVibeX</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {user ? (
              <>
                <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
