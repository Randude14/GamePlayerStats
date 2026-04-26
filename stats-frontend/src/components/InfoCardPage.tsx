import { useEffect, useRef, useState, type ReactElement } from "react"
import { useAuth } from "../context/useAuth";
import { fetchURLWithAuth, fetchURLWithNoAuth, buildUrl, HttpMethod } from "../util/serverRequests";
import './InfoCardPage.css'
import type { RowObject, SearchResults } from "../util/Models";
import { extractMessage } from "../util/Helpers";
import { useSearchParams } from "react-router-dom";

export type SearchParams = {
    query: string,
    pageSize: string,
    page: string
}

interface InfoCardPageSettings {
    auth: boolean, // whether to use user token
    endpoint: string, // API endpoint to get rows from
    httpMethod?: string, // HTTP method to use, GET if not passed
    searchInputPlaceholder: string,
    infoCardBuilder: (data: RowObject) => ReactElement, // Function passed to build the info cards
    addSearchParams?: () => any;
    addPageNavigationElements?: (params: URLSearchParams, refreshPage: () => void) => ReactElement;
}

type ClickHandler = () => void;
function buildPageButtons<T extends RowObject>(searchResults: SearchResults<T>, onPrevClickHandler: ClickHandler, onNextClickHandler: ClickHandler) {

    return <div>
        <button className="info-card-navigation" disabled={!searchResults.hasPreviousPage} onClick={onPrevClickHandler}>Previous</button>
        <label className="info-card-navigation">{`Page ${searchResults.page || 1} / ${searchResults.totalPages || 1}`}</label>
        <button className="info-card-navigation" disabled={!searchResults.hasNextPage} onClick={onNextClickHandler}>Next</button>
    </div>
}

// Generics type allows table to work with an inhertied object type
export function InfoTable<T extends RowObject>({auth, endpoint, httpMethod, searchInputPlaceholder, infoCardBuilder, addSearchParams, addPageNavigationElements }: InfoCardPageSettings) {

    const { token } = useAuth();

    const gameSearchText = useRef<HTMLInputElement | null>(null);
    const buttonSearchRef = useRef<HTMLButtonElement | null>(null);

    const [searchResults, setSearchResults] = useState<SearchResults<T>>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const page: number = Number(searchParams.get('page') || 1);
    const pageSize: number = Number(searchParams.get('pageSize') || 30);
    const searchText: string = searchParams.get('query') || "";

    useEffect(() => {
        const fetchRows = async () => {
            setLoading(true);
            setErrorMessage(null);

            if(!endpoint) {
                return;
            }

            if (auth && !token) {
                setErrorMessage("Please log in first.");
                setSearchResults(null);
                setLoading(false);
                return;
            }

            const endpointFetch = auth ? fetchURLWithAuth : fetchURLWithNoAuth;
            const url = new URL( buildUrl(endpoint) );
            
            for(const key of searchParams.keys()) {
                url.searchParams.set(key, searchParams.get(key));
            }

            // for now assume endpoint already has the correct format before adding, this should probably get fixed later
            const res = await endpointFetch(url.toString(), httpMethod || HttpMethod.GET);

            let data: Promise<any> = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok) {
                const msg = extractMessage(data, "Failed to load data.");

                setErrorMessage(msg);
                setSearchResults(null);
                setLoading(false);
                return;
            }

            const results = data as SearchResults<T>;

            setSearchResults(results);
            setLoading(false);
        };

        fetchRows();
    }, [auth, endpoint, httpMethod, token, searchParams]);

    if(!infoCardBuilder) {
        return <strong>Invalid settings.</strong>
    }

    if(loading) {
        return <strong>Loading...</strong>
    }

    if(errorMessage) {
        return <strong>{errorMessage}</strong>
    }

    const updateSearchParams = (page: number | string, pageSize: number | string) => {
        const query: string = gameSearchText.current?.value || '';

        if(addSearchParams) {
            const extraParams: any = addSearchParams();
            const searchParams: SearchParams = {
                query,
                page: String(page),
                pageSize: String(pageSize),
                ...extraParams
            }
            setSearchParams(searchParams);
        }
        else {
            const searchParams: SearchParams = {
                query,
                page: String(page),
                pageSize: String(pageSize)
            }
            setSearchParams(searchParams);
        }
    }

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value.trim() === '' && searchText.trim() !== '') {
            console.log('Text cleared!');
            updateSearchParams(1, pageSize);
        }
    };

    // Button handlers
    const onSearchClickHandler = () => updateSearchParams(page, pageSize);
    const onPrevClickHandler = () => updateSearchParams(page-1, pageSize);
    const onNextClickHandler = () => updateSearchParams(page+1, pageSize);


    const showResults: boolean = !!endpoint && !!searchResults;

    const infoCardPage =  <>
        <div className="info-card-search-fields">
            <form onSubmit={(e) => {
                e.preventDefault();
                onSearchClickHandler();
            }}>
                <div className="info-search">
                    <div className="search-box-div"><input id="searchbox" type="search" ref={gameSearchText} 
                            placeholder={searchInputPlaceholder} defaultValue={searchText} onChange={onSearchChange} /></div>
                    <button className="info-search-option" type="submit" ref={buttonSearchRef}>Search</button>
                    <select className="info-search-option" value={String(pageSize)} onChange={(e) => {

                            updateSearchParams(page, e.target.value)
                        }}>
                        {["10", "20", "30", "40", "50"]
                            .map(value => <option key={value} value={value}>{value}</option>)}
                    </select>
                    
                </div>
                {addPageNavigationElements && addPageNavigationElements(searchParams, onSearchClickHandler)}
            </form>
        </div>
        <div className="info-card-table">
            {showResults && searchResults.results.map((row, index) => {

                return <div className="info-card" key={index}>
                    {infoCardBuilder(row) || <>Null</>}
                </div>;
            })}
            {!searchResults.results?.length && <strong>No search results found.</strong>}
            {!showResults && <strong>Something went wrong.</strong>}
        </div>
        {buildPageButtons(searchResults,  onPrevClickHandler, onNextClickHandler)}
    </>


    return infoCardPage;
}