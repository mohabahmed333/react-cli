
import DetailRow from "./DetailRow";

const LastUpdateDisplay = () => {
  const formattedDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  return (
    <DetailRow 
      label="Last Update" 
      value={`${formattedDate}, ${formattedTime}`}
      className="border-b-0" 
    />
  );
};

export default LastUpdateDisplay;
