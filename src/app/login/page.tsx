import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserByEmail, verifyPassword, createToken, setSessionCookie } from "@/lib/auth";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const user = await getUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      redirect("/login?error=invalid");
    }

    const token = await createToken({ id: user.id, email: user.email, name: user.name });
    await setSessionCookie(token);
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo href="/" size="lg" className="justify-center" />
          <p className="mt-2 text-sm text-muted">Sign in to your account</p>
        </div>
        <form action={login} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" required className="input" />
          </div>
          <button type="submit" className="btn-primary w-full">Sign in</button>
          <p className="text-center text-sm text-muted">
            No account?{" "}
            <Link href="/register" className="text-accent hover:underline">Create one free</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
