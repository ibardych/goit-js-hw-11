import _ from 'lodash';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import htmlPatterns from './js/html-patterns';
import Pagination from './js/pagination';
import { requestPixabayImages } from './js/requests';

const refs = {
  searchFormEl: document.querySelector('.header__search-form'),
  searchInputEl: document.querySelector('.header__search'),
  gallery: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
  loadMoreButton: document.querySelector('.load-more'),
  autoLoadToggler: document.querySelector('.toggler'),
};

const IMAGES_PER_PAGE = 40;

const lightBox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

const pagination = new Pagination(IMAGES_PER_PAGE);

const throttledLoadNextPage = _.throttle(
  () => pagination.loadNextPage(requestImages),
  300
);

refs.searchFormEl.addEventListener('submit', searchForImages);

refs.autoLoadToggler.addEventListener('click', () => {
  const { pageNumber, autoLoadImages } = pagination;

  refs.autoLoadToggler.classList.toggle('active');

  pagination.autoLoadImages = !autoLoadImages;

  if (!pagination.autoLoadImages && pageNumber > 1) {
    refs.loadMoreButton.classList.add('visible');
    return;
  }

  refs.loadMoreButton.classList.remove('visible');
  pagination.loadNextPage(requestImages);
});

refs.loadMoreButton.addEventListener('click', () => {
  refs.loadMoreButton.classList.remove('visible');
  requestImages();
});

refs.searchInputEl.addEventListener('focus', () => {
  refs.searchInputEl.classList.add('focused');
});

refs.searchInputEl.addEventListener('blur', () => {
  if (!refs.searchInputEl.value.trim()) {
    refs.searchInputEl.classList.remove('focused');
  }
});

function searchForImages(e) {
  e.preventDefault();

  refs.gallery.innerHTML = '';
  pagination.reachedEnd = false;

  pagination.pageNumber = 1;
  pagination.query = refs.searchInputEl.value
    .replace(/[&?=]/g, '')
    .toLowerCase()
    .trim();

  document.addEventListener('scroll', throttledLoadNextPage);

  requestImages();
}

function requestImages() {
  if (checkEndOfSearchResults()) return;

  refs.loader.classList.add('visible');

  requestPixabayImages(pagination)
    .then(response => {
      const { totalHits, hits: images } = response.data;

      if (!totalHits) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      if (pagination.pageNumber === 1) {
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        pagination.pagesNumber = Math.ceil(totalHits / IMAGES_PER_PAGE);
      }

      showImages(images);
    })
    .catch(error => console.log(error))
    .finally(() => {
      pagination.fetchingImages = false;
      refs.loader.classList.remove('visible');
    });
}

function showImages(images) {
  const galleryItems = images.map(item => htmlPatterns.createGalleryItem(item));

  refs.gallery.insertAdjacentHTML('beforeend', galleryItems.join(''));

  checkIfAutoload();

  lightBox.refresh();

  pagination.pageNumber += 1;
}

function addSmoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  if (pagination.pageNumber > 1) {
    window.scrollBy({
      top: (cardHeight + 20) * 2,
      behavior: 'smooth',
    });
  }
}

function checkIfAutoload() {
  const { pageNumber, pagesNumber, autoLoadImages } = pagination;

  if (autoLoadImages) {
    refs.loadMoreButton.classList.remove('visible');
    return;
  }

  addSmoothScroll();

  if (pageNumber <= pagesNumber) refs.loadMoreButton.classList.add('visible');
}

function checkEndOfSearchResults() {
  const { pageNumber, pagesNumber } = pagination;

  if (pageNumber > pagesNumber && pagesNumber) pagination.reachedEnd = true;

  if (pagination.reachedEnd) {
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
    refs.loadMoreButton.classList.remove('visible');
    document.removeEventListener('scroll', throttledLoadNextPage);
  }

  return pagination.reachedEnd;
}
