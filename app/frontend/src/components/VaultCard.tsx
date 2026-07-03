"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { USDC_MINT, SOLANA_RPC_URL } from "@/lib/constants";
import {
  getVaultInfo,
  buildAddMemberTransactions,
  shortenAddress,
  permissionsLabel,
  type VaultInfo,
} from "@/lib/squads";
import {
  Shield,
  Check,
  Copy,
  Wallet,
  Loader2,
  Banknote,
  Users,
  Plus,
  Lock,
  RefreshCw,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────
const USDC_DECIMALS = 6;
const RPC_ENDPOINT = SOLANA_RPC_URL;

/**
 * Self-contained vault overview card for the dashboard.
 * Shows vault status, signers, balances, and add-signer modal.
 */
export function VaultCard() {
  const { solanaWallet, publicKey, connected, wallet } = useActiveWallet();
  const { signTransaction: walletSignTx } = useWallet();

  const [copied, setCopied] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [vaultBalance, setVaultBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [loadingVault, setLoadingVault] = useState(false);
  const [merchantData, setMerchantData] = useState<{
    id: string;
    name: string;
    walletAddress: string;
    signerWallet?: string;
    multisigPda?: string;
  } | null>(null);
  const [showAddSigner, setShowAddSigner] = useState(false);
  const [newSignerAddress, setNewSignerAddress] = useState("");
  const [newThreshold, setNewThreshold] = useState(2);
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch Merchant Data from API ───────────────────────
  const fetchMerchant = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/merchants/register?wallet=${publicKey}`);
      const data = await res.json();
      if (data.registered && data.merchant) {
        setMerchantData(data.merchant);
        if (data.merchant.multisigPda) {
          localStorage.setItem(
            `settlr_vault_${publicKey}`,
            data.merchant.multisigPda,
          );
        }
      }
    } catch (err) {
      console.error("Error fetching merchant data:", err);
    }
  }, [publicKey]);

  // ─── Fetch USDC Balance (wallet + vault) ───────────────
  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoadingBalance(true);
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const walletPubkey = new PublicKey(publicKey);
      const ata = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
      try {
        const account = await getAccount(connection, ata);
        setBalance(Number(account.amount) / Math.pow(10, USDC_DECIMALS));
      } catch {
        setBalance(0);
      }
      const vaultPdaStr =
        merchantData?.walletAddress ||
        localStorage.getItem(`settlr_vault_pda_${publicKey}`);
      if (vaultPdaStr) {
        try {
          const vaultPubkey = new PublicKey(vaultPdaStr);
          const vaultAta = await getAssociatedTokenAddress(
            USDC_MINT,
            vaultPubkey,
            true,
          );
          const vaultAccount = await getAccount(connection, vaultAta);
          setVaultBalance(
            Number(vaultAccount.amount) / Math.pow(10, USDC_DECIMALS),
          );
        } catch {
          setVaultBalance(0);
        }
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  }, [publicKey, merchantData?.walletAddress]);

  // ─── Fetch Vault Info ──────────────────────────────────
  const fetchVault = useCallback(async () => {
    if (!publicKey) return;
    setLoadingVault(true);
    try {
      const multisigPdaStr =
        merchantData?.multisigPda ||
        localStorage.getItem(`settlr_vault_${publicKey}`);
      if (multisigPdaStr) {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const multisigPda = new PublicKey(multisigPdaStr);
        const info = await getVaultInfo(connection, multisigPda);
        setVaultInfo(info);
      }
    } catch (err) {
      console.error("Error fetching vault:", err);
    } finally {
      setLoadingVault(false);
    }
  }, [publicKey, merchantData?.multisigPda]);

  useEffect(() => {
    if (connected) fetchMerchant();
  }, [connected, fetchMerchant]);

  useEffect(() => {
    if (connected) {
      fetchBalance();
      fetchVault();
    }
  }, [connected, fetchBalance, fetchVault]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isValidSolanaAddress = (address: string): boolean =>
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

  // ─── Add Signer ────────────────────────────────────────
  const handleAddSigner = async () => {
    if (!vaultInfo || !publicKey || !wallet) return;
    if (!isValidSolanaAddress(newSignerAddress)) {
      setError("Invalid Solana address");
      return;
    }
    setAddingMember(true);
    setError(null);
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const result = await buildAddMemberTransactions(
        connection,
        vaultInfo.multisigPda,
        new PublicKey(publicKey),
        new PublicKey(newSignerAddress),
        newThreshold,
      );
      if (!walletSignTx) throw new Error("Wallet does not support signing");

      // Sign + send each tx in order, waiting for confirmation between
      // them since later steps depend on prior on-chain state.
      for (const step of result.transactions) {
        // Refresh blockhash for each tx so they don't expire while the
        // user is reviewing the wallet popup.
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed");
        step.transaction.recentBlockhash = blockhash;
        step.transaction.lastValidBlockHeight = lastValidBlockHeight;

        const signedTx = await walletSignTx(step.transaction);
        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
        );
        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed",
        );
        console.log(`[Squads] ${step.label}:`, signature);
      }

      if (!result.canExecuteImmediately) {
        setError(
          `Proposal ${result.transactionIndex.toString()} created and approved by you. Other signers must approve before it can be executed.`,
        );
      }
      setShowAddSigner(false);
      setNewSignerAddress("");
      setNewThreshold(2);
      setTimeout(() => fetchVault(), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to add signer");
    } finally {
      setAddingMember(false);
    }
  };

  if (!connected) return null;

  return (
    <>
      {/* ═══════════════════════════════════════ */}
      {/*  VAULT + BALANCE ROW                   */}
      {/* ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Vault Status */}
        <div className="rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#34c759]/10 p-2.5">
                <Shield className="h-5 w-5 text-[#34c759]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#212121]">
                  Squads Vault
                </h3>
                <p className="text-xs text-[#8a8a8a]">
                  {vaultInfo
                    ? `${vaultInfo.threshold}-of-${vaultInfo.members.length} multisig`
                    : loadingVault
                    ? "Loading..."
                    : "Not configured"}
                </p>
              </div>
            </div>
            <button
              onClick={fetchVault}
              disabled={loadingVault}
              className="p-1.5 rounded-lg hover:bg-[#f2f2f2] transition-colors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#8a8a8a] ${
                  loadingVault ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {vaultInfo ? (
            <div className="space-y-3">
              {/* Vault PDA */}
              <div className="rounded-lg bg-[#FFFFFF] border border-[#d3d3d3] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a] mb-0.5">
                  Settlement Address
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-[#5c5c5c] truncate">
                    {vaultInfo.vaultPda.toBase58()}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        vaultInfo.vaultPda.toBase58(),
                        "vaultAddr",
                      )
                    }
                    className="p-1 rounded hover:opacity-70"
                  >
                    {copied === "vaultAddr" ? (
                      <Check className="h-3 w-3 text-[#34c759]" />
                    ) : (
                      <Copy className="h-3 w-3 text-[#8a8a8a]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Signers row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-[#8a8a8a]" />
                  <span className="text-xs text-[#8a8a8a]">
                    {vaultInfo.members.length} signer
                    {vaultInfo.members.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddSigner(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#34c759] hover:opacity-70 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>

              {/* Member list */}
              <div className="space-y-1.5">
                {vaultInfo.members.map((member, i) => (
                  <div
                    key={member.key.toBase58()}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#34c759]/10 text-[#34c759] flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <code className="font-mono text-[#5c5c5c] truncate flex-1">
                      {shortenAddress(member.key.toBase58(), 6)}
                    </code>
                    <span className="text-[10px] text-[#8a8a8a]">
                      {permissionsLabel(member.permissions)}
                    </span>
                    {member.key.toBase58() === publicKey && (
                      <span className="text-[10px] font-medium text-[#34c759]">
                        (you)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#8a8a8a] pt-1">
                <Lock className="h-3 w-3" />
                {vaultInfo.threshold} of {vaultInfo.members.length} signatures
                required
              </div>
            </div>
          ) : !loadingVault ? (
            <div className="text-center py-4">
              <Shield className="h-6 w-6 text-[#8a8a8a]/30 mx-auto mb-2" />
              <p className="text-xs text-[#8a8a8a] mb-2">No vault found</p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#34c759] hover:opacity-70"
              >
                <Shield className="h-3 w-3" />
                Set Up Vault
              </Link>
            </div>
          ) : (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#8a8a8a]" />
            </div>
          )}
        </div>

        {/* Balance */}
        <div className="rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#34c759]/10 p-2.5">
                <Wallet className="h-5 w-5 text-[#34c759]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#212121]">
                  {vaultInfo ? "Vault Balance" : "Wallet Balance"}
                </h3>
                <p className="text-xs text-[#8a8a8a]">USDC on Devnet</p>
              </div>
            </div>
            <button
              onClick={fetchBalance}
              disabled={loadingBalance}
              className="p-1.5 rounded-lg hover:bg-[#f2f2f2] transition-colors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#8a8a8a] ${
                  loadingBalance ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-end gap-1.5 mb-1">
            <span className="text-3xl font-bold text-[#212121]">
              {vaultInfo
                ? vaultBalance !== null
                  ? vaultBalance.toFixed(2)
                  : "-"
                : balance !== null
                ? balance.toFixed(2)
                : "-"}
            </span>
            <span className="text-sm text-[#8a8a8a] mb-1">USDC</span>
          </div>

          {vaultInfo && balance !== null && (
            <p className="text-xs text-[#8a8a8a] mb-4">
              Signer wallet: {balance.toFixed(2)} USDC
            </p>
          )}
          {!vaultInfo && <div className="mb-4" />}

          <Link
            href={`/offramp?wallet=${publicKey}&amount=${
              (vaultInfo ? vaultBalance : balance) || ""
            }`}
            className="block w-full"
          >
            <button className="w-full py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-white bg-[#34c759]">
              <Banknote className="h-4 w-4" />
              Cash Out to Bank
            </button>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/*  ADD SIGNER MODAL                      */}
      {/* ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showAddSigner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(12,24,41,0.6)" }}
            onClick={() => setShowAddSigner(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-[#d3d3d3] bg-[#f2f2f2] p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#34c759]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#34c759]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#212121]">
                      Add Signer
                    </h3>
                    <p className="text-xs text-[#8a8a8a]">
                      Add a co-signer to protect your treasury
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddSigner(false)}
                  className="p-2 rounded-lg hover:opacity-70"
                >
                  <X className="w-4 h-4 text-[#8a8a8a]" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-xs bg-[#e74c3c]/5 text-[#e74c3c]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                    New Signer Wallet Address
                  </label>
                  <input
                    type="text"
                    value={newSignerAddress}
                    onChange={(e) => setNewSignerAddress(e.target.value)}
                    placeholder="Paste Solana address"
                    className="w-full px-3 py-2.5 rounded-lg text-xs font-mono bg-[#FFFFFF] border border-[#d3d3d3] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#34c759]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                    New Threshold
                  </label>
                  <select
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-lg text-xs bg-[#FFFFFF] border border-[#d3d3d3] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#34c759]/30"
                  >
                    {vaultInfo &&
                      Array.from(
                        { length: vaultInfo.members.length + 1 },
                        (_, i) => i + 1,
                      ).map((t) => (
                        <option key={t} value={t}>
                          {t}-of-{vaultInfo.members.length + 1} signatures
                          required
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] mt-1 text-[#8a8a8a]">
                    Recommended: 2-of-2 for partners, 2-of-3 for boards.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddSigner}
                disabled={
                  addingMember || !isValidSolanaAddress(newSignerAddress)
                }
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl text-white bg-[#34c759] disabled:opacity-40 transition-opacity hover:opacity-90"
              >
                {addingMember ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Signer...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Signer
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
