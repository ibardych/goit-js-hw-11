import axios from 'axios';
import { pixabayApiKey } from './api-keys';

const requestPixabayImages = async ({ query, pageNumber, imagesPerPage }) => {
  return await axios.get(
    `https://pixabay.com/api/?key=${pixabayApiKey}&q=${query}&image_type=photo&page=${pageNumber}&per_page=${imagesPerPage}&orientation=horizontal&safesearch=true`
  );
};

export { requestPixabayImages };
