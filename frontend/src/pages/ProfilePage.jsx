import { useState } from "react";
import { apiClient } from "../app/redux/api/axiosSetup";
import { APP_SETTINGS } from "../config";
import { useSelector } from "react-redux";
import { useToast } from "../components/Toast";

export default function ProfilePage() {
  const user = useSelector((state) => state.user.user);
  const notify = useToast();
  const [values, setValues] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (values.newPassword.length < 6) return setError("New password must be at least 6 characters.");
    if (values.newPassword !== values.confirmPassword) return setError("New passwords do not match.");
    setSaving(true);
    try {
      const { data } = await apiClient.put(APP_SETTINGS.API_PATH.USER.changePassword, {
        currentPassword: values.currentPassword, newPassword: values.newPassword
      });
      notify(data.message || "Password changed successfully");
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to change password";
      setError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile & security</h1><p className="page-subtitle">Your personal details and account security settings.</p></div></div>
      <div className="profile-grid">
        <article className="profile-card">
          <div className="profile-avatar">{user?.fullName?.slice(0, 1).toUpperCase()}</div>
          <div><h2>{user?.fullName}</h2><span className={`role-pill role-${user?.role}`}>{user?.role}</span></div>
          <dl><div><dt>Username</dt><dd>{user?.username}</dd></div><div><dt>Email</dt><dd>{user?.email}</dd></div><div><dt>Access level</dt><dd>{user?.role === "admin" ? "Administrator" : "Farm manager"}</dd></div></dl>
        </article>
        <article className="profile-card password-card">
          <div className="card-heading"><div><h2>Change password</h2><p>Choose a password with at least 6 characters.</p></div></div>
          <form onSubmit={submit} className="password-form">
            <label className="field"><span>Current password <i>*</i></span><input type="password" autoComplete="current-password" required value={values.currentPassword} onChange={(event) => setValues({ ...values, currentPassword: event.target.value })} /></label>
            <label className="field"><span>New password <i>*</i></span><input type="password" autoComplete="new-password" required value={values.newPassword} onChange={(event) => setValues({ ...values, newPassword: event.target.value })} /></label>
            <label className="field"><span>Confirm new password <i>*</i></span><input type="password" autoComplete="new-password" required value={values.confirmPassword} onChange={(event) => setValues({ ...values, confirmPassword: event.target.value })} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary" disabled={saving}>{saving ? "Updating…" : "Update password"}</button>
          </form>
        </article>
      </div>
    </section>
  );
}
