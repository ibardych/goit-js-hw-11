class Pagination {
  query = '';
  pageNumber = 0;
  pagesNumber = 0;
  fetchingImages = false;
  autoLoadImages = true;
  reachedEnd = false;

  gallery = document.querySelector('.gallery');

  constructor(imagesPerPage) {
    this.imagesPerPage = imagesPerPage;
  }

  loadNextPage(requestImages) {
    if (
      document.documentElement.scrollTop + window.innerHeight >
        this.gallery.offsetHeight - 200 &&
      !this.fetchingImages &&
      this.autoLoadImages &&
      this.pageNumber > 1
    ) {
      requestImages();
    }
  }
}

export default Pagination;
