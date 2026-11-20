import { useEffect, useState } from "react";
import { ArrowRight, Sprout } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, signIn, signUp } from "../app/redux/userSlice";
import { useToast } from "../components/Toast";

export default function AuthPage({ signup = false }) {
  const [values, setValues] = useState({ fullName: "", username: "", email: "", password: "", confirmPassword: "" });
  const [localError, setLocalError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useToast();
  const { user, loading, error } = useSelector((state) => state.user);
  const nextPath = location.state?.from?.pathname || "/dashboard";

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch, signup]);
  if (user) return <Navigate to="/dashboard" replace />;

  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setLocalError("");
    if (signup) {
      if (!values.fullName || !values.username || !values.email || !values.password) return setLocalError("Please complete all required fields.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return setLocalError("Enter a valid email address.");
      if (values.password.length < 6) return setLocalError("Password must be at least 6 characters.");
      if (values.password !== values.confirmPassword) return setLocalError("Passwords do not match.");
      const result = await dispatch(signUp({
        fullName: values.fullName, username: values.username, email: values.email, password: values.password
      }));
      if (signUp.fulfilled.match(result)) {
        notify(result.payload.message || "Account created. Please sign in.");
        navigate("/session/signin");
      }
      return;
    }
    const result = await dispatch(signIn({ username: values.username, password: values.password }));
    if (signIn.fulfilled.match(result)) navigate(nextPath, { replace: true });
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-brand"><span className="brand-mark"><Sprout size={24} /></span><span>fieldwise</span></div>
        <div className="hero-copy">
          <p className="eyebrow">GROW WITH CONFIDENCE</p>
          <h1>Better days<br />start in the field.</h1>
          <p>One calm, clear place to care for your crops, your people, and the work that keeps your farm growing.</p>
          <div className="hero-proof"><span className="proof-leaf"><Sprout size={17} /></span><span>Thoughtful tools for the people who grow our future.</span></div>
        </div>
        <div className="field-art" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        <span className="hero-caption">PLANT WITH PURPOSE · HARVEST WITH PRIDE</span>
      </section>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><span className="brand-mark"><Sprout size={22} /></span><span>fieldwise</span></div>
        <div className="auth-form-wrap">
          <p className="eyebrow">{signup ? "YOUR FARM, ONE STEP CLOSER" : "WELCOME BACK"}</p>
          <h2>{signup ? "Create your account" : "Good to see you."}</h2>
          <p className="auth-intro">{signup ? "Set up your profile to start managing your farm." : "Sign in to pick up where your farm left off."}</p>
          <form onSubmit={submit} className="auth-form">
            {signup && <label className="field"><span>Full name <i>*</i></span><input name="fullName" autoComplete="name" value={values.fullName} onChange={update} required /></label>}
            <label className="field"><span>{signup ? "Username" : "Username or email"} <i>*</i></span><input name="username" autoComplete="username" value={values.username} onChange={update} required /></label>
            {signup && <label className="field"><span>Email <i>*</i></span><input name="email" type="email" autoComplete="email" value={values.email} onChange={update} required /></label>}
            <label className="field"><span>Password <i>*</i></span><input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} value={values.password} onChange={update} required /></label>
            {signup && <label className="field"><span>Confirm password <i>*</i></span><input name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={update} required /></label>}
            {(localError || error) && <p className="form-error" role="alert">{localError || error}</p>}
            <button className="button button-primary auth-submit" disabled={loading}>{loading ? "Please wait…" : signup ? "Create account" : "Sign in"} <ArrowRight size={17} /></button>
          </form>
          {signup
            ? <p className="auth-switch">Already have an account? <Link to="/session/signin">Sign in</Link></p>
            : <><p className="auth-switch">New to Fieldwise? <Link to="/signup">Create an account</Link></p><div className="demo-hint"><strong>Demo access</strong><span>admin / Admin@123</span><span>manager / Manager@123</span></div></>}
        </div>
        <p className="auth-footer">Fieldwise Agriculture Management <span>·</span> Built for growing things</p>
      </section>
    </main>
  );
}
