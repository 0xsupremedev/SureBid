import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import bs58 from 'bs58';

function getProgramId(): PublicKey {
  const id = process.env.NEXT_PUBLIC_PROGRAM_ID || '11111111111111111111111111111111';
  return new PublicKey(id);
}

async function ixDiscriminator(name: string): Promise<Buffer> {
  // Browser-safe: use Web Crypto if available; else fallback to precomputed map
  const pre: Record<string, number[]> = {};
  const preBytes = pre[name];
  if (preBytes) return Buffer.from(preBytes);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(`global:${name}`);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Buffer.from(new Uint8Array(hash)).subarray(0, 8);
  }
  throw new Error('No crypto available for discriminator');
}

function u64LE(n: number | bigint): Buffer {
  const buf = Buffer.alloc(8);
  let x = BigInt(n);
  for (let i = 0; i < 8; i++) {
    buf[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  return buf;
}

function i64LE(n: number | bigint): Buffer {
  const buf = Buffer.alloc(8);
  let x = BigInt(n);
  if (x < 0) x = (1n << 64n) + x;
  for (let i = 0; i < 8; i++) {
    buf[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  return buf;
}

export async function deriveAuctionPda(seller: PublicKey, endTs: number): Promise<[PublicKey, number]> {
  const seed = Buffer.alloc(8);
  seed.writeBigInt64LE(BigInt(endTs));
  return PublicKey.findProgramAddressSync([
    Buffer.from('auction'),
    seller.toBuffer(),
    seed
  ], getProgramId());
}

export function deriveEscrowPda(auctionPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([
    Buffer.from('escrow'),
    auctionPda.toBuffer()
  ], getProgramId());
}

export async function buildCreateAuctionTx(
  connection: Connection,
  seller: PublicKey,
  endTs: number,
  minBidLamports: number,
  minIncrementLamports: number
): Promise<Transaction> {
  const [auctionPda] = await deriveAuctionPda(seller, endTs);
  const disc = await ixDiscriminator('create_auction');
  const data = Buffer.concat([
    disc,
    i64LE(endTs),
    u64LE(minBidLamports),
    u64LE(minIncrementLamports)
  ]);
  const keys = [
    { pubkey: auctionPda, isSigner: false, isWritable: true },
    { pubkey: seller, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ];
  const ix = new TransactionInstruction({ programId: getProgramId(), keys, data });
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ blockhash, lastValidBlockHeight, feePayer: seller });
  tx.add(ix);
  return tx;
}

export async function buildPlaceBidTx(
  connection: Connection,
  bidder: PublicKey,
  auction: PublicKey,
  seller: PublicKey,
  previousHighestBidder: PublicKey,
  amountLamports: number
): Promise<Transaction> {
  const disc = await ixDiscriminator('place_bid');
  const data = Buffer.concat([
    disc,
    u64LE(amountLamports)
  ]);
  const [escrowPda] = deriveEscrowPda(auction);
  const keys = [
    { pubkey: auction, isSigner: false, isWritable: true },
    { pubkey: seller, isSigner: false, isWritable: false },
    { pubkey: escrowPda, isSigner: false, isWritable: true },
    { pubkey: bidder, isSigner: true, isWritable: true },
    { pubkey: previousHighestBidder, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ];
  const ix = new TransactionInstruction({ programId: getProgramId(), keys, data });
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ blockhash, lastValidBlockHeight, feePayer: bidder });
  // First transfer bidder lamports into escrow PDA as required by program
  tx.add(SystemProgram.transfer({ fromPubkey: bidder, toPubkey: escrowPda, lamports: amountLamports }));
  // Then place bid instruction
  tx.add(ix);
  return tx;
}

export async function buildFinalizeAuctionTx(
  connection: Connection,
  signer: PublicKey,
  auction: PublicKey,
  seller: PublicKey
): Promise<Transaction> {
  const disc = await ixDiscriminator('finalize_auction');
  const data = Buffer.from(disc);
  const keys = [
    { pubkey: auction, isSigner: false, isWritable: true },
    { pubkey: seller, isSigner: false, isWritable: true }
  ];
  const ix = new TransactionInstruction({ programId: getProgramId(), keys, data });
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ blockhash, lastValidBlockHeight, feePayer: signer });
  tx.add(ix);
  return tx;
}

export function txToBase64(tx: Transaction): string {
  const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  return Buffer.from(serialized).toString('base64');
}

export function base64ToTx(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

export type AuctionAccount = {
  seller: PublicKey;
  endTs: number;
  minBidLamports: bigint;
  minIncrementLamports: bigint;
  highestBidLamports: bigint;
  highestBidder: PublicKey;
  finalized: boolean;
  bump: number;
  escrowBump: number;
  escrowBalance: bigint;
  pubkey: PublicKey;
};

async function accountDiscriminator(name: string): Promise<Buffer> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(`account:${name}`);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Buffer.from(new Uint8Array(hash)).subarray(0, 8);
  }
  throw new Error('No crypto available');
}

function readU64(buf: Buffer, off: number): [bigint, number] {
  let v = 0n;
  for (let i = 0; i < 8; i++) v |= BigInt(buf[off + i]) << BigInt(8 * i);
  return [v, off + 8];
}

function readI64(buf: Buffer, off: number): [number, number] {
  let v = 0n;
  for (let i = 0; i < 8; i++) v |= BigInt(buf[off + i]) << BigInt(8 * i);
  // two's complement to signed
  if (v & (1n << 63n)) v = v - (1n << 64n);
  return [Number(v), off + 8];
}

export async function fetchAuctions(connection: Connection): Promise<AuctionAccount[]> {
  const programId = getProgramId();
  // If no program id configured, skip to avoid RPC errors
  if (programId.equals(new PublicKey('11111111111111111111111111111111'))) {
    return [];
  }
  const disc = await accountDiscriminator('Auction');
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(disc) } }]
  });
  const out: AuctionAccount[] = [];
  for (const a of accounts) {
    const data = Buffer.from(a.account.data);
    let off = 8; // skip discriminator
    const seller = new PublicKey(data.subarray(off, off + 32)); off += 32;
    const [endTs, off1] = readI64(data, off); off = off1;
    const [minBid, off2] = readU64(data, off); off = off2;
    const [minInc, off3] = readU64(data, off); off = off3;
    const [highestBid, off4] = readU64(data, off); off = off4;
    const highestBidder = new PublicKey(data.subarray(off, off + 32)); off += 32;
    const finalized = data[off] === 1; off += 1;
    const bump = data[off]; off += 1;
    const escrowBump = data[off]; off += 1;
    const [escrowBalance] = readU64(data, off);
    out.push({
      seller,
      endTs,
      minBidLamports: minBid,
      minIncrementLamports: minInc,
      highestBidLamports: highestBid,
      highestBidder,
      finalized,
      bump,
      escrowBump,
      escrowBalance,
      pubkey: a.pubkey
    });
  }
  return out.sort((a, b) => a.endTs - b.endTs);
}

