/**
 * Display as error message at the bottom of the sidebar
 * @param {string} message what to display in error message 
 * @returns component
 */
let ErrorMessage = ({ message }) => {
  return (
    <div className="error">
      <h3>Error:</h3>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;