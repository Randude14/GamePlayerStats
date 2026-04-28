const AppError = require('../util/AppError');
const extractExistingData = require('../util/extractExistingData');
const {Table} = require('../util/tables');

class ExternalGameAPIService {

    constructor(_knex) {
        this.knex = _knex;
        this.igdbToken = null;
        this.tokenExpiresAt = null;
    }

    getRequestInit(token, body) {
        return {
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
            },
            body
        };
    }

    mapToName(objects) {
        if(objects) {
            return objects.map(obj => obj.name);
        }
        return null;
    }

    canImportExternalGame(game) {
        return game?.game_type?.id === 0 || game?.game_type?.id === 4;
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
        const offset = (page - 1) * pageSize;

        const token = await this.getIGDBToken();
        const safeSearch = search.replace(/"/g, '\\"');
        const res = await fetch('https://api.igdb.com/v4/games', 
                        this.getRequestInit(token, `
                            search \"${safeSearch}\"; 
                            fields
                                name,
                                game_type.type,
                                first_release_date,
                                cover.url,
                                game_modes.name,
                                genres.name,
                                platforms.name,
                                themes.name,
                                player_perspectives.name,
                                involved_companies.company.name,
                                involved_companies.developer,
                                involved_companies.publisher;
                            where version_parent = null;
                            limit ${pageSize};
                            offset ${offset};   
                        `));

        if(!res.ok) {
            throw new AppError('Failed to search IGDB games.', 500);
        }
        
        // Get imported games with external ids and sort for easy searching
        let importedGamesExternal = await this.knex(Table.GAME_TABLE)
                .select('id', 'title', 'external_id')
                .orderBy([
                    {column: 'external_id', 'order': 'asc'}, 
                    {column: 'title', 'order': 'asc'}
                            ])

        const importedMap = new Map(
                      importedGamesExternal.map(g => [g.external_id, g])
                );

        const data = await res.json();

        const results = data.map(game => ({
            external_id: game.id,
            title: game.name,
            cover_url: game.cover?.url
                ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` // convert thumbnails to bigger images
                : null,
            release: game.first_release_date ? 
                new Date(game.first_release_date * 1000)
                .toISOString().split('T')[0] : null,
            developers: game.involved_companies
                ?.filter(comp => comp.developer)
                .map(comp => comp.company?.name)
                .filter(Boolean) || [],
            publishers: game.involved_companies
                ?.filter(comp => comp.publisher)
                .map(comp => comp.company?.name)
                .filter(Boolean) || [],
            game_modes: this.mapToName(game.game_modes),
            game_type: game.game_type?.type ?? null,
            themes: this.mapToName(game.themes),
            platforms: this.mapToName(game.platforms),
            genres: this.mapToName(game.genres),
            player_perspectives: this.mapToName(game.player_perspectives),
            isImported: importedMap.has(game.id),
            canImport: this.canImportExternalGame(game), // game ids 0 and 4 are the main game and standalone expansion
            internal_id: importedMap.get(game.id)?.id || null
        }));

        const countRes = await fetch('https://api.igdb.com/v4/games/count',
                            this.getRequestInit(token, `
                                search \"${safeSearch}\";
                                where version_parent = null;
                            `));

        if(!countRes.ok) {
            throw new AppError('Failed to get the count from IGDB games.', 500);
        }

        const countData = await countRes.json();
        const totalResults = countData.count || 0;
        const totalPages = Math.ceil(totalResults / pageSize) ; 

        return {
            query: search,
            page,
            pageSize,
            totalResults,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            results
        }
    }

    async integrateGame(external_id) {
        const token = await this.getIGDBToken();
        const res = await fetch('https://api.igdb.com/v4/games', 
                        this.getRequestInit(token, `
                            fields name, first_release_date,
                            involved_companies.company.name,
                            involved_companies.developer,
                            involved_companies.publisher,
                            cover.url; 
                            where id=${external_id};
                        `));

        if(!res.ok) {
            throw new AppError(`Failed to search for game with id ${external_id}.`, 500);
        }

        const data = await res.json();

        if(data.length === 0) {
            throw new AppError(`Failed to find game with id ${external_id}.`, 400);
        }

        if(! this.canImportExternalGame(data[0])) {
            throw new AppError(`Cannot import '${data[0].name}'. Games must be a main title or standalone expansion.`, 400);
        }

        // Covert and integrate the data
        const externalGameData = data.map(game => ({
            external_id: game.id,
            title: game.name,
            cover_url: game.cover?.url
                ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` // convert thumbnails to bigger images
                : null,
            external_source: 'igdb',
            release: game.first_release_date ? 
                new Date(game.first_release_date * 1000)
                .toISOString().split('T')[0] : null,
            developers: JSON.stringify(game.involved_companies
                ?.filter(comp => comp.developer)
                .map(comp => comp.company?.name)
                .filter(Boolean) || []),
            publishers: JSON.stringify(game.involved_companies
                ?.filter(comp => comp.publisher)
                .map(comp => comp.company?.name)
                .filter(Boolean) || [])
        }));

        const externalGame = externalGameData[0];   
        return externalGame;
    }
}

module.exports = ExternalGameAPIService;