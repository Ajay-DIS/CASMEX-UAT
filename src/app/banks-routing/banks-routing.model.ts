export interface BankRoutingApiData{
    routeCode: any[],
    country: any[],
    routeBankName: any[],
    routeServiceType: any[],
    routeServiceCategory: any[],
    routeToBankName: any[],
    routeToServiceType: any[],
    routeToServiceCategory: any[],
    iSCorrespondent: any[],
    status: any[],
    data: BankRouting[]
  
  }
  
export  interface BankRouting {
    id: number,
    userID: string,
    routeCode: string;
    country: string;
    routeBankName: string;
    routeServiceCategory: string;
    routeServiceType: string;
    iSCorrespondent: string;
    routeToBankName: string;
    routeToServiceCategory: string;
    routeToServiceType: string;
    createdDate: any
    status: string;
    updatedBy: string,
    updatedDate: string,
    criteriaMap: string,
    routeDesc: string,
    lcyAmountFrom: any,
    lcyAmountTo: any
  }


export interface UpdateBankRouteStatusApiRequest{
    userId: string,
    status: string,
    routeCode: string
}

export interface UserData{
   useRole: string,
    userGroup: string,
    userId: string,
    userName: string,
}