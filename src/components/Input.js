import styles from "./Input.module.css";

export default function Input({
  label,
  id,
  type = "text",
  error,
  textarea = false,
  select = false,
  options = [],
  className = "",
  ...props
}) {
  const inputClass = [
    textarea ? styles.textarea : select ? styles.select : styles.input,
    error ? styles.inputError : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {textarea ? (
          <textarea id={id} className={inputClass} {...props} />
        ) : select ? (
          <select id={id} className={inputClass} {...props}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input id={id} type={type} className={inputClass} {...props} />
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
