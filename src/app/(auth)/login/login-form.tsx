"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { type LoginInput, loginSchema } from "@/validations/auth";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", rememberMe: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        identifier: values.identifier,
        password: values.password,
        rememberMe: values.rememberMe ? "true" : "false",
        redirect: false,
        redirectTo: callbackUrl,
      });

      if (!result.ok || result.error) {
        setAuthError("Invalid username, email, or password.");
        return;
      }

      router.replace(result.url ?? callbackUrl);
      router.refresh();
    } catch {
      setAuthError("Unable to sign in right now. Please try again.");
    }
  });

  return (
    <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="identifier">
          Username or email
        </label>
        <div className="relative">
          <UserRound
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            {...register("identifier")}
            aria-describedby={errors.identifier ? "identifier-error" : undefined}
            aria-invalid={Boolean(errors.identifier)}
            autoCapitalize="none"
            autoComplete="username"
            className="h-12 w-full rounded-xl border border-input bg-white pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15"
            id="identifier"
            placeholder="admin or name@example.com"
            type="text"
          />
        </div>
        {errors.identifier && (
          <p className="mt-1.5 text-sm text-destructive" id="identifier-error">
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            {...register("password")}
            aria-describedby={errors.password ? "password-error" : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-input bg-white pl-11 pr-12 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15"
            id="password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-sm text-destructive" id="password-error">
            {errors.password.message}
          </p>
        )}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
        <input
          {...register("rememberMe")}
          className="size-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          type="checkbox"
        />
        Remember me for 30 days
      </label>

      {authError && (
        <div
          aria-live="polite"
          className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          role="alert"
        >
          {authError}
        </div>
      )}

      <Button className="h-12 w-full rounded-xl text-base font-bold shadow-sm" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" />
            Signing in…
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
}
