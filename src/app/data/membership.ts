export type MembershipTier = "estandar" | "premium";

export const STANDARD_PLAN = "Plan Estándar";
export const PREMIUM_PLAN = "Plan Premium";

export function getMembershipTier(
  plan: string | null | undefined
): MembershipTier {
  const normalized = (plan ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return normalized.includes("premium")
    ? "premium"
    : "estandar";
}

export function getMembershipPlanLabel(
  plan: string | null | undefined
): string {
  return getMembershipTier(plan) === "premium"
    ? PREMIUM_PLAN
    : STANDARD_PLAN;
}

export function hasPremiumMembership(
  plan: string | null | undefined
): boolean {
  return getMembershipTier(plan) === "premium";
}