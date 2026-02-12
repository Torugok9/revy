import { useAuthContext } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useMemo } from "react";

export function useUserInfo() {
  const { user } = useAuthContext();
  const { plan } = useUserPlan();

  const userInitials = useMemo(() => {
    if (!user?.name) return "U";

    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const displayName = useMemo(() => {
    return user?.name || "Usuário";
  }, [user?.name]);

  const displayEmail = useMemo(() => {
    return user?.email || "email@exemplo.com";
  }, [user?.email]);

  const planName = useMemo(() => {
    return plan?.name || "Free";
  }, [plan?.name]);

  const planIcon = useMemo(() => {
    switch (plan?.name?.toLowerCase()) {
      case "free":
        return "⚡";
      case "pro":
        return "✨";
      case "premium":
        return "👑";
      default:
        return "⚙️";
    }
  }, [plan?.name]);

  const joinDate = useMemo(() => {
    if (!user?.createdAt) return "Data desconhecida";

    const date = new Date(user.createdAt);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
    });
  }, [user?.createdAt]);

  return {
    user,
    plan,
    userInitials,
    displayName,
    displayEmail,
    planName,
    planIcon,
    joinDate,
  };
}
