 /**
 * A reusable dropdown component.
 *
 * @param {DDQProps} props - The component's props.
 * @returns {JSX.Element} The rendered dropdown component.
 */
const DDQ: React.FC<DDQProps> = ({ label, options, onChange, value }) => {
  /**
   * Handles the change event of the dropdown.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event.
   */
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="ddq-container">
      <label htmlFor={label} className="ddq-label">
        {label}
      </label>
      <select
        id={label}
        value={value}
        onChange={handleChange}
        className="ddq-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Interface for the props of the DDQ component.
 */
interface DDQProps {
  /** The label of the dropdown. */
  label: string;
  /** The options of the dropdown. */
  options: { label: string; value: string }[];
  /** The callback function to handle changes in the dropdown. */
  onChange: (value: string) => void;
  /** The currently selected value of the dropdown. */
  value: string;
}

export default DDQ;

```
