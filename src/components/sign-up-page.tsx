import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-primary">Board<span className="text-accent">Room</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Create your account</p>
        </div>
        <SignUp fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}