import _ from 'lodash';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import htmlPatterns from './js/html-patterns';
import { pixabayApiKey } from './js/api-keys';

const searchInputEl = document.querySelector('.header__search');
const searchFormEl = document.querySelector('.header__search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const autoLoadToggler = document.querySelector('.toggler');

const imagesPerPage = 40;
let pageNumber = 1;
let pagesNumber = 0;
let fetchingImages = false;
let autoLoadImages = true;
let smoothScroll = false;

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

const fetchImages = () => {
  if (pageNumber > pagesNumber && pagesNumber && loadMoreButton.offsetTop) {
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
    loadMoreButton.classList.remove('visible');
    return;
  }

  const searchQuery = searchInputEl.value
    .replace(/[&?=]/g, '')
    .toLowerCase()
    .trim();

  loadImages(searchQuery);
};

const loadImages = async searchQuery => {
  try {
    const { data } = await axios.get(
      `https://pixabay.com/api/?key=${pixabayApiKey}&q=${searchQuery}&image_type=photo&page=${pageNumber}&per_page=${imagesPerPage}&orientation=horizontal&safesearch=true`
    );

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
    pageNumber += 1;

    showImages(hits, smoothScroll);

    loadMoreButton.classList.add('visible');
  } catch (error) {
    console.error(error);
  } finally {
    fetchingImages = false;
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
    smoothScroll = false;
    fetchingImages = true;
    fetchImages();
  }
};

const throttledLoadNextPage = _.throttle(loadNextPage, 300);

document.addEventListener('scroll', throttledLoadNextPage);

loadMoreButton.addEventListener('click', () => {
  smoothScroll = true;
  fetchingImages = true;
  fetchImages();
});
