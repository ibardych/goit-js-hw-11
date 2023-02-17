const createGalleryItem = ({
  largeImageURL,
  likes,
  views,
  comments,
  downloads,
  tags,
}) => {
  return `
    <div class="photo-card">
      <a href="${largeImageURL}" class="photo-card__link">
        <div class="photo-card__image-wrapper">
          <div class="photo-card__image-container">
            <img class="photo-card__image" src="${largeImageURL}" alt="${tags}" loading="lazy" />
          </div>
        </div>
        <div class="photo-card__info">
          <p class="photo-card__info-item">
            <b>Likes</b>
            ${likes}
          </p>
          <p class="photo-card__info-item">
            <b>Views</b>
            ${views}
          </p>
          <p class="photo-card__info-item">
            <b>Comments</b>
            ${comments}
          </p>
          <p class="photo-card__info-item">
            <b>Downloads</b>
            ${downloads}
          </p>
        </div>
      </a>
    </div>
  `;
};

export default { createGalleryItem };
