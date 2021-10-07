use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    rent::Rent,
};

solana_program::entrypoint!(the_entrypoint);

/*

initialize --> [0]

incremement --> [n, idx]

*/

pub fn the_entrypoint(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!(
        "Hi! I'm program {} You called me with data = {:?}.",
        program_id,
        data
    );

    if data.len() > 0 {
        let mut accounts_iter = accounts.iter();
        match data[0] {
            0 => {
                msg!("Ok, going to try to initialize an account for you.");

                let funder = next_account_info(&mut accounts_iter)?;
                let the_account_to_initialize = next_account_info(&mut accounts_iter)?;
                // let system_program = next_account_info(&mut accounts_iter)?;

                msg!(
                    "The account has {} lamports",
                    **the_account_to_initialize.try_borrow_lamports()?
                );
                if **the_account_to_initialize.try_borrow_lamports()? > 0 {
                    msg!("Looks like you've already initialized that account, skipping");
                    return Ok(());
                }

                let array_len = 10;
                let lamports = Rent::default().minimum_balance(array_len);
                let ix = solana_program::system_instruction::create_account(
                    funder.key,
                    the_account_to_initialize.key,
                    lamports,
                    array_len as u64,
                    program_id,
                );
                let (_pda, bump) = Pubkey::find_program_address(&["david".as_bytes()], program_id);
                invoke_signed(
                    &ix,
                    &[funder.clone(), the_account_to_initialize.clone()],
                    &[&["david".as_bytes(), &[bump]]],
                )?;
            }
            n => {
                let index = data[1] as usize;
                msg!(
                    "Ok, going to incrmement an account for you, at index = {}.",
                    index
                );
                let the_account = next_account_info(&mut accounts_iter)?;
                the_account.try_borrow_mut_data()?[index] += n;
            }
        }
    }

    Ok(())
}
