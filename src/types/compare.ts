// One Set's line in a comparison
export type CompareRow = {
  id: string;
  number: number;
  status: string;
  closed: boolean;
  closedOn: string | null;
  dayOfAge: number;
  intake: number;
  deaths: number;
  sold: number;
  fcr: number | null;
  weightAtSale: number | null;
  costPerBirdSold: number | null;
  revenuePerBird: number | null;
  marginPerBird: number | null;
  margin: number | null;
  feedShare: number | null;
  profit: number | null;
};
