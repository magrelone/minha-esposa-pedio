import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

// 1. Logo Pedi para meu marido 💕
export const AppBrandIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ec4899" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#ec4899" floodOpacity="0.5" />
      </filter>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#brand-grad)" />
    <path
      d="M16 23.5L14.55 22.18C9.4 17.5 6 14.42 6 10.62C6 7.54 8.42 5.12 11.5 5.12C13.24 5.12 14.91 5.93 16 7.21C17.09 5.93 18.76 5.12 20.5 5.12C23.58 5.12 26 7.54 26 10.62C26 14.42 22.6 17.5 17.45 22.18L16 23.5Z"
      fill="white"
      filter="url(#glow)"
    />
  </svg>
);

// 2. Microsoft Edge Oficial Fluent
export const EdgeIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <path
      d="M42.75 32.5C41.6 39.2 35.8 44 28.5 44C17.7 44 9 35.3 9 24.5C9 14.8 16.1 6.8 25.4 5.3C23.6 7.6 22.5 10.5 22.5 13.7C22.5 21.2 28.5 27.2 36 27.2C38.6 27.2 41 26.5 43 25.2C43 27.7 42.9 30.1 42.75 32.5Z"
      fill="url(#edge-a)"
    />
    <path
      d="M25.4 5.3C35.2 6.9 42.7 15.3 42.7 25.5C42.7 25.9 42.7 26.3 42.6 26.7C40.6 27.9 38.3 28.6 35.8 28.6C27.5 28.6 20.8 21.9 20.8 13.7C20.8 10.4 21.9 7.4 23.8 5.1C24.3 5.1 24.8 5.2 25.4 5.3Z"
      fill="url(#edge-b)"
    />
    <path
      d="M4.5 24C4.5 34.8 13.2 43.5 24 43.5C29.6 43.5 34.6 41.2 38.2 37.4C34.4 39.5 29.8 40.5 25 39.5C16.2 37.7 9.8 29.5 10.7 20.5C11.1 16.8 12.8 13.5 15.3 11C8.7 14.2 4.5 20.8 4.5 24Z"
      fill="url(#edge-c)"
    />
    <defs>
      <linearGradient id="edge-a" x1="42.7" y1="25.2" x2="16.5" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0C84FF" />
        <stop offset="1" stopColor="#00186B" />
      </linearGradient>
      <linearGradient id="edge-b" x1="22" y1="5" x2="38" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#36D1DC" />
        <stop offset="1" stopColor="#5B86E5" />
      </linearGradient>
      <linearGradient id="edge-c" x1="5" y1="15" x2="35" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#11998E" />
        <stop offset="1" stopColor="#38EF7D" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Visual Studio Code Oficial
export const VSCodeIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
    <path
      d="M178.6 250.7c6.1 3 13.5 2.1 18.7-2.3l52-44.5c5.3-4.5 7.9-11.4 6.7-18.3V70.4c1.2-6.9-1.4-13.8-6.7-18.3l-52-44.5c-5.2-4.4-12.6-5.3-18.7-2.3-6.1 3-9.9 9.3-9.9 16.1v213.2c0 6.8 3.8 13.1 9.9 16.1z"
      fill="#0065A9"
    />
    <path
      d="M197.3 248.4c-5.2 4.4-12.6 5.3-18.7 2.3-6.1-3-9.9-9.3-9.9-16.1V21.4c0-6.8 3.8-13.1 9.9-16.1 6.1-3 13.5-2.1 18.7 2.3l49.3 42.2c.9.8 1.8 1.7 2.6 2.7L67.1 199.1l-50.5-39c-6-4.6-7.1-13.3-2.5-19.3.8-1 1.8-1.9 2.8-2.6l151.8-117.4V21.4L16.8 138.2c-10.4 8.1-12.2 23.1-4.2 33.5 1.2 1.6 2.6 3 4.2 4.2l59.8 46.2c6.1 4.7 14.5 5.5 21.4 2l101.9-88.7 49.2 42c.8.9 1.5 1.9 2.1 3l-53.2 48z"
      fill="#007ACC"
    />
    <path
      d="M178.6 5.3c6.1-3 13.5-2.1 18.7 2.3l52 44.5c5.3 4.5 7.9 11.4 6.7 18.3L197.3 7.6c-5.2-4.4-12.6-5.3-18.7-2.3z"
      fill="#1F9CF0"
    />
  </svg>
);

// 4. Roblox Player Oficial
export const RobloxIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="6" fill="#111827" />
    <path
      d="M6.3 3.6L20.4 7.4L17.7 21.5L3.6 17.7L6.3 3.6Z"
      fill="#E11D48"
    />
    <path
      d="M10.2 10.7L13.8 11.7L12.8 15.3L9.2 14.3L10.2 10.7Z"
      fill="#FFFFFF"
    />
  </svg>
);

// 5. Discord Oficial
export const DiscordIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="6" fill="#5865F2" />
    <path
      d="M18.8 6.4C17.5 5.8 16.1 5.4 14.7 5.2C14.5 5.5 14.3 6 14.2 6.3C12.7 6.1 11.2 6.1 9.8 6.3C9.6 6 9.4 5.5 9.2 5.2C7.8 5.4 6.4 5.8 5.2 6.4C2.7 10.2 2 13.9 2.3 17.5C4 18.7 5.6 19.5 7.2 20C7.6 19.5 7.9 18.9 8.2 18.3C7.6 18.1 7.1 17.8 6.6 17.5C6.7 17.4 6.9 17.3 7 17.2C10.2 18.7 13.8 18.7 17 17.2C17.1 17.3 17.3 17.4 17.4 17.5C16.9 17.8 16.4 18.1 15.8 18.3C16.1 18.9 16.4 19.5 16.8 20C18.4 19.5 20 18.7 21.7 17.5C22.1 13.3 20.9 9.6 18.8 6.4ZM8.5 15.3C7.5 15.3 6.7 14.4 6.7 13.3C6.7 12.2 7.5 11.3 8.5 11.3C9.5 11.3 10.3 12.2 10.3 13.3C10.3 14.4 9.5 15.3 8.5 15.3ZM15.5 15.3C14.5 15.3 13.7 14.4 13.7 13.3C13.7 12.2 14.5 11.3 15.5 11.3C16.5 11.3 17.3 12.2 17.3 13.3C17.3 14.4 16.5 15.3 15.5 15.3Z"
      fill="white"
    />
  </svg>
);

// 6. WhatsApp Oficial
export const WhatsAppIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill="#25D366" />
    <path
      d="M17.5 14.6C17.2 14.4 15.8 13.7 15.5 13.6C15.2 13.5 15.1 13.5 14.9 13.7C14.7 14 14.2 14.6 14 14.8C13.9 14.9 13.7 15 13.5 14.9C13.2 14.7 12.4 14.4 11.4 13.5C10.6 12.8 10.1 12 9.9 11.7C9.8 11.5 9.9 11.3 10 11.2C10.1 11.1 10.3 10.9 10.4 10.7C10.5 10.6 10.5 10.4 10.6 10.3C10.7 10.1 10.6 10 10.5 9.8C10.4 9.6 9.9 8.3 9.7 7.7C9.5 7.2 9.2 7.3 9.1 7.3H8.6C8.4 7.3 8.1 7.4 7.9 7.6C7.6 7.9 7 8.5 7 9.8C7 11 7.9 12.2 8 12.4C8.2 12.6 9.8 15.1 12.3 16.1C14.3 16.9 14.7 16.8 15.2 16.7C15.8 16.6 17 15.9 17.2 15.3C17.5 14.7 17.5 14.1 17.5 14.6Z"
      fill="white"
    />
  </svg>
);

// 7. Bloco de Notas (Notepad Fluent Windows 11)
export const NotepadIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="8" y="6" width="32" height="36" rx="4" fill="#0078D4" />
    <rect x="12" y="10" width="24" height="28" rx="2" fill="#F3F3F3" />
    <line x1="16" y1="16" x2="32" y2="16" stroke="#0078D4" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="22" x2="32" y2="22" stroke="#505050" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="28" x2="28" y2="28" stroke="#505050" strokeWidth="2" strokeLinecap="round" />
    <path d="M26 32L34 24L36 26L28 34L26 34L26 32Z" fill="#005A9E" />
  </svg>
);

// 8. Ferramenta de Captura (Snipping Tool Fluent)
export const SnippingToolIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="24" r="20" fill="url(#snip-grad)" />
    <path
      d="M18 16C16.3 16 15 17.3 15 19C15 20.7 16.3 22 18 22C19.1 22 20.1 21.4 20.6 20.5L25 24L20.6 27.5C20.1 26.6 19.1 26 18 26C16.3 26 15 27.3 15 29C15 30.7 16.3 32 18 32C19.7 32 21 30.7 21 29C21 28.7 20.9 28.3 20.8 28L25.5 24.3L32 29.5V26.5L27 22.5L32 18.5V15.5L25.5 20.7L20.8 17C20.9 16.7 21 16.3 21 16C21 14.3 19.7 13 18 13V16Z"
      fill="white"
    />
    <defs>
      <linearGradient id="snip-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0078D4" />
        <stop offset="1" stopColor="#8A2BE2" />
      </linearGradient>
    </defs>
  </svg>
);

// 9. Calculadora Fluent
export const CalculatorIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="8" y="6" width="32" height="36" rx="6" fill="#0078D4" />
    <rect x="12" y="10" width="24" height="8" rx="2" fill="#E1DFDD" />
    <circle cx="16" cy="24" r="2.5" fill="white" />
    <circle cx="24" cy="24" r="2.5" fill="white" />
    <circle cx="32" cy="24" r="2.5" fill="#50E6FF" />
    <circle cx="16" cy="32" r="2.5" fill="white" />
    <circle cx="24" cy="32" r="2.5" fill="white" />
    <rect x="30" y="29.5" width="5" height="5" rx="1.5" fill="#FFB900" />
  </svg>
);

// 10. Explorador de Arquivos (Windows 11 Explorer)
export const ExplorerIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <path
      d="M6 14C6 11.8 7.8 10 10 10H19.5C20.6 10 21.6 10.4 22.3 11.2L24.8 13.7C25.5 14.5 26.5 14.9 27.6 14.9H38C40.2 14.9 42 16.7 42 18.9V34C42 36.2 40.2 38 38 38H10C7.8 38 6 36.2 6 34V14Z"
      fill="#0078D4"
    />
    <path
      d="M6 19C6 16.8 7.8 15 10 15H38C40.2 15 42 16.8 42 19V34C42 36.2 40.2 38 38 38H10C7.8 38 6 36.2 6 34V19Z"
      fill="#FFB900"
    />
    <rect x="10" y="22" width="28" height="12" rx="2" fill="#FF8C00" opacity="0.3" />
  </svg>
);

// 11. Configurações (Windows 11 Settings)
export const SettingsIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="24" r="20" fill="#0078D4" />
    <path
      d="M34.8 21.7L32.6 20.4C32.4 19.6 32.1 18.8 31.7 18.1L32.6 15.8C32.9 15 32.6 14 31.8 13.5L29.5 12.2C28.7 11.7 27.7 12 27.2 12.8L26.1 14.9C25.4 14.7 24.7 14.6 24 14.6C23.3 14.6 22.6 14.7 21.9 14.9L20.8 12.8C20.3 12 19.3 11.7 18.5 12.2L16.2 13.5C15.4 14 15.1 15 15.4 15.8L16.3 18.1C15.9 18.8 15.6 19.6 15.4 20.4L13.2 21.7C12.4 22.2 12 23.2 12.3 24.1L13.1 26.6C13.4 27.4 14.3 27.9 15.2 27.7L17.4 27.1C17.9 27.7 18.5 28.3 19.1 28.7L18.8 31.1C18.7 32 19.3 32.8 20.2 33.1L22.7 33.9C23.6 34.2 24.5 33.8 24.8 33L25.8 30.8C26.5 30.7 27.2 30.5 27.9 30.2L29.9 31.6C30.6 32.1 31.6 32 32.2 31.3L33.9 29.3C34.5 28.6 34.4 27.6 33.8 27L32 25.4C32.1 24.6 32.1 23.8 32 23L34.3 21.8C35.1 21.4 35.4 20.4 34.8 21.7ZM24 28C21.8 28 20 26.2 20 24C20 21.8 21.8 20 24 20C26.2 20 28 21.8 28 24C28 26.2 26.2 28 24 28Z"
      fill="white"
    />
  </svg>
);

// 12. Microsoft Store Oficial
export const MicrosoftStoreIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="8" y="14" width="32" height="26" rx="4" fill="#0078D4" />
    <path
      d="M18 14V11C18 7.7 20.7 5 24 5C27.3 5 30 7.7 30 11V14"
      stroke="#0078D4"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <rect x="18" y="21" width="5" height="5" fill="#F25022" />
    <rect x="25" y="21" width="5" height="5" fill="#7FBA00" />
    <rect x="18" y="28" width="5" height="5" fill="#00A4EF" />
    <rect x="25" y="28" width="5" height="5" fill="#FFB900" />
  </svg>
);

// 13. Outlook Oficial
export const OutlookIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="16" y="10" width="26" height="28" rx="3" fill="#0078D4" />
    <path d="M16 14L29 24L42 14" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    <rect x="6" y="14" width="18" height="20" rx="3" fill="#005A9E" />
    <circle cx="15" cy="24" r="5" fill="none" stroke="white" strokeWidth="2" />
  </svg>
);

// 14. Xbox Oficial
export const XboxIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="24" r="20" fill="#107C10" />
    <path
      d="M24 10C16.3 10 10 16.3 10 24C10 26.5 10.7 28.8 11.8 30.8C13.2 27.6 16.3 22.8 22.2 16.2C22.6 15.8 23.3 15.8 23.7 16.2C24.3 16.8 27.3 20.3 29.8 24.6C31.5 27.6 33.7 32 35.8 31.4C37.2 29.3 38 26.8 38 24C38 16.3 31.7 10 24 10Z"
      fill="white"
    />
    <path
      d="M13.2 32.5C15.8 35.8 19.7 38 24 38C28.3 38 32.2 35.8 34.8 32.5C32.1 31.9 29.5 28.4 27.4 24.8L24 20.5L20.6 24.8C18.5 28.4 15.9 31.9 13.2 32.5Z"
      fill="white"
    />
  </svg>
);

// 15. Paint Fluent Oficial
export const PaintIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <path
      d="M24 6C14.1 6 6 14.1 6 24C6 33.9 14.1 42 24 42C26.5 42 28.5 40 28.5 37.5C28.5 36.3 28 35.3 27.3 34.5C26.6 33.7 26.1 32.7 26.1 31.5C26.1 29 28.1 27 30.6 27H35C38.9 27 42 23.9 42 20C42 12.3 33.9 6 24 6Z"
      fill="#F3F3F3"
    />
    <circle cx="14" cy="18" r="3" fill="#E81123" />
    <circle cx="22" cy="13" r="3" fill="#FFB900" />
    <circle cx="31" cy="15" r="3" fill="#0078D4" />
    <circle cx="36" cy="22" r="3" fill="#107C10" />
    <path d="M28 35C28 36.7 29.3 38 31 38C32.7 38 34 36.7 34 35C34 31 31 29 31 29C31 29 28 31 28 35Z" fill="#881798" />
  </svg>
);

// 16. LinkedIn Oficial
export const LinkedInIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="5" fill="#0A66C2" />
    <path
      d="M6.5 9H9V17H6.5V9ZM7.8 5.5C8.6 5.5 9.2 6.1 9.2 6.9C9.2 7.7 8.6 8.3 7.8 8.3C7 8.3 6.4 7.7 6.4 6.9C6.4 6.1 7 5.5 7.8 5.5ZM10.5 9H13V10.1C13.4 9.4 14.3 8.8 15.6 8.8C18.2 8.8 18.7 10.5 18.7 12.7V17H16.2V13.2C16.2 12.3 16.2 11.1 14.9 11.1C13.6 11.1 13.4 12.1 13.4 13.1V17H10.9L10.5 9Z"
      fill="white"
    />
  </svg>
);

// 17. Relógio do Windows 11
export const ClockIcon: React.FC<IconProps> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="24" r="20" fill="#0078D4" />
    <circle cx="24" cy="24" r="16" fill="white" />
    <circle cx="24" cy="24" r="2" fill="#0078D4" />
    <line x1="24" y1="14" x2="24" y2="24" stroke="#0078D4" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="24" y1="24" x2="31" y2="24" stroke="#E81123" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 18. Painel de Controle Clássico
export const ControlPanelIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" fill="#0078D4" />
    <rect x="5" y="6" width="14" height="8" rx="1" fill="#F3F3F3" />
    <line x1="7" y1="10" x2="17" y2="10" stroke="#0078D4" strokeWidth="1.5" />
    <circle cx="10" cy="10" r="2" fill="#FFB900" />
    <path d="M8 21H16M12 17V21" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 19. Este Computador
export const ThisPCIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="3" width="20" height="13" rx="2" fill="#0078D4" />
    <rect x="4" y="5" width="16" height="9" rx="1" fill="#E2E8F0" />
    <path d="M9 20H15M12 16V20" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 20. Pasta Documentos
export const DocumentsFolderIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6C3 4.9 3.9 4 5 4H9.2C9.7 4 10.2 4.2 10.6 4.6L12.4 6.4C12.8 6.8 13.3 7 13.8 7H19C20.1 7 21 7.9 21 9V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V6Z" fill="#FFA000" />
    <path d="M3 9H21V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V9Z" fill="#FFCA28" />
    <rect x="7" y="11" width="10" height="1.5" rx="0.75" fill="#E65100" />
    <rect x="7" y="14" width="7" height="1.5" rx="0.75" fill="#E65100" />
  </svg>
);

// 21. Pasta Imagens
export const PicturesFolderIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="3" fill="#0078D4" />
    <circle cx="8" cy="9" r="2" fill="#FFD700" />
    <path d="M4 17L9 11L14 16L17 13L20 17H4Z" fill="#38EF7D" />
  </svg>
);

// 22. Pasta Músicas
export const MusicFolderIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="3" fill="#E11D48" />
    <path d="M15 8V14.5C15 15.3 14.3 16 13.5 16C12.7 16 12 15.3 12 14.5C12 13.7 12.7 13 13.5 13C13.8 13 14.1 13.1 14.3 13.3V9.5L10 10.5V15.5C10 16.3 9.3 17 8.5 17C7.7 17 7 16.3 7 15.5C7 14.7 7.7 14 8.5 14C8.8 14 9.1 14.1 9.3 14.3V9L15 8Z" fill="white" />
  </svg>
);

// 23. Pasta Downloads
export const DownloadsFolderIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#0EA5E9" />
    <path d="M12 7V14M12 14L9 11M12 14L15 11M7 17H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Dicionário para mapear facilmente pelo nome ou id
export const getOfficialIcon = (name: string, size = 28): React.ReactNode => {
  const lower = name.toLowerCase();
  if (lower.includes("marido") || lower.includes("pedi")) return <AppBrandIcon size={size} />;
  if (lower.includes("edge")) return <EdgeIcon size={size} />;
  if (lower.includes("code") || lower.includes("vs")) return <VSCodeIcon size={size} />;
  if (lower.includes("roblox")) return <RobloxIcon size={size} />;
  if (lower.includes("discord")) return <DiscordIcon size={size} />;
  if (lower.includes("whatsapp")) return <WhatsAppIcon size={size} />;
  if (lower.includes("bloco") || lower.includes("notepad")) return <NotepadIcon size={size} />;
  if (lower.includes("calculadora")) return <CalculatorIcon size={size} />;
  if (lower.includes("captura") || lower.includes("snipping")) return <SnippingToolIcon size={size} />;
  if (lower.includes("explorador") || lower.includes("arquivos") || lower.includes("explorer")) return <ExplorerIcon size={size} />;
  if (lower.includes("configura") || lower.includes("settings")) return <SettingsIcon size={size} />;
  if (lower.includes("store")) return <MicrosoftStoreIcon size={size} />;
  if (lower.includes("outlook")) return <OutlookIcon size={size} />;
  if (lower.includes("xbox")) return <XboxIcon size={size} />;
  if (lower.includes("paint")) return <PaintIcon size={size} />;
  if (lower.includes("linkedin")) return <LinkedInIcon size={size} />;
  if (lower.includes("relógio") || lower.includes("relogio") || lower.includes("clock")) return <ClockIcon size={size} />;
  if (lower.includes("painel") || lower.includes("control")) return <ControlPanelIcon size={size} />;
  if (lower.includes("computador") || lower.includes("pc")) return <ThisPCIcon size={size} />;
  if (lower.includes("documentos")) return <DocumentsFolderIcon size={size} />;
  if (lower.includes("imagens") || lower.includes("fotos")) return <PicturesFolderIcon size={size} />;
  if (lower.includes("músicas") || lower.includes("musicas")) return <MusicFolderIcon size={size} />;
  if (lower.includes("downloads")) return <DownloadsFolderIcon size={size} />;

  return <ExplorerIcon size={size} />;
};
