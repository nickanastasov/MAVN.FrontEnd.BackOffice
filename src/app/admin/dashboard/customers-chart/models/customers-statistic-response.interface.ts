export interface CustomersStatisticResponse {
  TotalActiveCustomers: number;

  TotalNonActiveCustomers: number;
  TotalCustomers: number;

  TotalNewCustomers: number;

  NewCustomers: CustomerStatisticsByDayResponse[];
}

export interface CustomerStatisticsByDayResponse {
  Day: Date;

  Count: number;
}
