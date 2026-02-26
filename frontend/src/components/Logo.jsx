export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#0D9488" />
      <path d="M9 8v16M23 8v16M9 16h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
