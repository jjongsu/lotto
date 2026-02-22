export interface LottoSuccessResponse {
    /** 회차 */
    drwNo: number;
    /** 회차 날짜 */
    drwNoDate: string;
    /** 전체 판매량 */
    totSellamnt: number;
    /** 1등 당첨 금액 */
    firstWinamnt: number;
    /** 1등 당첨자 수 */
    firstPrzwnerCo: number;
    /** 전체 1등 당첨 금액 */
    firstAccumamnt: number;
    drwtNo1: number;
    drwtNo2: number;
    drwtNo3: number;
    drwtNo4: number;
    drwtNo5: number;
    drwtNo6: number;
    bnusNo: number;
    returnValue: 'success';
}

export interface LottoFailResponse {
    drwNo: number;
    returnValue: 'fail';
}

export type LottoApiResponse = LottoSuccessResponse | LottoFailResponse;

export type LottoQueryData = Partial<LottoApiResponse> & {
    isLoading: boolean;
};

export type LottoSuccessQueryData = LottoSuccessResponse & {
    isLoading: boolean;
};

export const isLottoSuccessResponse = (value: Partial<LottoApiResponse> | undefined): value is LottoSuccessResponse => {
    return value?.returnValue === 'success';
};

export const isLottoSuccessQueryData = (value: LottoQueryData | undefined): value is LottoSuccessQueryData => {
    return value?.returnValue === 'success';
};
