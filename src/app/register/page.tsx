import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserByEmail, hashPassword, createToken, setSessionCookie } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { Logo } from "@/components/logo";
import { v4 as uuidv4 } from "uuid";

export default function RegisterPage() {
  async function register(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password || password.length < 6) {
      redirect("/register?error=invalid");
    }

    const existing = await getUserByEmail(email);
    if (existing) redirect("/register?error=exists");

    const id = uuidv4();
    const passwordHash = await hashPassword(password);
    await db.insert(users).values({ id, email: email.toLowerCase(), name, passwordHash });

    const token = await createToken({ id, email: email.toLowerCase(), name });
    await setSessionCookie(token);
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo href="/" size="lg" className="justify-center" />
          <p className="mt-2 text-sm text-muted">Create your free account</p>
        </div>
        <form action={register} className="card space-y-4">
          <div>
            <label className="label">Name</label>
            <input name="name" type="text" required className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" required minLength={6} className="input" placeholder="Min 6 characters" />
          </div>
          <button type="submit" className="btn-primary w-full">Create account</button>
          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
