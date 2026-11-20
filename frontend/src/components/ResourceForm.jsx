import { useState } from "react";
import { X } from "lucide-react";

const initialValues = (fields, record) => Object.fromEntries(fields.map((field) => [
  field.name,
  record?.[field.name] ?? field.defaultValue ?? ""
]));

export default function ResourceForm({ definition, record, lookups, onCancel, onSubmit, saving }) {
  const [values, setValues] = useState(() => initialValues(definition.fields, record));
  const [error, setError] = useState("");
  const isEdit = Boolean(record);
  const selectedCrop = lookups.crops?.find((crop) => crop.id === values.cropId);
  const soldBeforeRecord = (lookups.buyers || [])
    .filter((buyer) => buyer.cropId === values.cropId && buyer.id !== record?.id)
    .reduce((total, buyer) => total + Number(buyer.quantity || 0), 0);
  const availableStock = selectedCrop ? Number(selectedCrop.harvestQty || 0) - soldBeforeRecord : null;

  const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const submit = async (event) => {
    event.preventDefault();
    const invalid = definition.fields.find((field) => {
      const value = values[field.name];
      if ((field.required || (field.requiredOnCreate && !isEdit)) && !value) return true;
      if (field.minLength && value && value.length < field.minLength) return true;
      if (field.pattern && value && !new RegExp(field.pattern).test(value)) return true;
      if (field.type === "number" && value !== "" && field.min !== undefined && Number(value) < field.min) return true;
      if (definition.endpoint === "buyers" && field.name === "quantity" &&
        availableStock !== null && Number(value) > availableStock) return true;
      return false;
    });
    if (definition.endpoint === "crops" && values.plantingDate && values.cuttingDate &&
      values.cuttingDate <= values.plantingDate) {
      setError("Cutting date must be after the planting date");
      return;
    }
    if (invalid) {
      setError(invalid.pattern && values[invalid.name]
        ? `${invalid.label} has an invalid format`
        : definition.endpoint === "buyers" && invalid.name === "quantity" && availableStock !== null
          ? `Only ${availableStock} available in stock`
          : `${invalid.label} is required or invalid`);
      return;
    }
    setError("");
    const payload = { ...values };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") delete payload[key];
    });
    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onCancel();
    }}>
      <section className="modal form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <header className="modal-header">
          <div><p className="eyebrow">{isEdit ? "UPDATE RECORD" : "NEW RECORD"}</p><h2 id="form-title">{isEdit ? "Edit" : "Add"} {definition.singular}</h2></div>
          <button className="icon-button" aria-label="Close dialog" onClick={onCancel} disabled={saving}><X size={19} /></button>
        </header>
        <form onSubmit={submit}>
          <div className="form-grid">
            {definition.fields.map((field) => (
              <label className={`field ${field.type === "textarea" ? "field-wide" : ""}`} key={field.name}>
                <span>{field.label}{field.required || (field.requiredOnCreate && !isEdit) ? <i aria-hidden="true"> *</i> : ""}</span>
                {field.type === "textarea" ? (
                  <textarea rows="3" value={values[field.name] || ""} onChange={(event) => setValue(field.name, event.target.value)} />
                ) : field.type === "select" || field.type === "relation" ? (
                  <select value={values[field.name] || ""} onChange={(event) => setValue(field.name, event.target.value)}>
                    <option value="">{field.optional ? "None" : "Choose…"}</option>
                    {(field.type === "select" ? field.options : lookups[field.resource] || []).map((option) => (
                      <option key={typeof option === "string" ? option : option.id} value={typeof option === "string" ? option : option.id}>
                        {typeof option === "string" ? option : option.name || option.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    value={values[field.name] || ""}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    required={field.required || (field.requiredOnCreate && !isEdit)}
                    onChange={(event) => setValue(field.name, event.target.value)}
                  />
                )}
                {definition.endpoint === "buyers" && field.name === "quantity" && availableStock !== null &&
                  <small className="field-hint">{`Available stock: ${availableStock} kg`}</small>}
              </label>
            ))}
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : `Add ${definition.singular}`}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
