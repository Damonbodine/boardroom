import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-primary">Board<span className="text-accent">Room</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Nonprofit Board Governance Portal</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
