import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AiFillHeart } from 'react-icons/ai';
import ArkDevLogo from '../../../assets/logos/arkdev-logo.svg';
import './Footer.css';

const Footer = () => (
  <footer className="ln-footer">
    <div className="ln-footer-glow" />

    <div className="ln-footer-separator" />

    <motion.div
      className="ln-footer-inner"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="ln-footer-top">
        <div className="ln-footer-brand">
          <img src={ArkDevLogo} alt="ArkDev" className="ln-footer-logo" />
          <p className="ln-footer-tagline">
            Animated UI components for React.
          </p>
        </div>

        <nav className="ln-footer-nav">
          <div className="ln-footer-col">
            <span className="ln-footer-col-title">Product</span>
            <Link to="/get-started/introduction" className="ln-footer-link">Docs</Link>
            <Link to="/showcase" className="ln-footer-link">Showcase</Link>
            <a href="https://github.com/arkdev" target="_blank" rel="noopener noreferrer" className="ln-footer-link">
              GitHub
            </a>
          </div>
        </nav>
      </div>

      <div className="ln-footer-bottom">
        <p className="ln-footer-copy">© {new Date().getFullYear()} ArkDev</p>
      </div>
    </motion.div>
  </footer>
);

export default Footer;
