import './main.scss';
import refs from './js/refs'; /* ждём, пока у нас появятся все нужные имена классов для querySelector */
import ApiService from './js/api';
const debounce = require('lodash.debounce');
import { pluginError } from './js/pluginOn';
import './js/theme-switch';
import './js/back-to-top';
import './js/firebase-login';

const Api = new ApiService();

function loadPage() {
  Api.loadQueueMoviesList();
  Api.loadWatchedMoviesList();
  const currentPage = document.getElementsByTagName('html')[0];
  if (currentPage.classList.contains('main-page')) {
    fetchPopularMoviesList();
    refs.searchInput.addEventListener('input', debounce(onSearch, 500));
  }
  if (currentPage.classList.contains('library-page')) {
    refs.loadWatchedBtn.addEventListener('click', loadWatched);
    refs.loadQueueBtn.addEventListener('click', loadQueue);
    loadWatched(); //по умолчанию, отрисовываются просмотренные фильмы
  }
}

function openModal(event) {
  if (!event.target.classList.contains('movie-card__img')) return;
  const movieId = event.target.dataset.movieId;
  Api.fetchModalMovie(movieId)
    .then(singleMovieAdapterRender)
    .then(() => {
      refs.movieInfoModal.classList.toggle('is-hidden');
      modalListenersOn();
    });
}

function closeModal() {
  refs.movieInfoModal.classList.toggle('is-hidden');
  modalListenersOff();
  refs.movieInfoModal.innerHTML = '';
}

function modalListenersOn() {
  document.querySelector('[data-add-watched]').addEventListener('click', Api.addWatchedMovies);
  document.querySelector('[data-add-queue]').addEventListener('click', Api.addQueueMovies);
  document.querySelector('.modal-close-btn').addEventListener('click', closeModal);
  window.addEventListener('keydown', escCloseModal);
}

function modalListenersOff() {
  document.querySelector('[data-add-watched]').removeEventListener('click', Api.addWatchedMovies);
  document.querySelector('[data-add-queue]').removeEventListener('click', Api.addQueueMovies);
  window.removeEventListener('keydown', escCloseModal);
}

function escCloseModal(event) {
  if (event.code === 'Escape') closeModal();
}

//Функция запроса популярных фильмов и отрисовка галлереи карточек - запускается при загрузке главной страницы
function fetchPopularMoviesList() {
  clear();
  Api.resetPage();
  Api.fetchPopularMoviesList().then(movies => movieAdaptedandRender(movies));
}

//Функция поиска фильмов по слову - запускается по вводу в инпуте
function onSearch(event) {
  event.preventDefault();
  clear();
  refs.spinnerWrap.classList.remove('is-hidden');
  Api.resetPage();
  Api.searchQuery = event.target.value;
  console.log('Api.searchQuery:', Api.searchQuery); //что ищем???
  if (!Api.searchQuery) {
    return fetchPopularMoviesList();
  }
  Api.fetchSearchMoviesList(Api.searchQuery).then(movies => {
    movieAdaptedandRender(movies);
    if (!movies.total_results) {
      return pluginError();
    }
  });
}

//Функция очистки галлереи фильмов
function clear() {
  refs.moviesCardsGallery.innerHTML = '';
}
//Функция адаптации пути img и отрисовка
function movieAdaptedandRender(movies) {
  if ('results' in movies) {
    const moviesArray = movies.results.map(movie => Api.movieAdapter(movie));
    return Api.renderMovieCards(moviesArray);
  }
  const moviesArray = movies.map(movie => Api.movieAdapter(movie));
  return Api.renderMovieCards(moviesArray);
}

function singleMovieAdapterRender(movie) {
  console.log(movie);
  const singlemovieData = Api.movieAdapter(movie);
  return Api.renderSingleMovie(singlemovieData);
}

function loadWatched() {
  clear();
  Api.resetPage();
  refs.loadWatchedBtn.classList.add('active-btn');
  refs.loadQueueBtn.classList.remove('active-btn');
  console.log('отрисовать просмотренные фильмы');
  Api.fetchWatchedMovies()
    .then(movies => movies.map(movie => Api.fetchMovieByID(movie)))
    .then(movies => Promise.all(movies))
    .then(movieAdaptedandRender)
    .then(console.log);
}

function loadQueue() {
  clear();
  Api.resetPage();
  refs.loadWatchedBtn.classList.remove('active-btn');
  refs.loadQueueBtn.classList.add('active-btn');
  console.log('отрисовать фильмы добавленные в очередь пользователя');
  Api.fetchQueueMovies()
    .then(movies => movies.map(movie => Api.fetchMovieByID(movie)))
    .then(movies => Promise.all(movies))
    .then(movieAdaptedandRender)
    .then(console.log);
}

window.addEventListener('load', loadPage);
refs.moviesCardsGallery.addEventListener('click', openModal);
refs.movieInfoModal.addEventListener('click', event => {
  if (event.target === event.currentTarget) closeModal();
});
