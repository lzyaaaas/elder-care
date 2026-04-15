import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { Button } from "../../components/common/Button";
import { formatDate } from "../../utils/format";

const emptyProfile = {
  firstName: "",
  lastName: "",
  birthday: "",
  gender: "PREFER_NOT_TO_SAY",
  maritalStatus: "PREFER_NOT_TO_SAY",
  phone: "",
  country: "",
  state: "",
  city: "",
  preferredLanguage: "",
};

export function DonorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const result = await apiRequest("/donor-portal/profile", { authMode: "donor" });
        if (!active) return;
        setProfile(result.data);
        setForm({
          firstName: result.data.firstName || "",
          lastName: result.data.lastName || "",
          birthday: result.data.birthday ? new Date(result.data.birthday).toISOString().slice(0, 10) : "",
          gender: result.data.gender || "PREFER_NOT_TO_SAY",
          maritalStatus: result.data.maritalStatus || "PREFER_NOT_TO_SAY",
          phone: result.data.phone || "",
          country: result.data.country || "",
          state: result.data.state || "",
          city: result.data.city || "",
          preferredLanguage: result.data.preferredLanguage || "",
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

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest("/donor-portal/profile", {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          birthday: form.birthday || null,
        }),
        authMode: "donor",
      });
      setProfile(result.data);
      setMessage("Profile updated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">Profile overview</p>
        <h2 className="mt-4 text-2xl font-semibold text-ink-950">{profile ? `${profile.firstName} ${profile.lastName}` : "Loading..."}</h2>
        <div className="mt-6 space-y-3 text-sm text-ink-900/70">
          <p>Email: {profile?.email || "-"}</p>
          <p>Birthday: {formatDate(profile?.birthday)}</p>
          <p>Marital status: {String(profile?.maritalStatus || "PREFER_NOT_TO_SAY").replaceAll("_", " ")}</p>
          <p>Supporter type: {String(profile?.supporterType || "-").replace("_", " ")}</p>
          <p>Account status: {profile?.accountStatus || "-"}</p>
          <p>Joined: {formatDate(profile?.registrationDate)}</p>
          <p>Last login: {formatDate(profile?.lastLoginAt)}</p>
          <p>Source event: {profile?.sourceEvent?.eventName || "No specific event"}</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">Edit profile</p>
        <h2 className="mt-4 text-2xl font-semibold text-ink-950">Keep your details current</h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
              {[
                { key: "firstName", label: "First name" },
                { key: "lastName", label: "Last name" },
                { key: "birthday", label: "Birthday", type: "date" },
                { key: "phone", label: "Phone" },
                { key: "country", label: "Country" },
                { key: "state", label: "State" },
                { key: "city", label: "City" },
              ].map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink-900">{field.label}</span>
                  <input
                    type={field.type || "text"}
                    value={form[field.key]}
                    onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                    className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                  />
                </label>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">Gender</span>
              <select
                value={form.gender}
                onChange={(event) => setForm({ ...form, gender: event.target.value })}
                className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="NON_BINARY">Non-binary</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">Marital status</span>
              <select
                value={form.maritalStatus}
                onChange={(event) => setForm({ ...form, maritalStatus: event.target.value })}
                className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              >
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">Preferred language</span>
              <select
                value={form.preferredLanguage}
                onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value })}
                className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              >
                <option value="">Select language</option>
                <option value="zh-CN">Chinese</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          {message ? <p className="text-sm font-medium text-pine-800">{message}</p> : null}
          {error ? <p className="text-sm font-medium text-terracotta-600">{error}</p> : null}

          <Button type="submit" variant="accent" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </section>
    </div>
  );
}
