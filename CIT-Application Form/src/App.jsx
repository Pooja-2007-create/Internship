import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.jpg";
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const initialApplication = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  course: "",
  qualifyingExam: "",
  marks: "",
  passingYear: "",
};

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [page, setPage] = useState("login");
  const [loginError, setLoginError] = useState("");
  const [passwordUpdateError, setPasswordUpdateError] = useState("");
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const [application, setApplication] = useState(initialApplication);
  const [submitted, setSubmitted] = useState(false);

  // Verify credentials with the backend before showing the application form.
  async function handleLogin(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setLoginError(
          result.message || "Unable to sign in. Please try again."
        );
        return;
      }

      setLoginError("");
      setPage("admission");
    } catch {
      setLoginError("Unable to reach the login service. Please try again.");
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    setPasswordUpdateError("");
    setPasswordUpdateMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updateEmail,
          oldPassword,
          newPassword,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setPasswordUpdateError(
          result.message || "Unable to update password. Please try again."
        );
        return;
      }

      setPasswordUpdateMessage("Password updated successfully.");
      setUpdateEmail("");
      setOldPassword("");
      setNewPassword("");
    } catch {
      setPasswordUpdateError(
        "Unable to reach the password service. Please try again."
      );
    }
  }

  // HANDLE FORM INPUT
  function handleApplicationChange(event) {
    const { name, value } = event.target;

    setApplication((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // SUBMIT APPLICATION
  function handleApplicationSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  // RETURN TO LOGIN
  function returnToLogin() {
    setPage("login");
    setSubmitted(false);
    setApplication(initialApplication);
  }

  return (
    <main className="app-shell">

      {/* HEADER */}

      <header className="site-header">

        <a
          className="brand"
          href="#home"
          onClick={(event) => event.preventDefault()}
        >

          <img src={logo} alt="" className="brand-logo" />
          <span className="brand-name">
            <span>Chennai Institute</span>
            <span>of Technology</span>
          </span>

        </a>

        <span className="header-note">
          Admissions 2026–27
        </span>

      </header>

      {/* LOGIN PAGE */}

      {page === "login" ? (

        <section className="login-layout">

          <div className="welcome-panel">

            <div className="eyebrow">
              <span /> Learn. Lead. Innovate.
            </div>

            <h1>
              Your future<br />
              starts <em>here.</em>
            </h1>

            <p>
              Take the first step toward an engineering education
              built for the ideas of tomorrow.
            </p>

            <div className="welcome-footer">
              <span className="welcome-line" />
              <span>Chennai Institute of Technology</span>
            </div>

          </div>

          <div className="login-card">

            <div className="card-kicker">
              APPLICANT PORTAL
            </div>

            <h2>Welcome back</h2>

            <p className="card-intro">
              Sign in to begin your admission application.
            </p>

            <form onSubmit={handleLogin}>

              <div className="field">

                <label htmlFor="login-email">
                  Email address
                </label>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />

              </div>

              <div className="field">

                <label htmlFor="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

              </div>

              {loginError && (
                <p className="form-error" role="alert">
                  {loginError}
                </p>
              )}

              <button className="primary-button" type="submit">
                Sign in <span>→</span>
              </button>

            </form>

            <p className="login-help">
              New applicant? Sign in to start your application.
            </p>

            <div className="update-password-box">
              <button
                type="button"
                className="reset-password-toggle"
                onClick={() => setShowPasswordReset((current) => !current)}
              >
                {showPasswordReset ? "Close reset password" : "Reset password"}
              </button>

              {showPasswordReset && (
                <form className="password-update-form" onSubmit={handlePasswordUpdate}>
                  <div className="field">
                    <label htmlFor="update-email">Email address</label>
                    <input
                      id="update-email"
                      type="email"
                      placeholder="you@example.com"
                      value={updateEmail}
                      onChange={(event) => setUpdateEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="old-password">Old password</label>
                    <input
                      id="old-password"
                      type="password"
                      placeholder="Enter your current password"
                      value={oldPassword}
                      onChange={(event) => setOldPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="new-password">New password</label>
                    <input
                      id="new-password"
                      type="password"
                      placeholder="Enter a new password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      minLength="6"
                      required
                    />
                  </div>

                  {passwordUpdateError && (
                    <p className="form-error" role="alert">
                      {passwordUpdateError}
                    </p>
                  )}

                  {passwordUpdateMessage && (
                    <p className="form-success" role="status">
                      {passwordUpdateMessage}
                    </p>
                  )}

                  <button className="secondary-button full-width" type="submit">
                    Update password
                  </button>
                </form>
              )}
            </div>

          </div>

        </section>

      ) : (

        /* ADMISSION PAGE */

        <section className="admission-layout">

          <div className="admission-heading">

            <button
              className="back-link"
              onClick={returnToLogin}
              type="button"
            >
              ← Back to sign in
            </button>

            <div className="eyebrow">
              <span /> ADMISSIONS 2026–27
            </div>

            <h1>
              Undergraduate<br />
              <em>application</em>
            </h1>

            <p>
              Tell us a little about yourself to get your
              application started.
            </p>

          </div>

          <div className="application-card">

            {submitted ? (

              /* SUCCESS MESSAGE */

              <div className="success-panel" role="status">

                <span className="success-icon">✓</span>

                <div className="card-kicker">
                  APPLICATION RECEIVED
                </div>

                <h2>
                  Thank you, {application.fullName}.
                </h2>

                <p>
                  Your application details have been recorded.
                  The Chennai Institute of Technology admissions
                  team will be in touch.
                </p>

                <button
                  className="secondary-button"
                  onClick={returnToLogin}
                  type="button"
                >
                  Return to sign in
                </button>

              </div>

            ) : (

              <>

                <div className="form-heading">

                  <div>

                    <div className="card-kicker">
                      CHENNAI INSTITUTE OF TECHNOLOGY
                    </div>

                    <h2>Applicant details</h2>

                  </div>

                  <span className="step-badge">
                    01 <span>/ 02</span>
                  </span>

                </div>

                <p className="card-intro">
                  Fields marked with * are required.
                </p>

                <form
                  className="application-form"
                  onSubmit={handleApplicationSubmit}
                >

                  {/* FULL NAME */}

                  <div className="field full-width">

                    <label htmlFor="fullName">
                      Full name <span>*</span>
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="As it appears on your records"
                      value={application.fullName}
                      onChange={handleApplicationChange}
                      autoComplete="name"
                      required
                    />

                  </div>

                  {/* DATE OF BIRTH */}

                  <div className="field">

                    <label htmlFor="dateOfBirth">
                      Date of birth <span>*</span>
                    </label>

                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={application.dateOfBirth}
                      onChange={handleApplicationChange}
                      required
                    />

                  </div>

                  {/* GENDER */}

                  <div className="field">

                    <label htmlFor="gender">
                      Gender <span>*</span>
                    </label>

                    <select
                      id="gender"
                      name="gender"
                      value={application.gender}
                      onChange={handleApplicationChange}
                      required
                    >

                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="nonbinary">Non-binary</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>

                    </select>

                  </div>

                  {/* PHONE NUMBER */}

                  <div className="field">

                    <label htmlFor="phone">
                      Mobile number <span>*</span>
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      pattern="[0-9+\s()-]{8,15}"
                      value={application.phone}
                      onChange={handleApplicationChange}
                      autoComplete="tel"
                      required
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="field">

                    <label htmlFor="applicant-email">
                      Email address <span>*</span>
                    </label>

                    <input
                      id="applicant-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={application.email}
                      onChange={handleApplicationChange}
                      autoComplete="email"
                      required
                    />

                  </div>

                  {/* ADDRESS */}

                  <div className="field full-width">

                    <label htmlFor="address">
                      Residential address <span>*</span>
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      placeholder="Street, city, state and PIN code"
                      rows="3"
                      value={application.address}
                      onChange={handleApplicationChange}
                      autoComplete="street-address"
                      required
                    />

                  </div>

                  {/* COURSE */}

                  <div className="field">

                    <label htmlFor="course">
                      Preferred programme <span>*</span>
                    </label>

                    <select
                      id="course"
                      name="course"
                      value={application.course}
                      onChange={handleApplicationChange}
                      required
                    >

                      <option value="">Select a programme</option>

                      <option value="computer-science">
                        B.E. Computer Science and Engineering
                      </option>

                      <option value="electronics">
                        B.E. Electronics and Communication Engineering
                      </option>

                      <option value="electrical">
                        B.E. Electrical and Electronics Engineering
                      </option>

                      <option value="mechanical">
                        B.E. Mechanical Engineering
                      </option>

                      <option value="artificial-intelligence">
                        B.Tech. Artificial Intelligence and Data Science
                      </option>

                      <option value="information-technology">
                        B.Tech. Information Technology
                      </option>

                    </select>

                  </div>

                  {/* QUALIFYING EXAM */}

                  <div className="field">

                    <label htmlFor="qualifyingExam">
                      Qualifying exam <span>*</span>
                    </label>

                    <select
                      id="qualifyingExam"
                      name="qualifyingExam"
                      value={application.qualifyingExam}
                      onChange={handleApplicationChange}
                      required
                    >

                      <option value="">Select exam</option>
                      <option value="class-12">Class 12 / HSC</option>
                      <option value="equivalent">
                        Equivalent examination
                      </option>

                    </select>

                  </div>

                  {/* MARKS */}

                  <div className="field">

                    <label htmlFor="marks">
                      Aggregate marks (%) <span>*</span>
                    </label>

                    <input
                      id="marks"
                      name="marks"
                      type="number"
                      placeholder="e.g. 92.5"
                      min="0"
                      max="100"
                      step="0.01"
                      value={application.marks}
                      onChange={handleApplicationChange}
                      required
                    />

                  </div>

                  {/* PASSING YEAR */}

                  <div className="field">

                    <label htmlFor="passingYear">
                      Year of passing <span>*</span>
                    </label>

                    <select
                      id="passingYear"
                      name="passingYear"
                      value={application.passingYear}
                      onChange={handleApplicationChange}
                      required
                    >

                      <option value="">Select year</option>

                      {Array.from(
                        { length: 6 },
                        (_, index) => 2026 - index
                      ).map((year) => (

                        <option key={year} value={year}>
                          {year}
                        </option>

                      ))}

                    </select>

                  </div>

                  {/* SUBMIT BUTTON */}

                  <button
                    className="primary-button full-width"
                    type="submit"
                  >
                    Submit application <span>→</span>
                  </button>

                  <p className="privacy-note full-width">
                    Your information is used only for the admissions process.
                  </p>

                </form>

              </>

            )}

          </div>

        </section>

      )}

      {/* FOOTER */}

      <footer className="site-footer">

        <span>
          © 2026 Chennai Institute of Technology
        </span>

        <span>
          Knowledge • Innovation • Excellence
        </span>

      </footer>

    </main>
  );
}

export default App;