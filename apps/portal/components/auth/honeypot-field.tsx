/**
 * Hidden honeypot for auth forms — bots often fill it; server rejects non-empty values.
 */
export function HoneypotField() {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
      aria-hidden
    >
      <label htmlFor="website-field">Leave blank</label>
      <input
        id="website-field"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
