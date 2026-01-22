import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import logo from "@/assets/logo_san_fernando.png";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir a donde intentaba ir o al home
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 6) {
      newErrors.password = "Debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      setLoading(true);
      const response = await login(form);

      if (response.success) {
        navigate("/", { replace: true });
      } else {
        setErrors({ general: "Credenciales incorrectas" });
      }
    } catch {
      setErrors({ general: "Error inesperado, intente más tarde" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-soft p-8 sm:p-10">
      {/* Theme */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <img src={logo} alt="Logo" className="h-14 mb-3" />
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Iniciar sesión
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Accede con tus credenciales
        </p>
      </div>

      {/* Error general */}
      {errors.general && (
        <div className="mb-4 rounded-lg bg-danger-soft text-danger text-sm px-4 py-2">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="email"
              type="email"
              className=""
              placeholder="admin@correo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-danger font-medium">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-danger font-medium">{errors.password}</p>
          )}
        </div>

        {/* Button */}
        <Button type="submit" loading={loading} className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
