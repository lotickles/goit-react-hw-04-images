import React, { useState, useEffect, useCallback } from 'react';
import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import Loader from './Loader/Loader';
import { getAPI } from 'pixabay-api';
import css from './App.module.css';
import toast, { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const App = () => {
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEnd, setIsEnd] = useState(false);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getAPI(searchQuery, currentPage);
      const { totalHits, hits } = response;

      if (hits.length === 0) {
        toast.error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        setIsLoading(false);
        return;
      }

      if (currentPage === 1) {
        toast.success(`Hooray! We found ${totalHits} images!`);
      }

      if (currentPage * 12 >= totalHits) {
        setIsEnd(true);
        toast("We're sorry, but you've reached the end of search results.", {
          icon: '👏',
          css: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }

      setImages(prevImages =>
        currentPage === 1 ? hits : [...prevImages, ...hits]
      );
      setIsEnd(prevImages => prevImages.length + hits.length >= totalHits);
    } catch (error) {
      setIsError(true);
      toast.error('Oops, something went wrong! Reload this page!');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    if (searchQuery) {
      fetchImages();
    }
  }, [searchQuery, currentPage, fetchImages]);

  const handleSearchSubmit = query => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedCurrentQuery = searchQuery.toLowerCase();

    if (normalizedQuery === '') {
      alert('Empty string is not a valid search query. Please type again.');
      return;
    }

    if (normalizedQuery === normalizedCurrentQuery) {
      alert(
        'Search query is the same as the previous one. Please provide a new search query.'
      );
      return;
    }

    if (normalizedQuery !== normalizedCurrentQuery) {
      setSearchQuery(normalizedQuery);
      setCurrentPage(1);
      setImages([]);
      setIsLoading(true);
      setIsEnd(false);
    }
  };

  const handleLoadMore = () => {
    if (!isEnd) {
      setCurrentPage(prevPage => prevPage + 1);
    } else {
      alert("You've reached the end of the search results.");
    }
  };

  return (
    <>
      <div className={css.styleApp}>
        <Searchbar onSubmit={handleSearchSubmit} />
        {isLoading && <Loader />}
        <div style={{ position: 'relative' }}>
          <ImageGallery images={images} />
          {!isLoading && !isError && images.length > 0 && !isEnd && (
            <Button onClick={handleLoadMore} />
          )}
          {isError && <p>Something went wrong. Please try again later.</p>}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </div>
      {isLoading && <Loader />}
    </>
  );
};

export default App;
