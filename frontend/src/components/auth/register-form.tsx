import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
};

function validateUsername(v: string): string | null {
  if (!v.trim()) return "Username is required";
  if (v.length < 3) return "Username must be at least 3 characters";
  if (/\s/.test(v)) return "Username cannot contain spaces";
  if (!/^[a-zA-Z0-9_]+$/.test(v)) return "Only letters, numbers, and underscores";
  return null;
}

function validateEmail(v: string): string | null {
  if (!v) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
  return null;
}

function validatePassword(v: string): string | null {
  if (!v) return "Password is required";
  if (v.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter";
  if (!/[0-9]/.test(v)) return "Include at least one number";
  return null;
}

export function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = field === "username" ? validateUsername(value) : field === "email" ? validateEmail(value) : field === "password" ? validatePassword(value) : null;
      setErrors((prev) => ({ ...prev, [field]: err ?? undefined }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = form[field as keyof typeof form];
    const err = field === "username" ? validateUsername(value) : field === "email" ? validateEmail(value) : field === "password" ? validatePassword(value) : null;
    setErrors((prev) => ({ ...prev, [field]: err ?? undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    const u = validateUsername(form.username);
    const e = validateEmail(form.email);
    const p = validatePassword(form.password);
    if (u) newErrors.username = u;
    if (e) newErrors.email = e;
    if (p) newErrors.password = p;
    setErrors(newErrors);
    setTouched({ username: true, email: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Welcome aboard.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-first">First name</Label>
          <Input
            id="reg-first"
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-last">Last name</Label>
          <Input
            id="reg-last"
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-username">Username</Label>
        <Input
          id="reg-username"
          placeholder="johndoe"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          onBlur={() => handleBlur("username")}
          aria-invalid={!!errors.username}
          className={errors.username ? "border-destructive focus-visible:ring-destructive/50" : ""}
        />
        {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          aria-invalid={!!errors.email}
          className={errors.email ? "border-destructive focus-visible:ring-destructive/50" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            aria-invalid={!!errors.password}
            className={errors.password ? "border-destructive focus-visible:ring-destructive/50 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
