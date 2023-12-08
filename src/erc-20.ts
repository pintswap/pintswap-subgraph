import {Transfer} from "../generated/ERC20/ERC20"
import {parseTrade} from "./trade";
import {PintswapTrade, OneSideOfTrade} from "../generated/schema"

export function handleTransfer(event: Transfer): void {
    // handle pintswap transactions
    if(event.transaction.to === null) {
      const parsedTrade = parseTrade(event.transaction.input.toHexString(), 1);
      if (parsedTrade.success) {
        const readableHash = event.transaction.hash.toHexString();
        let psTransfer = PintswapTrade.load(`${readableHash}`);
        let psGives = OneSideOfTrade.load(`gives-${readableHash}`)
        let psGets = OneSideOfTrade.load(`gets-${readableHash}`)
        if (!psTransfer) {
          psTransfer = new PintswapTrade(`${readableHash}`);
          psGives = new OneSideOfTrade(`gives-${readableHash}`);
          psGets = new OneSideOfTrade(`gets-${readableHash}`);
          // Set chain id
          psTransfer.chainId = (parsedTrade.chainId || 1).toString();
          // Set timestamp
          psTransfer.timestamp = event.block.timestamp;
          // Set Taker and Maker
          psTransfer.maker = parsedTrade.maker;
          psTransfer.taker = parsedTrade.taker;
          // Set Give
          psGives.token = parsedTrade.gives.token;
          psGives.amount = parsedTrade.gives.amount;
          psTransfer.gives = psGives.id;
          // Set Get
          psGets.token = parsedTrade.gets.token;
          psGets.amount = parsedTrade.gets.amount;
          psTransfer.gets = psGets.id;
          // Set pair
          psTransfer.pair = `${parsedTrade.gives.token}/${parsedTrade.gets.token}`
          // Save
          psGives.save();
          psGets.save();
          psTransfer.save();
        }
      }
    }
}
