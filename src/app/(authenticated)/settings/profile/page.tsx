"use client";
import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary">Profile Settings</h1>
      <ProfileForm />
    </div>
  );
}
