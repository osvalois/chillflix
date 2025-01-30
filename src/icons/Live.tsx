

const Live = ({ 
  size = 24, 
  color = "currentColor", 
  strokeWidth = 2,
  className = "" 
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Círculo exterior que pulsa */}
    <circle cx="12" cy="12" r="10" />
    
    {/* Punto central que indica "en vivo" */}
    <circle cx="12" cy="12" r="3" fill={color} />
    
    {/* Líneas de ondas que indican transmisión */}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" />
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6" />
  </svg>
);

export default Live;