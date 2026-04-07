import { motion } from "framer-motion";
import { ReactNode } from "react";
import { staggerItemVariants } from "./StaggerContainer";

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className = "" }: AnimatedListItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
