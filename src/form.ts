export interface LoginForm {
    username?: string;
    password?: string;
}

export interface DailyReportResponse {
    e: number;
    m: string;
    d: {};
}

export interface DailyReportForm {
    tw: string;
    sfcxtz: string;
    sfjcbh: string;
    sfcxzysx: string;
    qksm: string;
    sfyyjc: string;
    jcjgqr: string;
    remark: string;
    address: string;
    geo_api_info: string;
    area: string;
    province: string;
    city: string;
    sfzx: string;
    sfjcwhry: string;
    sfjchbry: string;
    sfcyglq: string;
    gllx: string;
    glksrq: string;
    jcbhlx: string;
    jcbhrq: string;
    bztcyy: string;
    sftjhb: string;
    sftjwh: string;
    sfsfbh: string;
    xjzd: string;
    jcwhryfs: string;
    jchbryfs: string;
    szgj: string;
    jcjg: string;
    uid: string;
    created: number;
    date: string;
    ismoved: string;
    id: number;
    gwszdd: string;
    jrdqtlqk: Array<string>;
    jrdqjcqk: Array<string>;
}
