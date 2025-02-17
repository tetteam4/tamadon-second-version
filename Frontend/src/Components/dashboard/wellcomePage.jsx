import { motion } from "framer-motion";

const WellcomePage = () => {
  return (
    <div className="h-[92vh] flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-300">
      <motion.div
        initial={{ opacity: 0, y: -70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 h-[250px] w-11/12 md:w-2/3 lg:w-1/2 text-center"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-extrabold text-green drop-shadow-md"
        >
          خوش آمدید!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="mt-4 text-lg md:text-xl text-gray-700 leading-relaxed"
        >
          ما خوشحالیم که شما اینجا هستید. تجربه‌ای عالی برای شما آرزو می‌کنیم.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
          className="mt-6"
        >
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WellcomePage;
