Customersterface DetailRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const DetailRow = ({ label, value, className = "" }: DetailRowProps) => (
  <div className={`flex h-14 items-center px-6 py-0 w-full  ${className}`}>
    <div className="flex-1 text-base text-muted-foreground">
      {label}
    </div>
    <div className="text-base font-medium text-accent-foreground text-wrap text-start">
      {value}
    </div>
  </div>
);

export default DetailRow;
