const AppError = require('../util/AppError');
const extractExistingData = require('../util/extractExistingData');
const {Table} = require('../util/tables');

class ExternalGameAPIService {

    constructor(_knex) {
        this.knex = _knex;
        this.igdbToken = null;
        this.tokenExpiresAt = null;
    }

    async getIGDBToken() {
        if(this.igdbToken && Date.now() < this.tokenExpiresAt) {
            return this.igdbToken;
        }

        const res = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            })
        });

        const data = await res.json();

        this.igdbToken = data.access_token;
        this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // small buffer

        return this.igdbToken;
    }

    async searchExternalGames(search, page=1, pageSize=20) {
        page = Math.max(page, 1);
        pageSize = Math.max(pageSize, 5);
        const token = await this.getIGDBToken();
        const offset = (page - 1) * pageSize;

        const safeSearch = search.replace(/"/g, '\\"');
        const res = await fetch('https://api.igdb.com/v4/games',{
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
            },
            body: `
                search \"${safeSearch}\"; fields name, first_release_date,
                involved_companies.company.name,
                involved_companies.developer,
                involved_companies.publisher; 
                where version_parent = null;
                limit ${pageSize};
                offset ${offset};   
            `
        });

        if(!res.ok) {
            throw new AppError('Failed to search IGDB games.', 500);
        }

        const data = await res.json();

        return data.map(game => ({
            external_id: game.id,
            title: game.name,
            release_date: game.first_release_date ? 
                new Date(game.first_release_date * 1000)
                .toISOString().split('T')[0] : null,
            developers: game.involved_companies
                ?.filter(comp => comp.developer)
                .map(comp => comp.company?.name)
                .filter(Boolean) || [],
            publishers: game.involved_companies
                ?.filter(comp => comp.publisher)
                .map(comp => comp.company?.name)
                .filter(Boolean) || []
        }));
    }
}

module.exports = ExternalGameAPIService;