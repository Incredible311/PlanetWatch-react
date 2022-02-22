interface NftMoveRequest {
  newAccount: string;
  oldAccount: string;
  allowClawback: boolean;
}

export default NftMoveRequest;