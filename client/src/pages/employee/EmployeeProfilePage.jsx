import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { Button } from "../../components/common/Button";
import { updateSessionUser } from "../../utils/auth-storage";
import { formatDate } from "../../utils/format";

const emptyProfileForm = {
  name: "",
  email: "",
  contact: "",
  maritalStatus: "PREFER_NOT_TO_SAY",
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
};

export function EmployeeProfilePage() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const result = await apiRequest("/employee-portal/me", { authMode: "employee" });
        if (!active) return;
        setProfile(result.data);
        setProfileForm({
          name: result.data.name || "",
          email: result.data.email || "",
          contact: result.data.contact || "",
          maritalStatus: result.data.maritalStatus || "PREFER_NOT_TO_SAY",
        });
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setIsSavingProfile(true);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest("/employee-portal/me", {
        method: "PATCH",
        body: JSON.stringify(profileForm),
        authMode: "employee",
      });
      setProfile(result.data);
      updateSessionUser({ name: result.data.name, email: result.data.email });
      setMessage("Profile updated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setIsSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");

    try {
      await apiRequest("/employee-portal/password", {
        method: "PATCH",
        body: JSON.stringify(passwordForm),
        authMode: "employee",
      });
      setPasswordForm(emptyPasswordForm);
      setPasswordMessage("Password updated.");
    } catch (requestError) {
      setPasswordError(requestError.message);
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
          Profile overview
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-ink-950">
          {profile?.name || "Loading..."}
        </h2>
        {error ? <p className="mt-4 text-sm font-medium text-terracotta-600">{error}</p> : null}

        <div className="mt-6 space-y-3 text-sm text-ink-900/70">
          <p>Employee ID: {profile?.employeeCode || "-"}</p>
          <p>Email: {profile?.email || "-"}</p>
          <p>Gender: {profile?.gender || "-"}</p>
          <p>Marital status: {profile?.maritalStatus || "-"}</p>
          <p>Position: {profile?.position || "-"}</p>
          <p>Role: {profile?.role || "-"}</p>
          <p>Status: {profile?.status || "-"}</p>
          <p>Contact: {profile?.contact || "-"}</p>
          <p>Hometown: {profile?.hometown || "-"}</p>
          <p>Joined: {formatDate(profile?.createdAt)}</p>
          <p>Last updated: {formatDate(profile?.updatedAt)}</p>
        </div>
      </section>

      <div className="space-y-8">
        <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
            Edit profile
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-ink-950">
            Update only your personal details
          </h2>

          <form onSubmit={handleProfileSubmit} className="mt-8 space-y-5">
            {[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "contact", label: "Contact" },
            ].map((field) => (
              <label key={field.key} className="block">
                <span className="mb-2 block text-sm font-semibold text-ink-900">
                  {field.label}
                </span>
                <input
                  type={field.key === "email" ? "email" : "text"}
                  value={profileForm[field.key]}
                  onChange={(event) =>
                    setProfileForm({ ...profileForm, [field.key]: event.target.value })
                  }
                  className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                />
              </label>
            ))}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">Marital status</span>
              <select
                value={profileForm.maritalStatus}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, maritalStatus: event.target.value })
                }
                className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              >
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </label>

            {message ? <p className="text-sm font-medium text-pine-800">{message}</p> : null}

            <Button type="submit" variant="accent" disabled={isSavingProfile}>
              {isSavingProfile ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
            Password
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-ink-950">Keep your account secure</h2>

          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">
                Current password
              </span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
                }
                className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">New password</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm({ ...passwordForm, newPassword: event.target.value })
                }
                className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              />
            </label>

            {passwordMessage ? (
              <p className="text-sm font-medium text-pine-800">{passwordMessage}</p>
            ) : null}
            {passwordError ? (
              <p className="text-sm font-medium text-terracotta-600">{passwordError}</p>
            ) : null}

            <Button type="submit" variant="secondary" disabled={isSavingPassword}>
              {isSavingPassword ? "Updating..." : "Update password"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
