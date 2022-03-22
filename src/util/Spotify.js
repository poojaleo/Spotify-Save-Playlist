let accessToken;
let refreshToken;

const TOKEN = "https://accounts.spotify.com/api/token";


const clientId = "260ae191a73347388f0906143e73f889";
const redirectURI = "https://spotifyplaylistsave.netlify.app/";
const clientSecret = "01204551aceb4658a34da9212418d490";

function getCode() {
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function handleAuthorizationResponse(){
    if ( this.status === 200 ){
        const data = JSON.parse(this.responseText);
        console.log(data);
        if ( data.access_token !== undefined ){
            accessToken = data.access_token;
            localStorage.setItem("accessToken", accessToken);
        }
        if ( data.refresh_token  !== undefined ){
            refreshToken = data.refresh_token;
            localStorage.setItem("refreshToken", refreshToken);
        }
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }

    return accessToken;
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientId + ":" + clientSecret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function fetchAccessToken( code ){

    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirectURI);
    body += "&client_id=" + clientId;
    body += "&client_secret=" + clientSecret;
    callAuthorizationApi(body);
}

const Spotify = {
    async getAccessToken() {

        if(accessToken) {
            return accessToken;
        }

        const result = await fetch('https://accounts.spotify.com/api/token', {
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