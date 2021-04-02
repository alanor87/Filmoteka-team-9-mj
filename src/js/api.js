const API_KEY = 'e25e680121e89083bb4ba7c0772c65fc';
const BASE_URL_TRENDING = 'https://api.themoviedb.org/3/trending/all/day';
const BASE_URL_SEARCH = 'https://api.themoviedb.org/3/search/movie';
const BASE_URL_MOVIEID = 'https://api.themoviedb.org/3/movie';
const POSTER_URL = 'https://themoviedb.org/t/p/w220_and_h330_face';
const watchedFromLocalStorage = [];
const queueFromLocalStorage = [];

import movieCard from '../templates/movieCard.hbs';
import modalMovieCard from '../templates/modal-movie-card.hbs';
import refs from './refs';

export default class ApiService {
  constructor() {
    this.page = 1;
    this.searchQuery = '';
  }

  movieAdapter({
    poster_path,
    original_title,
    original_name,
    vote_average,
    vote_count,
    release_date,
    first_air_date,
    popularity,
    id,
    genres,
    overview,
  }) {
    return {
      //имена imgSrc, title, rating, releaseDate СВЕРИТЬ с именами в ПРАВИЛЬНОМ шаблоне карточки
      imgSrc: this.generatePosterPath(poster_path),
      title: original_title || original_name,
      rating: vote_average,
      totalVotes: vote_count,
      releaseDate: release_date || first_air_date,
      id,
      popularity,
      genres,
      overview,
    };
  }

  generatePosterPath(imageName) {
    return `${POSTER_URL}${imageName}`;
  }

  fetchMovieByID(movieId) {
    return fetch(`${BASE_URL_MOVIEID}/${movieId}?api_key=${API_KEY}`).then(
      response => {
        if (response.status === '404') throw new Error();
        return response.json();
      },
    );
  }

  fetchSearchMoviesList(query) {
    return fetch(`${BASE_URL_SEARCH}?api_key=${API_KEY}&query=${query}`)
      .then(responce => responce.json());
  }

  fetchPopularMoviesList() {
    return fetch(`${BASE_URL_TRENDING}?api_key=${API_KEY}&page=${this.page}`)
      .then(response => response.json())
      .then(movies => {
        this.incrementPage();
        return movies;
      });
  }

  fetchModalMovie(movieId) {
    return fetch(`${BASE_URL_MOVIEID}/${movieId}?api_key=${API_KEY}`).then(responce => responce.json());
  }

  fetchWatchedMovies() {
    if (watchedFromLocalStorage.length !== 0) {
      return Promise.resolve(watchedFromLocalStorage);
    }
  }

  fetchQueueMovies() {
    if (queueFromLocalStorage.length !== 0) {
      return Promise.resolve(queueFromLocalStorage);
    }
  }

  loadWatchedMoviesList() {
    if (localStorage["watched"]) {
      const watched = localStorage.getItem('watched');
      console.log(watched);
      watchedFromLocalStorage.push(...JSON.parse(watched));
    }
    else {
      console.log("nothing is watched");
    }
  }

  loadQueueMoviesList() {
    if (localStorage["queue"]) {
      const queue = localStorage.getItem('queue');
      console.log(queue);
      queueFromLocalStorage.push(...JSON.parse(queue));
    }
    else {
      console.log("nothing is queued");
    }
  }

  addWatchedMovies(event) {
    const movieId = event.target.dataset.movieId;
    if (!watchedFromLocalStorage.includes(movieId)) watchedFromLocalStorage.push(movieId);
    localStorage.setItem('watched', JSON.stringify(watchedFromLocalStorage));
    console.log(watchedFromLocalStorage);
  }

  addQueueMovies(event) {
    const movieId = event.target.dataset.movieId;
    if (!queueFromLocalStorage.includes(movieId)) queueFromLocalStorage.push(movieId);
    localStorage.setItem('queue', JSON.stringify(queueFromLocalStorage));
    console.log(queueFromLocalStorage);
  }

  renderMovieCards(moviesArray) {
    refs.spinnerWrap.classList.add('is-hidden');
    refs.moviesCardsGallery.insertAdjacentHTML(
      'beforeend',
      movieCard(moviesArray),
    );
  }

  renderSingleMovie(movieObj) {
    const modalMarkup = modalMovieCard(movieObj);
    console.log(modalMarkup);
    refs.movieInfoModal.insertAdjacentHTML('afterbegin', modalMarkup);
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}
