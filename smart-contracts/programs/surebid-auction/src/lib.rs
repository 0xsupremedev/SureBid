use anchor_lang::prelude::*;

declare_id!("SureBid1111111111111111111111111111111111111");

#[program]
pub mod surebid_auction {
    use super::*;

    pub fn create_auction(
        ctx: Context<CreateAuction>,
        end_ts: i64,
        min_bid_lamports: u64,
        min_increment_lamports: u64,
    ) -> Result<()> {
        require!(end_ts > Clock::get()?.unix_timestamp, AuctionError::EndBeforeNow);
        let auction = &mut ctx.accounts.auction;
        auction.seller = ctx.accounts.seller.key();
        auction.end_ts = end_ts;
        auction.min_bid_lamports = min_bid_lamports;
        auction.min_increment_lamports = min_increment_lamports;
        auction.highest_bid_lamports = 0;
        auction.highest_bidder = Pubkey::default();
        auction.finalized = false;
        auction.bump = *ctx.bumps.get("auction").ok_or(AuctionError::MathOverflow)?;
        auction.escrow_bump = *ctx.bumps.get("escrow").ok_or(AuctionError::MathOverflow)?;
        auction.escrow_balance = 0;
        emit!(AuctionCreatedEvent {
            auction: auction.key(),
            seller: auction.seller,
            end_ts,
            min_bid_lamports,
            min_increment_lamports,
        });
        Ok(())
    }

    pub fn place_bid(ctx: Context<PlaceBid>, amount_lamports: u64) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let auction = &mut ctx.accounts.auction;
        require!(!auction.finalized, AuctionError::AlreadyFinalized);
        require!(now < auction.end_ts, AuctionError::AuctionEnded);

        // Determine minimum acceptable bid
        let min_required = if auction.highest_bid_lamports == 0 {
            auction.min_bid_lamports
        } else {
            auction
                .highest_bid_lamports
                .checked_add(auction.min_increment_lamports)
                .ok_or(AuctionError::MathOverflow)?
        };
        require!(amount_lamports >= min_required, AuctionError::BidTooLow);

        // Expect client to have transferred `amount_lamports` to escrow before calling this ix.
        // Verify escrow balance increased accordingly to prevent spoofed bids.
        let escrow_ai = &ctx.accounts.escrow;
        let prev_total = auction
            .escrow_balance
            .checked_add(0)
            .ok_or(AuctionError::MathOverflow)?;
        let curr = escrow_ai.lamports();
        let expected = prev_total
            .checked_add(amount_lamports)
            .ok_or(AuctionError::MathOverflow)?;
        require!(curr >= expected, AuctionError::EscrowInsufficientDeposit);

        // Refund previous highest bidder, if any
        if auction.highest_bid_lamports > 0 {
            let previous_bid = auction.highest_bid_lamports;
            let previous_bidder = auction.highest_bidder;
            let escrow_seeds: &[&[u8]] = &[b"escrow", ctx.accounts.auction.key().as_ref(), &[auction.escrow_bump]];
            let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
                &escrow_ai.key(),
                &previous_bidder,
                previous_bid,
            );
            anchor_lang::solana_program::program::invoke_signed(
                &transfer_ix,
                &[
                    escrow_ai.to_account_info(),
                    ctx.accounts.previous_highest_bidder.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[escrow_seeds],
            )?;
            auction.escrow_balance = auction
                .escrow_balance
                .checked_sub(previous_bid)
                .ok_or(AuctionError::MathOverflow)?;
            require_keys_eq!(
                ctx.accounts.previous_highest_bidder.key(),
                previous_bidder,
                AuctionError::InvalidPreviousBidder
            );
        }

        auction.highest_bid_lamports = amount_lamports;
        auction.highest_bidder = ctx.accounts.bidder.key();
        auction.escrow_balance = escrow_ai.lamports();
        emit!(BidPlacedEvent {
            auction: auction.key(),
            bidder: ctx.accounts.bidder.key(),
            amount_lamports,
        });
        Ok(())
    }

    pub fn finalize_auction(ctx: Context<FinalizeAuction>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let auction = &mut ctx.accounts.auction;
        require!(!auction.finalized, AuctionError::AlreadyFinalized);
        require!(now >= auction.end_ts, AuctionError::AuctionNotEnded);

        // Transfer highest bid to seller from escrow PDA via CPI signed
        if auction.highest_bid_lamports > 0 {
            let amount = auction.highest_bid_lamports;
            let escrow_ai = &ctx.accounts.escrow;
            let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
                &escrow_ai.key(),
                &ctx.accounts.seller.key(),
                amount,
            );
            let escrow_seeds: &[&[u8]] = &[b"escrow", ctx.accounts.auction.key().as_ref(), &[auction.escrow_bump]];
            anchor_lang::solana_program::program::invoke_signed(
                &transfer_ix,
                &[
                    escrow_ai.to_account_info(),
                    ctx.accounts.seller.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[escrow_seeds],
            )?;
            auction.escrow_balance = auction
                .escrow_balance
                .checked_sub(amount)
                .ok_or(AuctionError::MathOverflow)?;
        }

        auction.finalized = true;
        emit!(AuctionFinalizedEvent {
            auction: auction.key(),
            seller: auction.seller,
            highest_bidder: auction.highest_bidder,
            highest_bid_lamports: auction.highest_bid_lamports,
        });
        Ok(())
    }

    pub fn cancel_auction(ctx: Context<CancelAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        require_keys_eq!(auction.seller, ctx.accounts.seller.key(), AuctionError::OnlySeller);
        require!(!auction.finalized, AuctionError::AlreadyFinalized);
        require!(auction.highest_bid_lamports == 0, AuctionError::HasBids);
        auction.finalized = true; // mark closed
        emit!(AuctionCancelledEvent {
            auction: auction.key(),
            seller: auction.seller,
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(end_ts: i64)]
pub struct CreateAuction<'info> {
    #[account(
        init,
        payer = seller,
        space = 8 + Auction::SIZE,
        seeds = [b"auction", seller.key().as_ref(), &end_ts.to_le_bytes()],
        bump
    )]
    pub auction: Account<'info, Auction>;
    #[account(
        init,
        payer = seller,
        space = 8, // no data
        seeds = [b"escrow", auction.key().as_ref()],
        bump
    )]
    /// CHECK: escrow lamport vault, owned by program
    pub escrow: AccountInfo<'info>;
    #[account(mut)]
    pub seller: Signer<'info>;
    pub system_program: Program<'info, System>;
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut, has_one = seller)]
    pub auction: Account<'info, Auction>;
    pub seller: UncheckedAccount<'info>;
    #[account(mut, seeds = [b"escrow", auction.key().as_ref()], bump = auction.escrow_bump)]
    /// CHECK: escrow PDA
    pub escrow: AccountInfo<'info>;
    #[account(mut)]
    pub bidder: Signer<'info>;
    /// CHECK: validated against auction.highest_bidder
    #[account(mut)]
    pub previous_highest_bidder: UncheckedAccount<'info>;
    pub system_program: Program<'info, System>;
}

#[derive(Accounts)]
pub struct FinalizeAuction<'info> {
    #[account(mut, has_one = seller)]
    pub auction: Account<'info, Auction>;
    #[account(mut, seeds = [b"escrow", auction.key().as_ref()], bump = auction.escrow_bump)]
    /// CHECK: escrow PDA
    pub escrow: AccountInfo<'info>;
    #[account(mut)]
    pub seller: SystemAccount<'info>;
    pub system_program: Program<'info, System>;
}

#[derive(Accounts)]
pub struct CancelAuction<'info> {
    #[account(mut, has_one = seller)]
    pub auction: Account<'info, Auction>;
    pub seller: Signer<'info>;
}

#[account]
pub struct Auction {
    pub seller: Pubkey,
    pub end_ts: i64,
    pub min_bid_lamports: u64,
    pub min_increment_lamports: u64,
    pub highest_bid_lamports: u64,
    pub highest_bidder: Pubkey,
    pub finalized: bool,
    pub bump: u8,
    pub escrow_bump: u8,
    pub escrow_balance: u64,
}

impl Auction {
    pub const SIZE: usize = 32 + 8 + 8 + 8 + 8 + 32 + 1 + 1 + 1 + 8;
}

#[event]
pub struct AuctionCreatedEvent {
    pub auction: Pubkey,
    pub seller: Pubkey,
    pub end_ts: i64,
    pub min_bid_lamports: u64,
    pub min_increment_lamports: u64,
}

#[event]
pub struct BidPlacedEvent {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount_lamports: u64,
}

#[event]
pub struct AuctionFinalizedEvent {
    pub auction: Pubkey,
    pub seller: Pubkey,
    pub highest_bidder: Pubkey,
    pub highest_bid_lamports: u64,
}

#[event]
pub struct AuctionCancelledEvent {
    pub auction: Pubkey,
    pub seller: Pubkey,
}

#[error_code]
pub enum AuctionError {
    #[msg("Auction end time must be in the future")]
    EndBeforeNow,
    #[msg("Auction already finalized")]
    AlreadyFinalized,
    #[msg("Auction has ended")]
    AuctionEnded,
    #[msg("Auction not yet ended")]
    AuctionNotEnded,
    #[msg("Bid too low")]
    BidTooLow,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Only seller allowed")]
    OnlySeller,
    #[msg("Auction has bids; cannot cancel")]
    HasBids,
    #[msg("Invalid previous highest bidder account provided")]
    InvalidPreviousBidder,
    #[msg("Escrow did not receive expected lamports deposit")]
    EscrowInsufficientDeposit,
}

