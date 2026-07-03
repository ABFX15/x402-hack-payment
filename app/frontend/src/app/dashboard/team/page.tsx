"use client";

/**
 * /dashboard/team - invite controllers, accountants, and viewers.
 *
 * Uses /api/team for CRUD. Each invited member receives an email link
 * (TODO: wire lib/email to send it) that resolves to /onboarding/accept-invite
 * which in turn provisions a Privy account scoped to this merchant's vault.
 *
 * This UI is intentionally minimal - it surfaces the gap so cannabis
 * distributors with multiple staff can at least see who has access. The
 * Squads multisig configured during onboarding remains the on-chain
 * source of truth for signature thresholds.
 */

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

type Role = "admin" | "accountant" | "viewer";

interface TeamMember {
  id: string;
  email: string;
  role: Role;
  status: "invited" | "active" | "revoked";
  invitedAt: string;
  activatedAt?: string;
}

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin (signer)",
  accountant: "Accountant (read-only)",
  viewer: "Viewer (read-only)",
};

export default function TeamPage() {
  const { publicKey } = useActiveWallet();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("accountant");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/team?wallet=${publicKey}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitInvite = async () => {
    if (!publicKey) return;
    setInviteBusy(true);
    setInviteError(null);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed (${res.status})`);
      }
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("accountant");
      await refresh();
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : "Could not send invite");
    } finally {
      setInviteBusy(false);
    }
  };

  const revoke = async (id: string) => {
    if (!publicKey) return;
    if (!confirm("Revoke this seat? They'll lose access immediately.")) return;
    await fetch(`/api/team?wallet=${publicKey}&id=${id}`, {
      method: "DELETE",
    });
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-[#34c759]" />
      </div>
    );
  }

  const active = members.filter((m) => m.status !== "revoked");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#212121] tracking-tight">
            Team
          </h1>
          <p className="mt-1 text-sm text-[#5c5c5c]">
            Invite controllers, accountants, and owners. Signature thresholds
            for settlement live in your Squads multisig.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2ba048] transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite member
        </button>
      </div>

      {active.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-dashed border-[#d3d3d3] bg-white p-12 text-center"
        >
          <Users className="mx-auto mb-3 h-10 w-10 text-[#8a8a8a]" />
          <h3 className="text-base font-semibold text-[#212121]">
            Just you so far
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#5c5c5c]">
            Invite your accountant to view-only or your operations controller to
            co-sign large transfers. They sign in with their own email - no
            shared credentials.
          </p>
          <button
            onClick={() => setInviteOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ba048]"
          >
            <Plus className="h-4 w-4" />
            Send first invite
          </button>
        </motion.div>
      ) : (
        <div className="rounded-xl border border-[#d3d3d3] bg-white overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[#d3d3d3] bg-[#f7f7f7]">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3d3d3]">
              {active.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-sm text-[#212121]">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-[#8a8a8a]" />
                      {m.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#5c5c5c]">
                    {ROLE_LABEL[m.role]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                        m.status === "active"
                          ? "text-[#34c759] bg-[#34c759]/5 border-[#34c759]/20"
                          : "text-[#d29500] bg-[#ffc107]/5 border-[#ffc107]/20"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => revoke(m.id)}
                      aria-label={`Revoke access for ${m.email}`}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#e74c3c] hover:bg-[#e74c3c]/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-[#34c759]/20 bg-[#34c759]/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#34c759]" />
          <div className="text-xs text-[#212121]">
            <p className="font-semibold">Roles map to your Squads multisig</p>
            <p className="mt-1 text-[#5c5c5c]">
              Admins are added as signers; accountants and viewers see balances
              and history but cannot move funds. Increase your settlement
              threshold from 1-of-1 to 2-of-N once you have multiple admins.
            </p>
          </div>
        </div>
      </div>

      {inviteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !inviteBusy && setInviteOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-[#212121]">
              Invite a team member
            </h2>
            <p className="mt-1 text-sm text-[#5c5c5c]">
              They'll receive an email with a link to claim their seat. They
              sign in with their own email.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#5c5c5c]">
                  Email address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ops@yourdistro.com"
                  disabled={inviteBusy}
                  className="w-full rounded-xl border border-[#d3d3d3] bg-white px-4 py-3 text-sm text-[#212121] outline-none focus:border-[#34c759] focus:ring-2 focus:ring-[#34c759]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#5c5c5c]">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  disabled={inviteBusy}
                  className="w-full rounded-xl border border-[#d3d3d3] bg-white px-4 py-3 text-sm text-[#212121] outline-none focus:border-[#34c759]"
                >
                  <option value="admin">Admin - co-sign settlement</option>
                  <option value="accountant">
                    Accountant - view ledger + export
                  </option>
                  <option value="viewer">Viewer - read-only dashboard</option>
                </select>
              </div>

              {inviteError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {inviteError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setInviteOpen(false)}
                disabled={inviteBusy}
                className="rounded-lg border border-[#d3d3d3] bg-white px-4 py-2 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2]"
              >
                Cancel
              </button>
              <button
                onClick={submitInvite}
                disabled={inviteBusy || inviteEmail.trim().length < 3}
                className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ba048] disabled:opacity-50"
              >
                {inviteBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
