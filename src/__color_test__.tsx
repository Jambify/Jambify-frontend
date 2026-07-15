// TEST FILE — will be deleted after guardrail test
// This hardcoded color should be caught by the pre-commit hook
const badComponent = () => (
  <div style={{ color: '#FF0000', backgroundColor: 'rgba(255,0,0,0.5)' }}>
    This should never reach the repo
  </div>
);
export default badComponent;
