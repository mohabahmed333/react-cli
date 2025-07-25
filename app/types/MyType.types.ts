/**
 * Represents a versatile data structure with various field types.
 */
interface MyType {
  /**
   * A string value.  Can be empty.
   * @example "Hello, world!"
   * @example ""
   */
  stringValue?: string;

  /**
   * A number value. Can be a whole number or a decimal.
   * @example 123
   * @example 3.14159
   */
  numberValue?: number;

  /**
   * A boolean value.
   * @example true
   * @example false
   */
  booleanValue?: boolean;

  /**
   * An array of numbers. Can be empty.
   * @example [1, 2, 3]
   * @example []
   */
  numberArray?: number[];

  /**
   * An array of strings.  Can be empty.
   * @example ["apple", "banana", "cherry"]
   * @example []
   */
  stringArray?: string[];

  /**
   * A nested object with string and number properties.  Can be null.
   * @example { name: "Example", age: 30 }
   * @example null
   */
  nestedObject?: {
    name?: string;
    age?: number;
  } | null;

  /**
   * A date object. Can be null.
   * @example new Date()
   * @example null
   */
  dateValue?: Date | null;

  /**
   * A union type: can be a string or a number.
   * @example "123"
   * @example 123
   */
  stringOrNumber?: string | number;

  /**
   * An optional enum representing different status types.
   * @example Status.ACTIVE
   */
  status?: Status;
}


/**
 * Enum representing different statuses.
 */
enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
}

