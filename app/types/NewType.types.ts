/**
 * Represents the data for a Mohab component.  This type is designed to be comprehensive and cover various potential data needs.
 */
export interface MohabComponentData {
  /**
   * A unique identifier for the Mohab component instance.  Should be globally unique within the application.
   * @example "mohab-component-123"
   */
  id: string;

  /**
   * The current state of the component.  This could represent loading, success, error, or other states as needed.
   * @example "loading", "success", "error", "idle"
   */
  state: 'loading' | 'success' | 'error' | 'idle';

  /**
   *  An optional error message, displayed when the component is in the 'error' state.
   * @example "Failed to fetch data"
   */
  errorMessage?: string;

  /**
   * The primary data displayed by the component.  The type can be adapted to fit the specific data structure.
   * @example { name: "Example", value: 123 } or [{id:1, name: "Item 1"}, {id:2, name:"Item 2"}] or "Some String data"
   */
  data?: any; // Consider a more specific type here if possible

  /**
   * Configuration options for the component.  Allows customization of the component's behavior and appearance.
   * @example { theme: "dark", showDetails: true }
   */
  config?: MohabComponentConfig;

  /**
   * Callback function executed when the component is successfully loaded.  Allows updating external state or performing other actions.
   * @param data - The data loaded by the component.
   */
  onLoad?: (data: any) => void;

  /**
   * Callback function executed when an error occurs.  Allows handling error conditions and providing user feedback.
   * @param error - The error object.
   */
  onError?: (error: Error) => void;


}


/**
 * Configuration options for the Mohab component.
 */
export interface MohabComponentConfig {
    /** Theme to be applied to the component.*/
    theme?: 'light' | 'dark' | 'system';
    /** Boolean to control the visibility of specific component sections.*/
    showDetails?: boolean;
    /** Any other configuration option specific to the component. */
    [key: string]: any;
}

/**
 * Represents the initial data used to create a new Mohab component.
 */
export interface NewMohabComponent {
    /**  The initial config object for the component, if any.*/
    config?: MohabComponentConfig;
    /** Initial data to be displayed.  This could be undefined initially.*/
    initialData?: any;

}
