let accessToken;

const TOKEN = "https://accounts.spotify.com/api/token";


const clientId = "260ae191a73347388f0906143e73f889";
const clientSecret = "01204551aceb4658a34da9212418d490";

const Spotify = {
    async getAccessToken() {

        if(accessToken) {
            return accessToken;
        }

        const result = await fetch(TOKEN, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        accessToken = data.access_token;
        return accessToken;
    },

    async search(term) {
        const accessToken = await Spotify.getAccessToken();

        const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const jsonResponse = await response.json();
        if (!jsonResponse.tracks) {
            return [];
        }
        return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
        }));

    }, 

    async savePlaylist(name, trackURIs) {
        if(!name || !trackURIs.length) {
            return;
        }

        const accessToken = await Spotify.getAccessToken();
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const jsonResponse = await response.json();
        const userId = await jsonResponse.id;


        return await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers : {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method : 'POST',
                body: JSON.stringify({name : name})
            }).then(response => response.json()).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    method: 'POST',
                    body: JSON.stringify({uris : trackURIs})
                })
            });



    }
}

export default Spotify;