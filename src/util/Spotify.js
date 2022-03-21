let accessToken;
let expiresIn;

const clientId = "260ae191a73347388f0906143e73f889";
const redirectURI = "https://spotifyplaylistsave.netlify.app/";

const Spotify = {
    getAccessToken() {
        console.log(accessToken);
        if(accessToken) {
            return accessToken;
        }

        // Implicit grant flow
        // check for access token match

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        console.log(accessToken);

        if(accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            window.location = accessURL;
        }

        
    },

     async search(term) {
        const accessToken = Spotify.getAccessToken();
        const jsonResponse = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error("request failed");
        }, networkError => {
            console.log(networkError.message());
            console.log(accessToken);
         });
        /*const jsonResponse = await response.json().*/
        if (!jsonResponse.tracks) {
            return [];
        }
        return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists[0].name,
            album: track.album.name,
            uris: track.uri
        }));

    }, 

    savePlaylist(name, trackURIs) {
        if(!name || !trackURIs.length) {
            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}`};
        let userId;

        return fetch('https://api.spotify.com/v1/me', {headers : headers}
        ).then(response => response.json()).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers : headers,
                method : 'POST',
                body: JSON.stringify({name : name})
            }).then(response => response.json()).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris : trackURIs})
                })
            })
        })


    }
}

export default Spotify;