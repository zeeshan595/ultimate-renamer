import fetch from "node-fetch";
import question from "../core/question";

export interface SearchParams {
    name?: string;
    imdbId?: number;
    zap2itId?: string;
    slug?: string;
}

export interface SearchResponse {
    aliases?: string[];
    banner?: string;
    firstAired?: string;
    id?: number;
    network?: string;
    overview?: string;
    seriesName?: string;
    slug?: string;
    status?: string;
}

export interface SeriesResponse {
    added?: string;
    airsDayOfWeek?: string,
    airsTime?: string,
    aliases?: string[],
    banner?: string,
    firstAired?: string,
    genre?: string[],
    id?: number,
    imdbId?: string,
    lastUpdated?: string,
    network?: string,
    networkId?: string,
    overview?: string,
    rating?: string,
    runtime?: string,
    seriesId?: string,
    seriesName?: string,
    siteRating?: string,
    siteRatingCount?: string,
    slug?: string,
    status?: string,
    zap2itId?: string,
}

export interface EpisodeListResponse {
    absoluteNumber?: number,
    airedEpisodeNumber?: number,
    airedSeason?: number,
    airsAfterSeason?: number,
    airsBeforeEpisode?: number,
    airsBeforeSeason?: number,
    director?: string,
    directors?: string[],
    dvdChapter?: number,
    dvdDiscid?: string,
    dvdEpisodeNumber?: number,
    dvdSeason?: number,
    episodeName?: string,
    filename?: string,
    firstAired?: string,
    guestStars?: string[],
    id?: number,
    imdbId?: string,
    lastUpdated?: number,
    lastUpdatedBy?: string,
    overview?: string,
    productionCode?: string,
    seriesId?: string,
    showUrl?: string,
    siteRating?: number,
    siteRatingCount?: string,
    thumbAdded?: string,
    thumbAuthor?: number,
    thumbHeight?: string,
    thumbWidth?: string,
    writers?: string[]
}

export default class TVDB {
    private apiKey: string;
    private userKey: string;
    private username: string;
    private token: string;
    private readonly host = "https://api.thetvdb.com";

    login = async (apiKey: string, userKey: string, username: string) => {
        try {
            const req = await fetch(`${this.host}/login`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    apiKey,
                    userKey,
                    username
                })
            });
            const res = await req.json();
            if (res["token"]) {
                this.token = res["token"];
                this.apiKey = apiKey;
                this.userKey = userKey;
                this.username = username;
            }
        } catch (e) {
            console.log(`tvdb login failed ${e}`);
        }
    }

    search = async (params: SearchParams): Promise<SearchResponse[] | null> => {
        try {
            let paramString: string = "";
            Object.keys(params).forEach((key, index) => {
                if (index !== 0) {
                    paramString += '&';
                }
                paramString += `${key}=${params[key]}`
            });
            const req = await fetch(`${this.host}/search/series?${paramString}`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.token}`
                }
            });
            const res = await req.json();
            return res["data"] as SearchResponse[];
        }
        catch (e) {
            console.log(`tvdb search failed ${e}`);
        }

        return null;
    }

    series = async (id: number): Promise<SeriesResponse | null> => {
        try {
            const req = await fetch(`${this.host}/series/${id}`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.token}`
                }
            });
            const res = await req.json();
            return res["data"] as SeriesResponse;
        }
        catch (e) {
            console.log(`tvdb series failed ${e}`);
        }

        return null;
    }

    episodeList = async (id: number): Promise<EpisodeListResponse[] | null> => {
        try {
            const req = await fetch(`${this.host}/series/${id}/episodes`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.token}`
                }
            });
            const res = await req.json();
            return res["data"] as EpisodeListResponse[];
        }
        catch (e) {
            console.log(`tvdb series failed ${e}`);
        }

        return null;
    }

    searchEpisodeList = async (params: SearchParams): Promise<EpisodeListResponse[] | null> => {
        const response = await this.search(params);
        if (!response) return null;
        response.forEach((r, index) => console.log(`${index}: ${r.seriesName}`));
        const answer: number = parseInt(await question('please select a series by typing the number:'));
        if (answer < 0 || answer >= response.length) return null;
        return await this.episodeList(response[answer].id);
    }
};