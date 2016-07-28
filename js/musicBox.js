	var playing_resultats = -1;
	var playing_llista = -1;
	var playing_populars = -1;

	var Artist = function (id_artist, name_artist, url_imatge) {
	    this.id_artist = id_artist;
	    this.name_artist = name_artist;
	    this.url_imatge = url_imatge;
	}

	var Album = function (id_album, name_album, url_imatge) {
	    this.id_album = id_album;
	    this.name_album = name_album;
	    this.url_imatge = url_imatge;
	}

	var Song = function (SongObj) {
	    this.id_song = SongObj.id_song;
	    this.name_song = SongObj.name_song;

	    this.url_imatge = SongObj.url_imatge;

	    var artistsInfo = [];
	    var artists_length = SongObj.artists.length;
	    for (var i=0; i<artists_length; i++) {
	        artistsInfo.push(new Artist (SongObj.artists[i].id,SongObj.artists[i].name));
	    }

	    this.album = new Album(SongObj.album.id, SongObj.album.name, SongObj.album.url);
	    this.artists = artistsInfo;
	    this.num_plays = SongObj.num_plays;
	    this.preview_url = SongObj.preview_url;
	}

	var resultats = [];

	var llistaReproduccio = [];

	var cançonsPopulars = [];

	gestionaSong = function(tipus, selector, id) {
		var divContainer = document.getElementById(selector);
		var div = divContainer.childNodes[id];
		var audio = div.childNodes[3];

		switch (tipus) {
			case 'play':
				audio.play();

				var canço;

				// es suma el número de reproduccions al llistat corresponent
				switch (selector) {
		    		case 'container-resultats':
		    			//cançonsGuardades.push(resultats[id]);
		    			resultats[id].num_plays ++;
		    			canço = resultats[id];
		    		break;
		    		case 'container-llista':
		    			//cançonsGuardades.push(llistaReproduccio[id]);
		    			llistaReproduccio[id].num_plays ++;
		    			canço = llistaReproduccio[id];
		    		break;
		    		case 'container-popular':
		    			//cançonsGuardades.push(cançonsPopulars[id]);
		    			cançonsPopulars[id].num_plays ++;
		    			canço = cançonsPopulars[id];
		    		break;
		    	}

				Caratula.mostra(canço);

				Data.save(canço);

				break;
			case 'pause':
				audio.pause();

				break;
			case 'stop':
				audio.pause();
				audio.currentTime = 0;

				break;
		}

	}

	/**
	 * @function
	 * @name swap
	 * @description Swap two elements in an array
	 * @param {array} myArr The target array.
	 * @param {int} indexOne The index of the first element to swap.
	 * @param {int} indexTwo The index of the second element to swap.
	 * @returns {array} The array with the two elements swapped.
	 */
	function swap(myArr, indexOne, indexTwo){
	  var tmpVal = myArr[indexOne];
	  myArr[indexOne] = myArr[indexTwo];
	  myArr[indexTwo] = tmpVal;
	  return myArr;
	}

	function bubbleSort(myArr){
	  var size = myArr.length;
	 
	  for( var pass = 1; pass < size; pass++ ){ // outer loop
	    for( var left = 0; left < (size - pass); left++){ // inner loop
	      var right = left + 1;
	      if( myArr[left].num_plays < myArr[right].num_plays ){
	        swap(myArr, left, right);
	      }
	    }
	  }

	  return myArr;
	}

	/*Get most played songs*/
	function getMostPlayedSongs (llistatCansons) {

		//només es retornen les dues cançons amb més reproduccions
	    return bubbleSort(llistatCansons).slice(0,2);

	}

	var Data = {
	    //guardar info en el navegador con localStorage o indexedDB
	    save: function (song) {

	    	var cansonsGuardades = this.get();

	    	if (cansonsGuardades !== false) {
	    		var boolSongJaGuarada = false;

	    		cansonsGuardades = JSON.parse(cansonsGuardades);
	    		var cansonsGuardades_length = cansonsGuardades.length;
	    		for (var i = 0; i < cansonsGuardades_length; i ++) {
	    			if (cansonsGuardades[i].id_song === song.id_song) {
	    				song.num_plays = 1 + cansonsGuardades[i].num_plays;
	    				cansonsGuardades[i] = song;
	    				boolSongJaGuarada = true;
	    			}
	    		}

	    		if (!boolSongJaGuarada) {
	    			cansonsGuardades.push(song);

	    		}

	    	} else {
	    		cansonsGuardades = [];
	    		cansonsGuardades.push(song);
	    	}

		    console.log("Saved to localStorage");
		    localStorage.setItem("llistatCansons", JSON.stringify(cansonsGuardades));
	    	
	    },
	    //para obtener la info guardada
	    get: function () {
	       
	        if (localStorage.getItem("llistatCansons")) {

	            return localStorage.getItem("llistatCansons");
	        }

	        return false;
	    }
	}

	var AJAX = {
	    request: function(url){
	        var xhr = new XMLHttpRequest();
	        xhr.open("GET", url, false);
	        xhr.send();

	        return xhr.responseText;
	    },
	    request2: function (url, successCallback) {
	        var xhttp = new XMLHttpRequest();
	        xhttp.onreadystatechange = function() {
	            if (xhttp.readyState == xhttp.DONE && xhttp.status == 200) {
	              successCallback(xhttp.responseText);
	            }
	        };
	        xhttp.open("GET", url, true);
	        xhttp.send();
	    }
	}

	var Spotify = {
	    getInfoUrl: function(info_search, type) {
	        type = type || 'track';
	        return 'https://api.spotify.com/v1/search?query='+info_search+'&offset=0&limit=20&type='+type;
	    },
	    getRelatedArtists: function (id) {
	        return 'https://api.spotify.com/v1/artists/' + id + '/related-artists';
	    },
	    getTopTracksByIdArtist: function(id) {
	        return 'https://api.spotify.com/v1/artists/' + id + '/top-tracks?country=SE';
	    },
	    getTopTracks: function () {
	        return "https://www.googleapis.com/youtube/v3/videos?chart=MostPopular&videoCategoryId=10&key=AIzaSyA1kTuRYqrSjbUM4CLsNbdQ37hjQiTUkrs&maxResults=20&part=snippet,player";
	    }
	}

	var Player = {
		play: function play(playButton) {
			playButton.addEventListener("click", function(event) {
				var id = event.path[1].id;
				console.log("play");

				var selector = event.path[2].id;

				if (selector === 'container-resultats') {
					//Si hi ha alguna song reproduint-se
					if (playing_resultats !== -1 && playing_resultats !== id) {
						gestionaSong('stop', 'container-resultats', playing_resultats);
					}

					if (playing_llista !== -1) {
						gestionaSong('stop', 'container-llista', playing_llista);
					}

					if (playing_populars !== -1) {
						gestionaSong('stop', 'container-popular', playing_populars);
					}

					gestionaSong('play', 'container-resultats', id);
					playing_resultats = id;

				} else if (selector === 'container-llista') {
					//Si hi ha alguna song reproduint-se
					if (playing_llista !== -1 && playing_llista !== id) {
						gestionaSong('stop', 'container-llista', playing_llista);
					}

					if (playing_resultats !== -1) {
						gestionaSong('stop', 'container-resultats', playing_resultats);
					}


					if (playing_populars !== -1) {
						gestionaSong('stop', 'container-popular', playing_populars);
					}

					gestionaSong('play', 'container-llista', id);
					playing_llista = id;

				} else if (selector === 'container-popular') {
					
					//Si hi ha alguna song reproduint-se
					if (playing_populars !== -1 && playing_populars !== id) {
						gestionaSong('stop', 'container-popular', playing_populars);
					}

					if (playing_resultats !== -1) {
						gestionaSong('stop', 'container-resultats', playing_resultats);
					}

					if (playing_llista !== -1) {
						gestionaSong('stop', 'container-llista', playing_llista);
					}

					gestionaSong('play', 'container-popular', id);
					playing_populars = id;

				}
				
			});

	    },
	    pause: function pause(pauseButton) {
			pauseButton.addEventListener("click", function(event) {
				var id = event.path[1].id;
				console.log("pause");

				var selector = event.path[2].id;

				gestionaSong('pause', selector, id);

				
			});
	    },
	    stop: function stop(stopButton) {
	    	stopButton.addEventListener("click", function(event) {
	    		var id = event.path[1].id;
				console.log("stop");

				var selector = event.path[2].id;

				gestionaSong('stop', selector, id);

				if (selector === 'container-resultats') {

					if (playing_resultats === id) {
						playing_resultats = -1;
					}

				} else if (selector === 'container-llista') {
					if (playing_llista === id) {
						playing_llista = -1;
					}
				}
				
	    	});
	    }
	}

	Caratula = {
		mostra: function mostra(canço) {

			var divCaratula = document.getElementById("fixed-cover");
			divCaratula.style.zIndex = "1";
			divCaratula.innerHTML = "";

			var divFoto = document.createElement("div");
			divFoto.setAttribute("class", "foto");

			var mides = {width: "200px", height: "200px"};
			var imatgeCaratula = createHtmlImatgeSong("img-responsive", mides, canço.url_imatge);
			
			var nomSongCaratula = createHtmlText('p', canço.name_song);

			divFoto.appendChild(imatgeCaratula);
			divFoto.appendChild(nomSongCaratula);

			divCaratula.appendChild(divFoto);
		},
		amaga: function amaga() {
			var divCaratula = document.getElementById("fixed-cover");
			divCaratula.style.zIndex = "1";
			divCaratula.innerHTML = "";
		}
	}

	Listener = {
		endSong: function endSong(audio, selector) {
			selector || '';
			audio.onended = function(){

				if (selector === 'container-llista') {
					var long_llista = llistaReproduccio.length;

					playing_llista = parseInt(playing_llista);

					if (playing_llista < long_llista-1) {
						playing_llista = parseInt(playing_llista) + 1;
					} else if (playing_llista === long_llista-1) {
						playing_llista = 0;
					}
						
					gestionaSong('play', 'container-llista', playing_llista);
				} else {
					Caratula.amaga();
				}

			}
		},
		addToPlayList: function addToPlayList(addButton) {
			addButton.addEventListener("click", function(event) {
				console.log("add");

				var id = event.path[1].id;

				if (event.path[2].id === 'container-popular') {
					llistaReproduccio.push(cançonsPopulars[id]);

				} else if (event.path[2].id === 'container-resultats') {
					llistaReproduccio.push(resultats[id]);
				}

				creaLlistat(llistaReproduccio, 'container-llista');

			});
		}
	}

	createHtmlText = function(element, text_r) {
		var text = document.createElement(element);
		text.innerHTML = text_r;
		return text;
	}

	createHtmlAudio = function(src) {
		var audio = document.createElement('audio');
		audio.src = src;
		return audio;
	}

	createHtmlIcon = function(classeCss) {
		var icon = document.createElement("i");
        icon.setAttribute("class",classeCss);
        icon.style.marginLeft = "10px";
        return icon;
	}

	createHtmlImatgeSong = function(classeCss, mides, url) {
		var img = document.createElement("img");
    	img.setAttribute("class",classeCss);
    	img.style.width = mides.width;
    	img.style.height = mides.height;
    	img.src = url;
    	return img;
	}

	creaLlistat = function(objecteDades, containerDesti) {

		objecteDades = objecteDades || [];
		containerDesti = containerDesti || 'container-resultats';

		var long_dades = objecteDades.length;

		var divContainer = document.getElementById(containerDesti);
		divContainer.innerHTML = "";

		for (var i=0; i < long_dades; i ++) {

			var divSong = document.createElement('div');
			divSong.setAttribute("id",i);
			divSong.setAttribute("class", "item");

			var nom_song = createHtmlText('h3', objecteDades[i].name_song);
			var nom_artist = createHtmlText('h4', objecteDades[i].artists[0].name_artist);

			var mides = {width: "300px", height: "300px"};

			var audio = createHtmlAudio(objecteDades[i].preview_url);

			// S'afageix el Listener onEnded a l'audio en cas que es tracti del llistat de reproducció
			if (containerDesti !== 'container-resultats' && containerDesti !== 'container-popular') {
				Listener.endSong(audio, 'container-llista');	
				mides = {width: "150px", height: "150px"};
			} else {
				Listener.endSong(audio);	
			}

			var imatge = createHtmlImatgeSong("img-responsive",mides,objecteDades[i].url_imatge);

            var playButton = createHtmlIcon('fa fa-play');
            Player.play(playButton);

            var pauseButton = createHtmlIcon('fa fa-pause');
            Player.pause(pauseButton);

           	var stopButton = createHtmlIcon('fa fa-stop');
            Player.stop(stopButton);

			divSong.appendChild(nom_song);
			divSong.appendChild(nom_artist);
			divSong.appendChild(imatge);
			divSong.appendChild(audio);
			divSong.appendChild(playButton);
			divSong.appendChild(pauseButton);
			divSong.appendChild(stopButton);

            if (containerDesti !== 'container-llista') {
            	var addToPlayListButton = createHtmlIcon('fa fa-plus');
            	Listener.addToPlayList(addToPlayListButton);
           		divSong.appendChild(addToPlayListButton);
            }

			divContainer.appendChild(divSong);

		}
	}

	var MusicRecommender = {
		search: function search() {
			resultats = []; // s'inicialitza per una nova cerca
			// si hi havia alguna cançó aturada i es fa una nova cerca s'elimina la seva caràtula
			if (playing_llista === -1 && playing_resultats === -1 && playing_populars === -1) {
				Caratula.amaga();		
			}
			var responseItems = [];
			var cerca = document.getElementById("query").value;
			var id_artista_cerca = '';

			// Si l'input de cerca no està buit
			if (cerca !== "") {

				// Es fa la petició a Spotify de la cerca realitzada per l'usuari
				var response = JSON.parse(AJAX.request(Spotify.getInfoUrl(cerca)));

				if (response !== null) {
					responseItems = response.tracks.items;
					id_artista_cerca = responseItems[0].artists[0].id;

					var num_tracks = responseItems.length;

					for (var i = 0; i < num_tracks; i ++) {

						var SongObj = {
							id_song: responseItems[i].id,
							name_song: responseItems[i].name,
							artists: responseItems[i].artists,
							album: responseItems[i].album,
							num_plays: 0,
							preview_url: responseItems[i].preview_url,
							url_imatge: responseItems[i].album.images[0].url
						}

			            var song = new Song(SongObj);

			            resultats.push(song);
			        }

			        creaLlistat(resultats);

			    }

		    	this.similarSongs(id_artista_cerca);

		    }

		},
		similarSongs: function similarSongs(id_artist) {
	        var prova_resposta = JSON.parse(AJAX.request(Spotify.getRelatedArtists(id_artist)));
  
        	var divSimilars = document.getElementById("container-similar-artists");
			creaLlistatSenzill(prova_resposta.artists);

		},
		popularSongs: function popularSongs() {

			var cansonsGuardades = Data.get();

			// l'usuari ja ha escoltat cançons i no caldrà buscar les més populars
	    	if (cansonsGuardades !== false) {

	    		cansonsGuardades = JSON.parse(cansonsGuardades);
				var mostPlayedSongs = getMostPlayedSongs(cansonsGuardades);

	  			var songsRecomenades = [];


	            if (mostPlayedSongs.length > 0) {
	                var recomenacionsArtista1 = JSON.parse(AJAX.request(Spotify.getRelatedArtists(mostPlayedSongs[0].artists[0].id_artist)));

	                var recomenacionsArtista1v2 = JSON.parse(AJAX.request(Spotify.getTopTracksByIdArtist(recomenacionsArtista1.artists[0].id)));

	            	songsRecomenades = recomenacionsArtista1v2.tracks.slice(0,20);

	                if (mostPlayedSongs.length > 1) {
		                var recomenacionsArtista2 = JSON.parse(AJAX.request(Spotify.getRelatedArtists(mostPlayedSongs[1].artists[0].id_artist)));
		            	
		            	var recomenacionsArtista2v2 = JSON.parse(AJAX.request(Spotify.getTopTracksByIdArtist(recomenacionsArtista2.artists[0].id)));

		                songsRecomenades.slice(0,10);

		                songsRecomenades = songsRecomenades.concat(recomenacionsArtista2v2.tracks.slice(0,10));
		            }

	            }

	  			var num_recomenades = songsRecomenades.length;
	  			cançonsPopulars = [];

            	for (var i = 0; i < num_recomenades; i ++) {

					var SongObj = {
						id_song: songsRecomenades[i].id,
						name_song: songsRecomenades[i].name,
						artists: songsRecomenades[i].artists,
						album: songsRecomenades[i].album,
						num_plays: 0,
						preview_url: songsRecomenades[i].preview_url,
						url_imatge: songsRecomenades[i].album.images[0].url
					}

		            var song = new Song(SongObj);


		            cançonsPopulars.push(song);
		        }
				
				creaLlistat(cançonsPopulars, 'container-popular');

	    	} else {
				cançonsPopulars = [];
				var i;
		        var topTracks = JSON.parse(AJAX.request(Spotify.getTopTracks()));

	    		var resultats_length = topTracks.items.length;

				for (i = 0; i < resultats_length; i ++) {
					var cerca = topTracks.items[i].snippet.tags[0] + ' ' + topTracks.items[i].snippet.tags[1];
					var response = JSON.parse(AJAX.request(Spotify.getInfoUrl(cerca)));
					var responseItems = response.tracks.items;

					if ((responseItems[0] !== undefined) && (responseItems.length !== 0)) {

						var SongObj = {
							id_song: responseItems[0].id,
							name_song: responseItems[0].name,
							artists: responseItems[0].artists,
							album: responseItems[0].album,
							num_plays: 0,
							preview_url: responseItems[0].preview_url,
							url_imatge: responseItems[0].album.images[0].url
						}

				        var song = new Song(SongObj);

				    	cançonsPopulars.push(song);

					} 
				}

				creaLlistat(cançonsPopulars, 'container-popular');
	    	}

		}
	}

	creaLlistatSenzill = function(objecteDades, containerDesti) {
		objecteDades = objecteDades || [];
		containerDesti = containerDesti || 'container-similar-artists';

		var long_dades = objecteDades.length;

		var divContainer = document.getElementById(containerDesti);
		divContainer.innerHTML = "";

		for (var i=0; i < long_dades; i ++) {
			
			var divSong = document.createElement('div');
			divSong.setAttribute("class", "item");

			var nom_artist = createHtmlText('h4', objecteDades[i].name);

			var mides = {width: "300px", height: "300px"};
			
			divSong.appendChild(nom_artist);

			if (containerDesti === 'container-similar-artists') {
				var imatge = createHtmlImatgeSong("img-responsive",mides,objecteDades[i].images[0].url);
				divSong.appendChild(imatge);

			}

			divContainer.appendChild(divSong);
		}
	}

	$(document).ready(function(e){

		/* quan el document estigui carregat es cerquen les cançons més populars
		a youtube o bé en funció de les reproduccions guardades al localStorage */
		MusicRecommender.popularSongs();

    	creaLlistat(resultats);
		creaLlistat(llistaReproduccio, 'container-llista');

	});