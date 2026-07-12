import { Link } from 'react-router-dom';
import { LuArrowRight, LuSparkles } from 'react-icons/lu';
import './ProCardMobile.css';

const ProCardMobile = () => {
  return (
    <Link
      to="/pricing"
      className="pro-mobile-bar"
      aria-label="Get ArkDev Pro"
    >
      <span className="pro-mobile-bar-badge">
        <LuSparkles size={11} />
        NEW
      </span>
      <span className="pro-mobile-bar-text">
        <strong>ArkDev Pro</strong>
        <span className="pro-mobile-bar-sub">Components, blocks, templates</span>
      </span>
      <span className="pro-mobile-bar-cta">
        Explore
        <LuArrowRight size={13} />
      </span>
    </Link>
  );
};

export default ProCardMobile;
