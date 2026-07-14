import { cn } from "@/lib/utils";

// Import logo images
import googleAdsLogo from "@/assets/logos/google-ads.png";
import linkedinLogo from "@/assets/logos/linkedin.png";
import googleDriveLogo from "@/assets/logos/google-drive.png";
import bigQueryLogo from "@/assets/logos/bigquery.png";

interface LogoProps {
  className?: string;
}

// Google Ads
export function GoogleAdsLogo({ className }: LogoProps) {
  return (
    <img 
      src={googleAdsLogo} 
      alt="Google Ads" 
      className={cn("w-8 h-8 object-contain", className)} 
    />
  );
}

// Meta Ads - Logo infinito azul oficial
export function MetaAdsLogo({ className }: LogoProps) {
  return (
    <svg className={cn("w-8 h-8", className)} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M120 256c0-63.547 32.063-123.313 63.188-168.844C214.313 41.313 254.313 8 294.313 8c60 0 84 36 108 72.938C426.313 120 450.313 176 450.313 236c0 44-16 80-48 104s-76 40-116 40c-36 0-68-12-92.313-36C170 320 152 292 140.688 260 128 228 120 256 120 256zm294.313-20c0-48-16-92.063-44-124.063S314.313 68 282.313 68c-28 0-56 16.938-83.188 50.844C172.313 152.75 152 196 144 240c-8 44 0 84 24.688 116 24.688 32 60.688 52 104.625 52 36 0 68-16 89.375-44S414.313 300 414.313 236z" fill="#0081FB"/>
      <path d="M97.687 256c0-44 12-88 32-124s48-68 80-88c-44 0-84 28-112.313 68C69.687 152 53.687 204 53.687 256s16 104 44.313 144c28 40 68 68 112.313 68-32-20-60-52-80-88s-32-80-32-124z" fill="#0081FB"/>
    </svg>
  );
}

// DV360 - Display & Video 360 - Logo play verde oficial
export function DV360Logo({ className }: LogoProps) {
  return (
    <svg className={cn("w-8 h-8", className)} viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 164.31V27.69c0-7.628 8.332-12.287 14.858-8.31l118.284 68.31c6.361 3.674 6.361 12.946 0 16.62L38.858 172.62c-6.526 3.977-14.858-.682-14.858-8.31z" fill="#34A853"/>
      <path d="M24 96V27.69c0-7.628 8.332-12.287 14.858-8.31l59.142 34.155v84.93l-59.142 34.155c-6.526 3.977-14.858-.682-14.858-8.31V96z" fill="#1E8E3E"/>
    </svg>
  );
}

// TikTok Ads - Logo nota musical oficial
export function TikTokAdsLogo({ className }: LogoProps) {
  return (
    <svg className={cn("w-8 h-8", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38.4 10.4c-2.1-1.3-3.6-3.5-4-6-.1-.5-.1-1-.1-1.4h-7.1l-.02 27.9c-.1 3.3-2.8 5.9-6.1 5.9-1.1 0-2.1-.3-3-.8-1.8-1-3.1-2.9-3.1-5.2 0-3.3 2.7-6 6-6 .6 0 1.2.1 1.8.3v-7.3c-.6-.1-1.2-.1-1.8-.1-7.3 0-13.3 5.9-13.3 13.2 0 4.2 2 8 5.1 10.4 2.2 1.7 5 2.8 8 2.8 7.3 0 13.3-5.9 13.3-13.2V17.6c2.8 2 6.1 3.2 9.7 3.2v-7.1c-2 0-3.9-.5-5.5-1.4-.6-.4-1.2-.8-1.8-1.3-.2-.2-.1-.6.1-.6z" fill="currentColor"/>
      <path d="M36.5 8.4c-.1-.5-.1-1-.1-1.4h-3.3c.5 2.3 1.9 4.3 3.8 5.5-.3-1.3-.4-2.7-.4-4.1z" fill="#25F4EE"/>
      <path d="M21.1 24.8c-3.3 0-6 2.7-6 6 0 2.3 1.3 4.2 3.1 5.2.9.5 1.9.8 3 .8 3.3 0 6-2.7 6.1-5.9l.02-27.9h4.9c-.1.5 0 1 .1 1.4h3.2c0 1.4.1 2.8.4 4.1.6.5 1.2.9 1.8 1.3 1.6.9 3.5 1.4 5.5 1.4v3.6c-3.6 0-6.9-1.2-9.7-3.2v13.3c0 7.3-6 13.2-13.3 13.2-3 0-5.8-1-8-2.8 2.2 1.7 5 2.8 8 2.8 7.3 0 13.3-5.9 13.3-13.2v-13.3c2.8 2 6.1 3.2 9.7 3.2v-3.5c-2 0-3.9-.5-5.5-1.4-.6-.4-1.2-.8-1.8-1.3-.2-.2-.1-.6.1-.6h-3.1c-.5-2.3-1.9-4.3-3.8-5.5.5 2.3.4 4.7-.1 6.9V30c.1-3.3-2.7-5.9-6-5.9-.6 0-1.2.1-1.8.3v3.7c.6-.2 1.2-.3 1.8-.3z" fill="#FE2C55"/>
    </svg>
  );
}

// LinkedIn Ads
export function LinkedInAdsLogo({ className }: LogoProps) {
  return (
    <img 
      src={linkedinLogo} 
      alt="LinkedIn Ads" 
      className={cn("w-8 h-8 object-contain", className)} 
    />
  );
}

// Kwai Ads - Logo câmera laranja oficial
export function KwaiAdsLogo({ className }: LogoProps) {
  return (
    <svg className={cn("w-8 h-8", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M16 8c-1.1 0-2 .9-2 2v6h-4c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V18c0-1.1-.9-2-2-2h-4v-6c0-1.1-.9-2-2-2H16zm0 4h16v4H16v-4zm-4 8h24v16H12V20zm8 4a4 4 0 100 8 4 4 0 000-8zm12 0a4 4 0 100 8 4 4 0 000-8z" fill="#FF6719"/>
    </svg>
  );
}

// Spotify Ads
export function SpotifyAdsLogo({ className }: LogoProps) {
  return (
    <svg className={cn("w-8 h-8", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="#1DB954"/>
    </svg>
  );
}

// Amazon DSP
export function AmazonDSPLogo({ className }: LogoProps) {
  return (
    <svg className={cn("w-8 h-8", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.42 31.78c-9.27 5.76-22.72 8.83-34.3 8.83-1.62 0-3.21-.1-4.77-.28-.32-.03-.59.24-.28.53 4.58 4.3 10.59 6.88 17.24 6.88 8.3 0 16.21-3.45 21.78-9.2.49-.51.04-1.2-.67-.76z" fill="#FF9900" transform="translate(10 -2)"/>
      <path d="M31.79 29.33c-.61-.78-4.05-.37-5.6-.19-.47.06-.54-.35-.12-.65 2.74-1.93 7.25-1.37 7.77-.73.53.65-.14 5.15-2.71 7.3-.4.33-.77.15-.6-.28.58-1.44 1.87-4.68 1.26-5.45z" fill="#FF9900" transform="translate(10 -2)"/>
      <path d="M26.27 6.68V4.2c0-.38.29-.63.63-.63h11.18c.36 0 .65.26.65.63v2.11c0 .36-.31.82-.84 1.54l-5.79 8.27c2.15-.05 4.42.27 6.37 1.36.44.25.56.61.59.96v2.64c0 .36-.4.79-.82.57-3.41-1.79-7.94-1.98-11.71.02-.39.21-.8-.21-.8-.58v-2.51c0-.4.01-1.09.41-1.7l6.71-9.63h-5.84c-.36 0-.65-.25-.65-.63z" fill="currentColor" transform="translate(10 -2)"/>
      <path d="M9.63 21.47h-3.4c-.32-.02-.58-.27-.6-.58V4.23c0-.35.29-.63.65-.63h3.17c.33.01.59.28.61.59v2.22h.06c.82-2.16 2.36-3.17 4.43-3.17 2.11 0 3.43 1.01 4.37 3.17.81-2.16 2.66-3.17 4.64-3.17 1.41 0 2.95.58 3.89 1.89 1.07 1.45.85 3.56.85 5.42l-.01 10.29c0 .35-.29.63-.65.63h-3.39c-.34-.02-.61-.3-.61-.63v-8.64c0-.73.07-2.55-.09-3.24-.25-1.16-.99-1.48-1.95-1.48-.8 0-1.64.54-1.98 1.39-.34.86-.31 2.29-.31 3.33v8.64c0 .35-.29.63-.65.63h-3.39c-.34-.02-.61-.3-.61-.63l-.01-8.64c0-1.93.32-4.77-2.04-4.77-2.4 0-2.31 2.77-2.31 4.77v8.64c0 .35-.29.63-.65.63z" fill="currentColor" transform="translate(-3 -2)"/>
    </svg>
  );
}

// Google Drive
export function GoogleDriveLogo({ className }: LogoProps) {
  return (
    <img 
      src={googleDriveLogo} 
      alt="Google Drive" 
      className={cn("w-8 h-8 object-contain", className)} 
    />
  );
}

// BigQuery
export function BigQueryLogo({ className }: LogoProps) {
  return (
    <img 
      src={bigQueryLogo} 
      alt="BigQuery" 
      className={cn("w-8 h-8 object-contain", className)} 
    />
  );
}

// Componente wrapper sem background
export function PlatformLogoWrapper({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn(
      "w-12 h-12 flex items-center justify-center",
      className
    )}>
      {children}
    </div>
  );
}

// Mapeamento de plataformas para logos
export const platformLogos: Record<string, React.FC<LogoProps>> = {
  "Google Ads": GoogleAdsLogo,
  "Meta Ads": MetaAdsLogo,
  "DV360": DV360Logo,
  "TikTok Ads": TikTokAdsLogo,
  "LinkedIn Ads": LinkedInAdsLogo,
  "Kwai Ads": KwaiAdsLogo,
  "Spotify Ads": SpotifyAdsLogo,
  "Amazon DSP": AmazonDSPLogo,
  "Google Drive": GoogleDriveLogo,
  "BigQuery": BigQueryLogo,
};
