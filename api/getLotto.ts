export interface LottoResponse {
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
    returnValue: 'success' | 'fail';
}
export const fetchLotto = async (drwNo: number): Promise<LottoResponse> => {
    const res = await fetch(`/lotto/common.do?method=getLottoNumber&drwNo=${drwNo}`);
    if (!res.ok) throw new Error('Network error');
    const data = res.json();

    return data;
};
