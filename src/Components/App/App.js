import React from 'react';
import ReactDOM from 'react-dom';
import SearchBar from '../SearchBar/SearchBar'
import SearchResults from '../SearchResults/SearchResults'
import Playlist from '../Playlist/Playlist'
import Spotify from '../../util/Spotify';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // searchResults: [{name : 'Tera Yaar hoon main', artist : 'Arijit Singh', album : 'Sonu ke Tittu ki Sweety', id : 1 }, 
      //   {name : 'Dhaaga', artist : 'Nilotpal Bora', album : 'Aspirants', id : 2 }, 
      //   {name : 'Ranjha', artist : 'Jasleen Royal', album : 'Shershaah', id : 3 }],

        searchResults: [],
        playlistName : "Have fun",
        playlistTracks: []
        // playlistTracks : [{name : 'Kasoor', artist : 'Prateek Kuhad', album : 'kasoor', id : 4 }, 
        // {name : 'Koi Kahe Kehta Rahe', artist : 'Shankar Mahadevan, Shaan, KK', album : 'Dil Chahta Hai', id : 5 }]
    }
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;

    if(tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }

    tracks.push(track);
    this.setState({playlistTracks : tracks});

  }

  removeTrack(track) {
    let tracks = this.state.playlistTracks;
    tracks = tracks.filter(currTrack => currTrack.id !== track.id);
    this.setState({playlistTracks : tracks});
  }

  updatePlaylistName(name) {
    this.setState({playlistName : name});
  }

  savePlaylist() {
    let trackURIs = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({
        playlistName : 'New Playlist',
        playlistTracks : []
      })
    })
  }

  search(term) {
    //console.log(term);
    Spotify.search(term).then(searchResults => {
      this.setState({searchResults : searchResults})
    })
  }
 
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch = {this.search} />
         <div className="App-playlist">
           <SearchResults searchResults = {this.state.searchResults} onAdd = {this.addTrack}  />
           <Playlist playlistName = {this.state.playlistName} playlistTracks = {this.state.playlistTracks} onRemove = {this.removeTrack} onNameChange = {this.updatePlaylistName} 
            onSave = {this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         {/* <img src={logo} className="App-logo" alt="logo" /> */}
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;
