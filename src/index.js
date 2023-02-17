import _ from 'lodash';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import htmlPatterns from './js/html-patterns';

const searchInputEl = document.querySelector('.header__search');
const searchFormEl = document.querySelector('.header__search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const autoLoadToggler = document.querySelector('.toggler');
let pageNumber = 1;
let pagesNumber = 0;
let imagesPerPage = 40;
let fetchingImages = false;
let autoLoadImages = true;

autoLoadToggler.addEventListener('click', () => {
  autoLoadToggler.classList.toggle('active');
  autoLoadImages = !autoLoadImages;
});

searchInputEl.addEventListener('focus', () => {
  searchInputEl.classList.add('focused');
});

searchInputEl.addEventListener('blur', () => {
  if (!searchInputEl.value.trim()) {
    searchInputEl.classList.remove('focused');
  }
});

const searchForImages = event => {
  event.preventDefault();

  pageNumber = 1;
  pagesNumber = 0;
  gallery.innerHTML = '';

  fetchImages();
};

const fetchImages = async (smoothScroll = false) => {
  if (pageNumber > pagesNumber && pagesNumber && loadMoreButton.offsetTop) {
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
    loadMoreButton.classList.remove('visible');
    return;
  }

  const apiKey = '15913517-154f460f1c5b34bd445285f2e';

  fetchingImages = true;

  const search = searchInputEl.value
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toLowerCase()
    .trim();

  console.log('Query:', search);

  try {
    const { data } = await axios.get(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
        search
      )}&image_type=photo&page=${pageNumber}&per_page=${imagesPerPage}&orientation=horizontal&safesearch=true`
    );
    console.log(data);

    const { totalHits, hits } = data;

    if (!totalHits) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (pageNumber === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    pagesNumber = Math.ceil(totalHits / imagesPerPage);

    console.log('Page number:', pageNumber);

    pageNumber += 1;

    showImages(hits, smoothScroll);

    loadMoreButton.classList.add('visible');

    fetchingImages = false;
  } catch (error) {
    console.error(error);
  }
};

searchFormEl.addEventListener('submit', searchForImages);

const lightBox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

const showImages = (images, smoothScroll) => {
  const items = images.map(item => {
    return htmlPatterns.createGalleryItem(item);
  });
  gallery.insertAdjacentHTML('beforeend', items.join(''));

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  if (pageNumber > 2 && smoothScroll) {
    window.scrollBy({
      top: (cardHeight + 20) * 2,
      behavior: 'smooth',
    });
  }

  lightBox.refresh();
};

const loadNextPage = () => {
  if (
    document.documentElement.scrollTop + window.innerHeight >
      loadMoreButton.offsetTop &&
    loadMoreButton.offsetTop &&
    !fetchingImages &&
    autoLoadImages
  ) {
    fetchImages();
  }
};

const ThrottledLoadNextPage = _.throttle(loadNextPage, 300);

document.addEventListener('scroll', ThrottledLoadNextPage);

loadMoreButton.addEventListener('click', () => {
  fetchImages(true); // true => smooth scroll
});
