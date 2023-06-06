import {Transfer} from "../generated/ERC20/ERC20"
import {parseTrade} from "./trade";
import {TokenBalance, PintswapTrade} from "../generated/schema"
import {
  fetchTokenDetails,
  fetchAccount,
  fetchBalance,
} from "./utils"
import { BigDecimal} from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
    let token = fetchTokenDetails(event);
    if (!token) return

    // get account addresses from event
    let fromAddress = event.params.from.toHex();
    let toAddress = event.params.to.toHex();

    // fetch account details
    let fromAccount = fetchAccount(fromAddress);
    let toAccount = fetchAccount(toAddress);

    if (!fromAccount || !toAccount) return;

    // setting the token balance of the 'from' account
    let fromTokenBalance = TokenBalance.load(token.id + "-" + fromAccount.id);
    if (!fromTokenBalance) { // if balance is not already saved
      // create a new TokenBalance instance
      // while creating the new token balance,
      // the combination of the token address 
      // and the account address is  
      // passed as the identifier value
      fromTokenBalance = new TokenBalance(`${token.id}-${fromAccount.id}`);
      fromTokenBalance.token = token.id;
      fromTokenBalance.account = fromAccount.id;
    }

    fromTokenBalance.amount = fetchBalance(event.address,event.params.from)
    // filtering out zero-balance tokens - optional
    if(fromTokenBalance.amount != BigDecimal.fromString("0")){
      fromTokenBalance.save();
    }
    
    // setting the token balance of the 'to' account
    let toTokenBalance = TokenBalance.load(token.id + "-" + toAccount.id);
    if (!toTokenBalance) {
        toTokenBalance = new TokenBalance(token.id + "-" + toAccount.id);
        toTokenBalance.token = token.id;
        toTokenBalance.account = toAccount.id;
      }
    toTokenBalance.amount = fetchBalance(event.address,event.params.to)
    if(toTokenBalance.amount != BigDecimal.fromString("0")){
      toTokenBalance.save();
    }

    // handle pintswap transactions
    if(event.transaction.to === null) {
      const parsedTrade = parseTrade(event.transaction.input.toHexString(), 1);
      if (parsedTrade.success) {
        let psTransfer = PintswapTrade.load(`${event.transaction.hash}`);
        if (!psTransfer) {
          psTransfer = new PintswapTrade(`${event.transaction.hash}`);
          // Set chain id
          psTransfer.chainId = (parsedTrade.chainId || 1).toString();
          // Set Taker and Maker
          psTransfer.maker = parsedTrade.maker;
          psTransfer.taker = parsedTrade.taker;
          // Set Give and Get Offer
          psTransfer.givesToken = parsedTrade.gives.token;
          psTransfer.givesAmount = parsedTrade.gives.amount;
          psTransfer.getsToken = parsedTrade.gets.token;
          psTransfer.getsAmount = parsedTrade.gets.amount;
          psTransfer.save();
        }
      }
    }
}
